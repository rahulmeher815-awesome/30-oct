import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Check, Save } from 'lucide-react';

export const FarmerProfile: React.FC = () => {
  const { profile, updateProfileData } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfileData({
        name: name.trim(),
        location: location.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating farmer profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Farmer Profile</h2>
              <p className="text-xs text-gray-500">
                Your plain text details shared with agricultural experts
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Farmer Full Name
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Location (Village / District / State)
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rampur Village, Varanasi District, Uttar Pradesh"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Typed as plain text. No GPS, Google Maps, or location permissions required.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
