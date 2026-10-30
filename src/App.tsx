import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/auth/AuthScreen';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { ExpertDashboard } from './components/expert/ExpertDashboard';
import { testConnection } from './firebase/config';
import { seedDemoExpertsIfMissing } from './data/seedExperts';
import { Sprout } from 'lucide-react';

const MainApp: React.FC = () => {
  const { profile, role, loading } = useAuth();

  useEffect(() => {
    // Validate Firestore connection and seed demo experts on app startup
    testConnection();
    seedDemoExpertsIfMissing();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-800 border border-emerald-600 flex items-center justify-center mb-4 shadow-xl animate-bounce">
          <Sprout className="w-8 h-8 text-emerald-300" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">KisanExpert</h2>
        <p className="text-xs text-emerald-300 mt-1">Connecting Farmers & Agri Experts...</p>
        <div className="mt-6 w-32 h-1 bg-emerald-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // If unauthenticated or no profile, display Login / Signup Screen
  if (!profile) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 text-gray-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {role === 'farmer' ? <FarmerDashboard /> : <ExpertDashboard />}
      </main>
      
      {/* College Project Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t border-gray-200/60 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="font-medium text-emerald-800">
            KisanExpert • College Project
          </p>
          <p className="text-[11px] text-gray-400">
            React + Firebase Firestore Real-Time Chat & Consultation System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
