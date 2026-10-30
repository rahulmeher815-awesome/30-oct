import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, LogOut, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { DEMO_EXPERTS, DEMO_FARMER } from '../data/seedExperts';

export const Navbar: React.FC = () => {
  const { profile, logout, setDemoUser } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md border-b border-emerald-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <Sprout className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
                Kisan<span className="text-emerald-300">Expert</span>
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-200 border border-emerald-600">
                Agri Consult
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 hidden sm:block">
              Farmer & Agricultural Expert Advisory
            </p>
          </div>
        </div>

        {/* User Info & Demo Switcher */}
        {profile && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Switcher Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 border border-emerald-600 transition"
                title="Switch between Farmer & Expert demo accounts"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden md:inline">Switch Role</span>
                <span className="md:hidden">Demo</span>
              </button>

              {/* Demo Switcher Dropdown */}
              {showDemoMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowDemoMenu(false)}
                >
                  <div className="px-3 py-1.5 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quick Demo Switcher
                  </div>
                  
                  <div className="py-1">
                    <p className="px-3 py-1 text-[11px] text-emerald-700 font-medium">Farmers:</p>
                    <button
                      onClick={() => setDemoUser(DEMO_FARMER.id)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between transition"
                    >
                      <span className="font-medium text-gray-900">{DEMO_FARMER.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">Farmer</span>
                    </button>
                  </div>

                  <div className="py-1 border-t border-gray-100">
                    <p className="px-3 py-1 text-[11px] text-emerald-700 font-medium">Experts:</p>
                    {DEMO_EXPERTS.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => setDemoUser(exp.id)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between transition"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{exp.name}</p>
                          <p className="text-[10px] text-gray-500">{exp.expertise?.join(', ')} • ₹{exp.fee}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Expert</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Profile Pill */}
            <div className="flex items-center space-x-2 bg-emerald-900/60 border border-emerald-700 px-2.5 py-1 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                {profile.role === 'farmer' ? '🌾' : '🔬'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {profile.name}
                </p>
                <p className="text-[10px] text-emerald-300 capitalize flex items-center space-x-1">
                  <span>{profile.role}</span>
                  {profile.role === 'expert' && <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 inline" />}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
