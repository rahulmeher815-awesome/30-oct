import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, ProblemCategory } from '../../types';
import { Sprout, Mail, Lock, User, MapPin, Award, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { DEMO_EXPERTS, DEMO_FARMER } from '../../data/seedExperts';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, loginWithEmail, signupWithEmail, setDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('farmer');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Farmer fields
  const [location, setLocation] = useState('');
  
  // Expert fields
  const [experience, setExperience] = useState(5);
  const [fee, setFee] = useState(250);
  const [bio, setBio] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<ProblemCategory[]>(['Pest', 'Disease']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CATEGORIES: ProblemCategory[] = ['Pest', 'Disease', 'Soil', 'Irrigation', 'Fertilizer', 'Other'];

  const toggleCategory = (cat: ProblemCategory) => {
    setSelectedExpertise((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(role);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err?.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your name.');
        if (!email.trim()) throw new Error('Please enter your email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        if (role === 'farmer' && !location.trim()) {
          throw new Error('Please enter your location (village/district/state).');
        }
        if (role === 'expert') {
          if (selectedExpertise.length === 0) {
            throw new Error('Please select at least one area of expertise.');
          }
          if (!fee || fee <= 0) {
            throw new Error('Please enter a valid consultation fee.');
          }
        }

        await signupWithEmail(email, password, role, name, {
          location: role === 'farmer' ? location.trim() : undefined,
          expertise: role === 'expert' ? selectedExpertise : undefined,
          experience: role === 'expert' ? Number(experience) : undefined,
          fee: role === 'expert' ? Number(fee) : undefined,
          bio: role === 'expert' ? bio.trim() : undefined,
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/40 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* College Project Quick Demo Banner */}
      <div className="max-w-md w-full mx-auto mb-6 bg-emerald-900 text-white rounded-2xl p-4 shadow-xl border border-emerald-700">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
          <h3 className="font-semibold text-sm tracking-wide text-emerald-100">
            College Project Quick Demo Access
          </h3>
        </div>
        <p className="text-xs text-emerald-200/90 mb-3">
          Jump right in without typing credentials. Switch between roles to test booking & real-time chat:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDemoUser(DEMO_FARMER.id)}
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg p-2 text-left transition flex flex-col"
          >
            <span className="font-semibold text-white">🌾 Rajesh (Farmer)</span>
            <span className="text-[10px] text-emerald-200">Rampur, UP</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser(DEMO_EXPERTS[0].id)}
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg p-2 text-left transition flex flex-col"
          >
            <span className="font-semibold text-white">🔬 Dr. Ramesh (Expert)</span>
            <span className="text-[10px] text-emerald-200">Pest & Disease (₹250)</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser(DEMO_EXPERTS[1].id)}
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg p-2 text-left transition flex flex-col"
          >
            <span className="font-semibold text-white">🔬 Sunita (Expert)</span>
            <span className="text-[10px] text-emerald-200">Soil & Irrigation (₹180)</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoUser(DEMO_EXPERTS[2].id)}
            className="bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-lg p-2 text-left transition flex flex-col"
          >
            <span className="font-semibold text-white">🔬 Dr. Anand (Expert)</span>
            <span className="text-[10px] text-emerald-200">Fertilizers (₹300)</span>
          </button>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-6 text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-700/80 border border-emerald-500 flex items-center justify-center mb-3 shadow-inner">
            <Sprout className="w-8 h-8 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">KisanExpert</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Agricultural Consultation & Advisory Platform
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 bg-gray-50/70">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector at signup */}
          {mode === 'signup' && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Choose Your Role:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    role === 'farmer'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">🌾</span>
                  <div>
                    <p className="text-xs font-bold">Farmer</p>
                    <p className="text-[10px] text-gray-500">Ask & get advice</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('expert')}
                  className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                    role === 'expert'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">🔬</span>
                  <div>
                    <p className="text-xs font-bold">Agri Expert</p>
                    <p className="text-[10px] text-gray-500">Give advice & earn</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition mb-4 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google {mode === 'signup' ? `as ${role === 'farmer' ? 'Farmer' : 'Expert'}` : ''}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400 uppercase tracking-wider">
                Or with Email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name
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
                    placeholder={role === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Dr. Anand Verma'}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Farmer specific fields on signup */}
            {mode === 'signup' && role === 'farmer' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    placeholder="e.g. Rampur, Varanasi, Uttar Pradesh"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Plain text only — no GPS or maps permission needed.
                </p>
              </div>
            )}

            {/* Expert specific fields on signup */}
            {mode === 'signup' && role === 'expert' && (
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Areas of Expertise (select all that apply):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSel = selectedExpertise.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition font-medium ${
                            isSel
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}{cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={fee}
                      onChange={(e) => setFee(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Short Bio & Qualifications
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. M.Sc. Agronomy with expertise in plant disease diagnosis and pest control..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Dashboard' : `Register as ${role === 'farmer' ? 'Farmer' : 'Expert'}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
