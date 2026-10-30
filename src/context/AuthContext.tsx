import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { DEMO_EXPERTS, DEMO_FARMER } from '../data/seedExperts';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signInWithGoogle: (chosenRole?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (
    email: string, 
    pass: string, 
    role: UserRole, 
    name: string, 
    extra?: Partial<UserProfile>
  ) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  setDemoUser: (demoId: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(() => {
    return localStorage.getItem('kisan_active_demo_user');
  });

  // Listen to Firebase Auth state
  useEffect(() => {
    // If active demo user is selected in local storage, check if demo mode active
    if (activeDemoId) {
      const demoUser = [...DEMO_EXPERTS, DEMO_FARMER].find(u => u.id === activeDemoId);
      if (demoUser) {
        // Also check if user modified demo profile in localStorage
        const savedCustom = localStorage.getItem(`kisan_demo_profile_${demoUser.id}`);
        const effectiveProfile = savedCustom ? JSON.parse(savedCustom) : demoUser;
        setProfile(effectiveProfile);
        setCurrentUser(null);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          // Subscribe to real-time changes to the user's profile
          const unsubDoc = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }, (err) => {
            console.error('Error listening to user profile:', err);
            setLoading(false);
          });
          return () => unsubDoc();
        } catch (err) {
          console.error('Error fetching user document:', err);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activeDemoId]);

  const signInWithGoogle = async (chosenRole: UserRole = 'farmer') => {
    setLoading(true);
    setActiveDemoId(null);
    localStorage.removeItem('kisan_active_demo_user');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || 'Farmer',
          email: user.email || '',
          role: chosenRole,
          location: chosenRole === 'farmer' ? 'Village / District / State' : undefined,
          expertise: chosenRole === 'expert' ? ['Pest', 'Disease'] : undefined,
          experience: chosenRole === 'expert' ? 5 : undefined,
          fee: chosenRole === 'expert' ? 200 : undefined,
          isAvailable: chosenRole === 'expert' ? true : undefined,
          bio: chosenRole === 'expert' ? 'Agricultural consultant ready to help farmers.' : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(snap.data() as UserProfile);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setActiveDemoId(null);
    localStorage.removeItem('kisan_active_demo_user');
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', res.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signupWithEmail = async (
    email: string, 
    pass: string, 
    role: UserRole, 
    name: string, 
    extra?: Partial<UserProfile>
  ) => {
    setLoading(true);
    setActiveDemoId(null);
    localStorage.removeItem('kisan_active_demo_user');
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const user = res.user;
      const newProfile: UserProfile = {
        id: user.uid,
        name: name.trim(),
        email: email.trim(),
        role: role,
        location: role === 'farmer' ? (extra?.location || '') : undefined,
        expertise: role === 'expert' ? (extra?.expertise || ['Pest']) : undefined,
        experience: role === 'expert' ? (extra?.experience || 3) : undefined,
        fee: role === 'expert' ? (extra?.fee || 200) : undefined,
        isAvailable: role === 'expert' ? true : undefined,
        bio: role === 'expert' ? (extra?.bio || '') : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, newProfile);
      setProfile(newProfile);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    
    // If it's a demo user, update local storage state
    if (activeDemoId) {
      const updated = { ...profile, ...data, updatedAt: new Date().toISOString() };
      setProfile(updated);
      localStorage.setItem(`kisan_demo_profile_${activeDemoId}`, JSON.stringify(updated));
      return;
    }

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const updated = {
          ...data,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, updated, { merge: true });
        setProfile((prev) => (prev ? { ...prev, ...updated } : null));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const setDemoUser = (demoId: string) => {
    setLoading(true);
    if (demoId === 'logout') {
      setActiveDemoId(null);
      localStorage.removeItem('kisan_active_demo_user');
      setProfile(null);
      setLoading(false);
      return;
    }

    const demoUser = [...DEMO_EXPERTS, DEMO_FARMER].find(u => u.id === demoId);
    if (demoUser) {
      const savedCustom = localStorage.getItem(`kisan_demo_profile_${demoUser.id}`);
      const effective = savedCustom ? JSON.parse(savedCustom) : demoUser;
      setActiveDemoId(demoId);
      localStorage.setItem('kisan_active_demo_user', demoId);
      setProfile(effective);
      setCurrentUser(null);
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setActiveDemoId(null);
    localStorage.removeItem('kisan_active_demo_user');
    try {
      await signOut(auth);
      setProfile(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role: profile?.role || null,
        loading,
        signInWithGoogle,
        loginWithEmail,
        signupWithEmail,
        updateProfileData,
        setDemoUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
