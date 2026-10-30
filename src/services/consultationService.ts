import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Consultation, ChatMessage, UserProfile, ConsultationStatus } from '../types';
import { DEMO_EXPERTS } from '../data/seedExperts';

// Local storage key for fallback demo mock consultations when switching roles offline
const LOCAL_CONSULTATIONS_KEY = 'kisan_local_consultations';

function getLocalConsultations(): Consultation[] {
  try {
    const raw = localStorage.getItem(LOCAL_CONSULTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConsultations(list: Consultation[]) {
  localStorage.setItem(LOCAL_CONSULTATIONS_KEY, JSON.stringify(list));
}

export async function fetchExperts(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'expert'));
    const snapshot = await getDocs(q);
    
    const dbExperts: UserProfile[] = [];
    snapshot.forEach((d) => {
      dbExperts.push({ ...d.data(), id: d.id } as UserProfile);
    });

    // Merge with DEMO_EXPERTS to ensure the 3 demo experts are always available
    const mergedMap = new Map<string, UserProfile>();
    DEMO_EXPERTS.forEach(exp => mergedMap.set(exp.id, exp));
    dbExperts.forEach(exp => mergedMap.set(exp.id, exp));

    return Array.from(mergedMap.values());
  } catch (error) {
    console.warn('Using fallback demo experts:', error);
    return DEMO_EXPERTS;
  }
}

export async function createConsultation(booking: {
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  expertId: string;
  expertName: string;
  cropName: string;
  category: any;
  description: string;
  fee: number;
}): Promise<string> {
  const newBookingData = {
    ...booking,
    status: 'Pending' as ConsultationStatus,
    paymentStatus: 'Paid' as const, // Mock paid status as required
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'consultations'), newBookingData);
    
    // Also backup to local consultations for seamless dual-demo switching
    const local = getLocalConsultations();
    local.unshift({
      ...newBookingData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveLocalConsultations(local);

    return docRef.id;
  } catch (error) {
    console.warn('Firestore write fallback to local storage:', error);
    const mockId = 'consultation-' + Date.now();
    const local = getLocalConsultations();
    local.unshift({
      ...newBookingData,
      id: mockId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveLocalConsultations(local);
    return mockId;
  }
}

export function subscribeFarmerConsultations(
  farmerId: string,
  onUpdate: (consultations: Consultation[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'consultations'),
      where('farmerId', '==', farmerId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Consultation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt || new Date(),
          } as Consultation);
        });

        // Merge any local mock consultations for this farmer
        const local = getLocalConsultations().filter(c => c.farmerId === farmerId);
        const map = new Map<string, Consultation>();
        list.forEach(c => map.set(c.id, c));
        local.forEach(c => {
          if (!map.has(c.id)) map.set(c.id, c);
        });

        const merged = Array.from(map.values()).sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeB - timeA;
        });

        onUpdate(merged);
      },
      (error) => {
        console.warn('Farmer consultations listener error, falling back to local:', error);
        const local = getLocalConsultations().filter(c => c.farmerId === farmerId);
        onUpdate(local);
      }
    );

    return unsub;
  } catch (err) {
    const local = getLocalConsultations().filter(c => c.farmerId === farmerId);
    onUpdate(local);
    return () => {};
  }
}

export function subscribeExpertConsultations(
  expertId: string,
  onUpdate: (consultations: Consultation[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'consultations'),
      where('expertId', '==', expertId)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Consultation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt || new Date(),
          } as Consultation);
        });

        // Merge any local mock consultations for this expert
        const local = getLocalConsultations().filter(c => c.expertId === expertId);
        const map = new Map<string, Consultation>();
        list.forEach(c => map.set(c.id, c));
        local.forEach(c => {
          if (!map.has(c.id)) map.set(c.id, c);
        });

        const merged = Array.from(map.values()).sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeB - timeA;
        });

        onUpdate(merged);
      },
      (error) => {
        console.warn('Expert consultations listener error, falling back to local:', error);
        const local = getLocalConsultations().filter(c => c.expertId === expertId);
        onUpdate(local);
      }
    );

    return unsub;
  } catch (err) {
    const local = getLocalConsultations().filter(c => c.expertId === expertId);
    onUpdate(local);
    return () => {};
  }
}

export async function updateConsultationStatus(
  consultationId: string,
  newStatus: ConsultationStatus
): Promise<void> {
  try {
    const consultationRef = doc(db, 'consultations', consultationId);
    await updateDoc(consultationRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Firestore status update fallback to local:', error);
  }

  // Always update local storage mirror
  const local = getLocalConsultations();
  const index = local.findIndex(c => c.id === consultationId);
  if (index !== -1) {
    local[index].status = newStatus;
    local[index].updatedAt = new Date().toISOString();
    saveLocalConsultations(local);
  }
}

export function subscribeChatMessages(
  consultationId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const localKey = `kisan_chat_${consultationId}`;
  const getLocalChat = (): ChatMessage[] => {
    try {
      const r = localStorage.getItem(localKey);
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  };

  try {
    const messagesRef = collection(db, 'consultations', consultationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt || new Date(),
          } as ChatMessage);
        });

        // Merge with any local offline chat
        const local = getLocalChat();
        const map = new Map<string, ChatMessage>();
        msgs.forEach(m => map.set(m.id, m));
        local.forEach(m => {
          if (!map.has(m.id)) map.set(m.id, m);
        });

        const sorted = Array.from(map.values()).sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeA - timeB;
        });

        onUpdate(sorted);
      },
      (error) => {
        console.warn('Real-time chat listener error, fallback to local:', error);
        onUpdate(getLocalChat());
      }
    );

    return unsub;
  } catch (err) {
    onUpdate(getLocalChat());
    return () => {};
  }
}

export async function sendChatMessage(
  consultationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'farmer' | 'expert',
  text: string
): Promise<void> {
  const msgData = {
    consultationId,
    senderId,
    senderName,
    senderRole,
    text: text.trim(),
    createdAt: serverTimestamp(),
  };

  const localKey = `kisan_chat_${consultationId}`;
  const saveLocal = () => {
    try {
      const raw = localStorage.getItem(localKey);
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      list.push({
        id: 'msg-' + Date.now(),
        consultationId,
        senderId,
        senderName,
        senderRole,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(localKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Local chat save err:', e);
    }
  };

  try {
    const messagesRef = collection(db, 'consultations', consultationId, 'messages');
    await addDoc(messagesRef, msgData);

    // Also update parent consultation with lastMessage
    const consultationRef = doc(db, 'consultations', consultationId);
    await updateDoc(consultationRef, {
      lastMessage: text.trim(),
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    saveLocal();
  } catch (error) {
    console.warn('Firestore send message fallback:', error);
    saveLocal();
  }
}
