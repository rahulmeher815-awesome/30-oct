import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProblemCategory } from '../../types';
import { User, Award, IndianRupee, FileText, Check, Save, ShieldCheck } from 'lucide-react';

const ALL_CATEGORIES: ProblemCategory[] = ['Pest', 'Disease', 'Soil', 'Irrigation', 'Fertilizer', 'Other'];

export const ExpertProfile: React.FC = () => {
  const { profile, updateProfileData } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [expertise, setExpertise] = useState<ProblemCategory[]>(profile?.expertise || ['Pest']);
  const [experience, setExperience] = useState<number>(profile?.experience || 5);
  const [fee, setFee] = useState<number>(profile?.fee || 250);
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleCategory = (cat: ProblemCategory) => {
    setExpertise((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (expertise.length === 0) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfileData({
        name: name.trim(),
        expertise,
        experience: Number(experience),
        fee: Number(fee),
        bio: bio.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving expert profile:', err);
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
              🔬
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-lg font-bold text-gray-900">Expert Profile & Fee</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">
                Update your consultation fee, specialties, and bio anytime
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Expert profile and fee updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name & Title
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
                placeholder="e.g. Dr. Ramesh Patel"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Consultation Fee (Editable anytime) */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Consultation Fee (₹ per consultation)
            </label>
            <div className="relative rounded-lg shadow-sm max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-emerald-700">
                ₹
              </div>
              <input
                type="number"
                min="50"
                step="25"
                required
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="block w-full pl-8 pr-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-emerald-900 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Farmers pay this fee when booking. You can edit this anytime.
            </p>
          </div>

          {/* Expertise Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Expertise Areas (Multi-select)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = expertise.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience in years */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Years of Experience
            </label>
            <div className="relative rounded-lg shadow-sm max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Award className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Short Bio & Research Background
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Ph.D. in Entomology with 14 years advising cotton, wheat, and mustard farmers..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile & Fee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
