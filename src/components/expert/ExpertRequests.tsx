import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Consultation } from '../../types';
import { 
  subscribeExpertConsultations, 
  updateConsultationStatus 
} from '../../services/consultationService';
import { 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Sprout, 
  MessageSquare, 
  AlertCircle,
  Calendar,
  IndianRupee
} from 'lucide-react';

interface ExpertRequestsProps {
  onOpenChat: (consultation: Consultation) => void;
}

export const ExpertRequests: React.FC<ExpertRequestsProps> = ({ onOpenChat }) => {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    const unsub = subscribeExpertConsultations(profile.id, (data) => {
      setConsultations(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.id]);

  const pendingRequests = consultations.filter((c) => c.status === 'Pending');

  const handleAccept = async (c: Consultation) => {
    setActionLoadingId(c.id);
    try {
      await updateConsultationStatus(c.id, 'Accepted');
    } catch (err) {
      console.error('Failed to accept request:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (c: Consultation) => {
    setActionLoadingId(c.id);
    try {
      await updateConsultationStatus(c.id, 'Declined');
    } catch (err) {
      console.error('Failed to decline request:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500">Checking for incoming booking requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-gray-900">Incoming Consultation Requests</h3>
          <p className="text-xs text-gray-500">
            Review farmer questions and location, then accept to start real-time consultation
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {pendingRequests.length} Pending
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-200 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">No Pending Requests</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You're all caught up! New booking requests from farmers seeking your expertise will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    🌾
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{req.farmerName}</h4>
                    <p className="text-xs text-gray-600 flex items-center mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
                      <span>{req.farmerLocation || 'Location not specified'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Fee: ₹{req.fee} (Paid)
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {req.category}
                  </span>
                </div>
              </div>

              {/* Crop & Problem details */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 mb-4 text-xs space-y-1.5">
                <div className="flex items-center space-x-2 font-medium text-gray-800">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Crop: <strong className="text-gray-900">{req.cropName}</strong></span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5 font-medium">Farmer's Question:</span>
                  <p className="text-gray-700 leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-200">
                    {req.description}
                  </p>
                </div>
              </div>

              {/* Accept / Decline actions */}
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleDecline(req)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleAccept(req)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{actionLoadingId === req.id ? 'Accepting...' : 'Accept Consultation'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
