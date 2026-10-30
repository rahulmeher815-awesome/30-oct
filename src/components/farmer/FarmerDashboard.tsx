import React, { useState } from 'react';
import { AskQuestion } from './AskQuestion';
import { FarmerConsultations } from './FarmerConsultations';
import { FarmerProfile } from './FarmerProfile';
import { ChatRoom } from '../chat/ChatRoom';
import { Consultation } from '../../types';
import { Sprout, MessageSquare, User, HelpCircle } from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ask' | 'consultations' | 'profile'>('ask');
  const [activeChatConsultation, setActiveChatConsultation] = useState<Consultation | null>(null);

  // If chat is open, show the chat screen
  if (activeChatConsultation) {
    return (
      <ChatRoom
        consultation={activeChatConsultation}
        onBack={() => setActiveChatConsultation(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Navigation tabs */}
      <div className="flex bg-emerald-900/10 p-1.5 rounded-2xl mb-6 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('ask')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'ask'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-gray-700 hover:text-emerald-900'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Ask Question</span>
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'consultations'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-gray-700 hover:text-emerald-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Consultations</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-gray-700 hover:text-emerald-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === 'ask' && (
        <AskQuestion onBookingCreated={() => setActiveTab('consultations')} />
      )}

      {activeTab === 'consultations' && (
        <FarmerConsultations
          onOpenChat={(consultation) => setActiveChatConsultation(consultation)}
          onGoToAsk={() => setActiveTab('ask')}
        />
      )}

      {activeTab === 'profile' && <FarmerProfile />}
    </div>
  );
};
