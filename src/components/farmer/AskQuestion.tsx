import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemCategory, UserProfile } from '../../types';
import { fetchExperts, createConsultation } from '../../services/consultationService';
import { 
  Sprout, 
  Bug, 
  Stethoscope, 
  Droplets, 
  Layers, 
  FlaskConical, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  CreditCard, 
  X, 
  ArrowRight,
  ShieldAlert,
  MapPin
} from 'lucide-react';

interface AskQuestionProps {
  onBookingCreated: () => void;
}

const CATEGORIES: { label: ProblemCategory; icon: any; color: string }[] = [
  { label: 'Pest', icon: Bug, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Disease', icon: Stethoscope, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { label: 'Soil', icon: Layers, color: 'text-amber-800 bg-amber-100/60 border-amber-300' },
  { label: 'Irrigation', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Fertilizer', icon: FlaskConical, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { label: 'Other', icon: HelpCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
];

const COMMON_CROPS = ['Cotton', 'Paddy (Rice)', 'Wheat', 'Tomato', 'Sugarcane', 'Mustard', 'Maize', 'Chili'];

export const AskQuestion: React.FC<AskQuestionProps> = ({ onBookingCreated }) => {
  const { profile } = useAuth();
  
  // Question form state
  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Pest');
  const [description, setDescription] = useState('');
  
  // Experts list & matching
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  
  // Booking modal
  const [selectedExpert, setSelectedExpert] = useState<UserProfile | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [farmerLocationInput, setFarmerLocationInput] = useState(profile?.location || '');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingExperts(true);
      try {
        const list = await fetchExperts();
        setExperts(list);
      } finally {
        setLoadingExperts(false);
      }
    }
    load();
  }, []);

  // Update farmer location input if profile changes
  useEffect(() => {
    if (profile?.location) {
      setFarmerLocationInput(profile.location);
    }
  }, [profile?.location]);

  // Match experts based on chosen category or crop
  const matchedExperts = experts.filter((exp) => {
    if (!exp.expertise || exp.expertise.length === 0) return true;
    return exp.expertise.includes(category);
  });

  // Other experts if not matched directly
  const otherExperts = experts.filter((exp) => {
    return !matchedExperts.some((m) => m.id === exp.id);
  });

  const handleOpenBooking = (expert: UserProfile) => {
    setFormError(null);
    if (!cropName.trim()) {
      setFormError('Please enter the crop name before selecting an expert.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe the problem symptoms before selecting an expert.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedExpert(expert);
  };

  const handleConfirmBooking = async () => {
    if (!selectedExpert || !profile) return;
    if (!farmerLocationInput.trim()) {
      setFormError('Please provide your location (village/district/state).');
      return;
    }

    setSubmittingBooking(true);
    setFormError(null);
    try {
      await createConsultation({
        farmerId: profile.id,
        farmerName: profile.name || 'Farmer',
        farmerLocation: farmerLocationInput.trim(),
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        cropName: cropName.trim(),
        category,
        description: description.trim(),
        fee: selectedExpert.fee || 200,
      });

      setSelectedExpert(null);
      // Reset form
      setCropName('');
      setDescription('');
      onBookingCreated();
    } catch (err: any) {
      console.error('Booking failed:', err);
      setFormError(err?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ask Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/60 border border-emerald-400 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Ask an Agricultural Expert</h2>
              <p className="text-xs text-emerald-200">
                Specify your crop and problem to see verified matching experts
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Crop Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              1. Crop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Cotton, Wheat, Paddy, Tomato, Mustard..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-gray-500 self-center mr-1">Popular:</span>
              {COMMON_CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => setCropName(crop)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    cropName === crop
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              2. Problem Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map(({ label, icon: Icon, color }) => {
                const isSelected = category === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setCategory(label)}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              3. Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: leaf discoloration, white flies on underside, stem rot, moisture issues, pest damage..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Matching Experts Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
              <span>Matching Experts for {category}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-semibold">
                {matchedExperts.length} Available
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Matched based on expertise in {category} category
            </p>
          </div>
        </div>

        {loadingExperts ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading verified agricultural experts...</p>
          </div>
        ) : matchedExperts.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-gray-200">
            <p className="text-sm font-medium text-gray-600">No specific expert found for {category}.</p>
            <p className="text-xs text-gray-400 mt-1">Check general agricultural consultants below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl font-bold text-emerald-800">
                        👨‍🌾
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {expert.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center text-emerald-700 font-medium">
                            <Award className="w-3.5 h-3.5 mr-1" />
                            {expert.experience || 5}+ yrs exp
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Fee Badge */}
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-700">₹{expert.fee || 200}</span>
                      <p className="text-[10px] text-gray-400">per consult</p>
                    </div>
                  </div>

                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {expert.expertise?.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          tag === category
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {expert.bio && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {expert.bio}
                    </p>
                  )}
                </div>

                {/* Book Consultation Button */}
                <button
                  type="button"
                  onClick={() => handleOpenBooking(expert)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <span>Book Consultation (₹{expert.fee || 200})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Other Available Experts */}
        {otherExperts.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Other Agricultural Experts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:border-emerald-200 transition flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{expert.name}</h4>
                      <p className="text-xs text-gray-500">{expert.experience || 3}+ yrs exp</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">₹{expert.fee || 200}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {expert.expertise?.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(expert)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    Book Consultation (₹{expert.fee || 200})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking & Mock Payment Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Confirm Consultation & Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExpert(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Consultation Summary */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Selected Expert:</span>
                  <span className="font-bold text-gray-900">{selectedExpert.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Crop:</span>
                  <span className="font-semibold text-gray-800">{cropName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Problem Summary:</span>
                  <p className="text-gray-700 bg-white p-2 rounded-lg border border-emerald-200 line-clamp-3">
                    {description}
                  </p>
                </div>
              </div>

              {/* Farmer Location Confirmation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Your Location (Village/District/State)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={farmerLocationInput}
                    onChange={(e) => setFarmerLocationInput(e.target.value)}
                    placeholder="e.g. Rampur Village, Varanasi District, UP"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  The expert needs your location to advise based on regional climate & soil.
                </p>
              </div>

              {/* Payment Breakdown (College Project Mock) */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Expert Consultation Fee</span>
                  <span className="font-semibold text-gray-900">₹{selectedExpert.fee || 200}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Platform Fee (College Project)</span>
                  <span className="text-emerald-700 font-semibold">FREE (₹0)</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold text-sm text-gray-900">
                  <span>Total Payable:</span>
                  <span className="text-base text-emerald-700">₹{selectedExpert.fee || 200}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mock Payment mode: Will be recorded as "Paid" automatically.</span>
                </div>
              </div>

              {/* Confirm Booking CTA */}
              <button
                type="button"
                disabled={submittingBooking || !farmerLocationInput.trim()}
                onClick={handleConfirmBooking}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>
                  {submittingBooking
                    ? 'Processing Booking...'
                    : `Confirm Booking & Pay ₹${selectedExpert.fee || 200}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-gray-400">
                Booking status will be set to "Pending" until {selectedExpert.name} accepts it. Real-time chat activates upon acceptance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
