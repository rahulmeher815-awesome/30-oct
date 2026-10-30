import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Consultation } from '../../types';
import { subscribeFarmerConsultations } from '../../services/consultationService';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Sprout,
  Calendar,
  IndianRupee
} from 'lucide-react';

interface FarmerConsultationsProps {
  onOpenChat: (consultation: Consultation) => void;
  onGoToAsk: () => void;
}

export const FarmerConsultations: React.FC<FarmerConsultationsProps> = ({
  onOpenChat,
  onGoToAsk,
}) => {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    const unsub = subscribeFarmerConsultations(profile.id, (data) => {
      setConsultations(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.id]);

  const getStatusBadge = (status: Consultation['status']) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Accepted • Ready to Chat
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Pending Expert Acceptance
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            Declined
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            <CheckCircle className="w-3.5 h-3.5 mr-1 text-gray-600" />
            Completed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500">Loading your consultations...</p>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-emerald-100 shadow-sm max-w-lg mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sprout className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Consultations Yet</h3>
        <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
          Have an issue with your crops, pests, soil, or irrigation? Ask our verified agricultural experts now.
        </p>
        <button
          onClick={onGoToAsk}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <span>Ask a Question & Find Expert</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-gray-900">My Consultations</h3>
          <p className="text-xs text-gray-500">
            Track your consultation bookings and real-time chat with experts
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          {consultations.length} Total
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {consultations.map((consultation) => {
          const isAccepted = consultation.status === 'Accepted';
          return (
            <div
              key={consultation.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition ${
                isAccepted ? 'border-emerald-300 ring-1 ring-emerald-500/20' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-base flex-shrink-0">
                    🔬
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        {consultation.expertName}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                        {consultation.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Crop: <span className="font-semibold text-gray-800">{consultation.cropName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  {getStatusBadge(consultation.status)}
                  <div className="text-xs font-semibold text-emerald-700 flex items-center mt-1">
                    <span>Fee: ₹{consultation.fee}</span>
                    <span className="ml-1.5 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {consultation.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 border border-gray-100 mb-4">
                <span className="font-semibold text-gray-500 block mb-0.5">Your Question:</span>
                <p className="line-clamp-2">{consultation.description}</p>
              </div>

              {/* Chat Action or Status message */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {consultation.createdAt
                      ? new Date(consultation.createdAt).toLocaleDateString()
                      : 'Recently booked'}
                  </span>
                </div>

                {isAccepted ? (
                  <button
                    onClick={() => onOpenChat(consultation)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Live Chat</span>
                  </button>
                ) : consultation.status === 'Pending' ? (
                  <p className="text-xs text-amber-700 font-medium">
                    Waiting for {consultation.expertName} to accept...
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">
                    Consultation {consultation.status.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
