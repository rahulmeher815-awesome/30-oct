import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Consultation } from '../../types';
import { 
  subscribeExpertConsultations, 
  updateConsultationStatus 
} from '../../services/consultationService';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Sprout
} from 'lucide-react';

interface ExpertConsultationsProps {
  onOpenChat: (consultation: Consultation) => void;
}

export const ExpertConsultations: React.FC<ExpertConsultationsProps> = ({ onOpenChat }) => {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    const unsub = subscribeExpertConsultations(profile.id, (data) => {
      setConsultations(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.id]);

  // Filter accepted and completed
  const activeOrCompleted = consultations.filter((c) => c.status === 'Accepted' || c.status === 'Completed');

  const handleMarkCompleted = async (id: string) => {
    try {
      await updateConsultationStatus(id, 'Completed');
    } catch (err) {
      console.error('Failed to mark completed:', err);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-gray-900">Active Consultations</h3>
          <p className="text-xs text-gray-500">
            Real-time chat with farmers who booked your consultation
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          {activeOrCompleted.length} Total
        </span>
      </div>

      {activeOrCompleted.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">No Active Consultations Yet</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Once you accept booking requests from farmers, they will appear here with instant live chat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeOrCompleted.map((c) => {
            const isAccepted = c.status === 'Accepted';
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      🌾
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-900 text-base">{c.farmerName}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
                        <span>{c.farmerLocation}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">₹{c.fee}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 border border-gray-100 mb-4">
                  <span className="font-semibold text-gray-600 block mb-0.5">
                    Crop: <strong>{c.cropName}</strong>
                  </span>
                  <p className="line-clamp-2 text-gray-600">{c.description}</p>
                </div>

                {/* Chat Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-[11px] text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Consultation'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => handleMarkCompleted(c.id)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenChat(c)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAccepted ? 'Open Real-Time Chat' : 'View Chat History'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
