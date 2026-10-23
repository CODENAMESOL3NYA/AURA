import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Smartphone,
  Mail,
  Info,
  LogOut,
  ChevronRight,
  CheckCircle2,
  X,
  Shield
} from 'lucide-react';
import { useAuthAndSafety } from '../../context/AuthAndSafetyContext';
// Sprint 3: Re-enable these pages once they have default exports.
// import HomeAddresses from './HomeAddresses';
// import EmergencyContacts from './EmergencyContacts';
// import SafetySettings from './SafetySettings';

// Task 2: Standard iOS dimensions toggle
function SleekToggle({ active, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative flex items-center w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out shrink-0 ${
        active ? 'bg-rose-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    isUserLoading,
    setIsAuthenticated,
    setHasSeenOnboarding
  } = useAuthAndSafety();

  // Safety trigger state for hardware exit
  const [hardwareExitEnabled, setHardwareExitEnabled] = useState(true);

  // Active information modal state for secondary items
  const [activeInfoModal, setActiveInfoModal] = useState(null);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate('/auth');
  };

  return (
    <div className="flex-1 min-h-full bg-black text-white px-4 pt-10 pb-28 font-sans selection:bg-rose-500/30 flex flex-col justify-start">
      <div className="max-w-md mx-auto w-full space-y-6">
        
        {/* Task 1: Top User Identity Header with dynamic context consumption and skeleton loading */}
        <div className="flex items-center space-x-4 px-1 pt-1">
          {/* Left: Large circular avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 border border-white/5 shadow-inner">
            <User size={32} strokeWidth={2} />
          </div>

          {/* Right: Dynamic Name & Crimson Verified Citizen badge */}
          <div className="flex-1 min-w-0">
            {user?.fullName ? (
              <h1 className="text-xl font-semibold tracking-tight text-white leading-snug truncate">
                {user.fullName}
              </h1>
            ) : (
              <div className="animate-pulse bg-zinc-800 h-6 w-32 rounded"></div>
            )}

            <div className="flex items-center gap-2 mt-1">
              {user ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-500">
                  <CheckCircle2 size={12} className="text-rose-500" strokeWidth={2.5} />
                  {user.isVerified ? user.citizenStatus || 'Verified Citizen' : 'Pending Verification'}
                </span>
              ) : (
                <div className="animate-pulse bg-zinc-800 h-4 w-24 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Categorized Menu Lists */}

        {/* Group 1: Account */}
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider uppercase text-zinc-500 px-1">
            Account
          </p>
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            {/* Personal Details */}
            <div
              onClick={() => setActiveInfoModal('Personal Details')}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <User size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Personal Details
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Manage your identity information
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>

            {/* Sprint 3: Restore address management when its page is implemented.
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <MapPin size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Home Addresses
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Manage your residential details
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>
            */}

            {/* Sprint 3: Restore emergency contacts when its page is implemented.
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <Phone size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Emergency Contacts
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Manage who we alert
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>
            */}
          </div>
        </div>

        {/* Group 2: Safety & Triggers */}
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider uppercase text-zinc-500 px-1">
            Safety & Triggers
          </p>
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            {/* Sprint 1: Restore the disguise toggle after the stealth routes are implemented.
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center space-x-3.5 min-w-0 pr-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <EyeOff size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Stealth Mode Disguise
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Mask app as a daily planner
                  </p>
                </div>
              </div>
              <SleekToggle
                active={isStealthEnabled}
                onToggle={toggleStealthEnabled}
                label="Toggle Stealth Mode Disguise Quick Switch"
              />
            </div>
            */}

            {/* Rapid Hardware Exit */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center space-x-3.5 min-w-0 pr-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <Smartphone size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Rapid Hardware Exit
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Double-tap/shake to exit
                  </p>
                </div>
              </div>
              <SleekToggle
                active={hardwareExitEnabled}
                onToggle={() => setHardwareExitEnabled(!hardwareExitEnabled)}
                label="Toggle Rapid Hardware Exit"
              />
            </div>

            {/* Sprint 3: Restore settings when its page is implemented.
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <Settings size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Settings
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    App preferences and permissions
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>
            */}
          </div>
        </div>

        {/* Group 3: More */}
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider uppercase text-zinc-500 px-1">
            More
          </p>
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            {/* Support & Feedback */}
            <div
              onClick={() => setActiveInfoModal('Support & Feedback')}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <Mail size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    Support & Feedback
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>

            {/* About Aura */}
            <div
              onClick={() => setActiveInfoModal('About Aura')}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-300 shrink-0">
                  <Info size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    About Aura
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>

            {/* System Briefing Tour */}
            <div
              onClick={() => {
                try {
                  localStorage.removeItem('hasSeenOnboarding');
                } catch (e) {
                  // ignore
                }
                if (typeof setHasSeenOnboarding === 'function') {
                  setHasSeenOnboarding(false);
                }
                window.dispatchEvent(new CustomEvent('aura:replay-onboarding'));
              }}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-rose-500 shrink-0">
                  <Shield size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white tracking-tight leading-snug">
                    System Briefing Tour
                  </p>
                  <p className="text-xs text-zinc-400 tracking-tight truncate">
                    Replay the 3-step tactical overview
                  </p>
                </div>
              </div>
              <ChevronRight className="text-zinc-600 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>

            {/* Sign Out */}
            <div
              onClick={handleSignOut}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-rose-500/10 transition-colors text-rose-500"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                  <LogOut size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-rose-500 tracking-tight leading-snug">
                    Sign Out
                  </p>
                </div>
              </div>
              <ChevronRight className="text-rose-500/60 shrink-0 ml-2" size={18} strokeWidth={2} />
            </div>
          </div>
        </div>

      </div>

      {/* Task 5: Sub-page Overlays via Framer Motion sliding in from right */}
      {/* Sprint 3: Re-enable sub-page overlays when their pages are implemented.
      <AnimatePresence>
        {activeSubPage === 'addresses' && (
          <motion.div
            key="subpage-addresses"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-50 bg-black overflow-y-auto"
          >
            <HomeAddresses onBack={() => setActiveSubPage(null)} />
          </motion.div>
        )}

        {activeSubPage === 'contacts' && (
          <motion.div
            key="subpage-contacts"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-50 bg-black overflow-y-auto"
          >
            <EmergencyContacts onBack={() => setActiveSubPage(null)} />
          </motion.div>
        )}

        {activeSubPage === 'settings' && (
          <motion.div
            key="subpage-settings"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-0 z-50 bg-black overflow-y-auto"
          >
            <SafetySettings onBack={() => setActiveSubPage(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      */}

      {/* Information Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {activeInfoModal}
              </h2>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="py-2 text-sm text-zinc-400 space-y-3">
              {activeInfoModal === 'Personal Details' && (
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500">Legal Full Name</p>
                    {user?.fullName ? (
                      <p className="text-sm text-white font-medium">{user.fullName}</p>
                    ) : (
                      <div className="animate-pulse bg-zinc-800 h-5 w-32 rounded"></div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500">Contact Number</p>
                    {user?.phoneNumber ? (
                      <p className="text-sm text-zinc-300 font-mono">{user.phoneNumber}</p>
                    ) : (
                      <div className="animate-pulse bg-zinc-800 h-5 w-32 rounded"></div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500">South African ID Number</p>
                    {user?.idNumber ? (
                      <p className="text-sm text-zinc-300 font-mono">
                        {user.idNumber.length === 13 ? `${user.idNumber.slice(0, 6)}•••••${user.idNumber.slice(-2)}` : user.idNumber}
                      </p>
                    ) : (
                      <div className="animate-pulse bg-zinc-800 h-5 w-36 rounded"></div>
                    )}
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <p className="text-xs text-zinc-500">ID Verification Status</p>
                    {user ? (
                      <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                        <Shield size={14} /> {user.isVerified ? 'SA National Identity Verified' : 'Pending Verification'}
                      </p>
                    ) : (
                      <div className="animate-pulse bg-zinc-800 h-5 w-40 rounded"></div>
                    )}
                  </div>
                </div>
              )}

              {activeInfoModal === 'Support & Feedback' && (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-2 text-xs text-zinc-300">
                  <p className="text-white font-medium text-sm">Aura Rapid Tactical Support</p>
                  <p>Toll-Free Dispatch: 0800 150 150</p>
                  <p>Operations Command: dispatch@aura-response.co.za</p>
                </div>
              )}

              {activeInfoModal === 'About Aura' && (
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1.5 text-xs text-zinc-400">
                  <p className="text-white font-medium text-sm">Aura Rapid Response v2.4.0</p>
                  <p>Architected for the FNB Hackathon • South Africa</p>
                  <p className="text-[11px] text-zinc-500 pt-1">OLED Dark Mode Engine with Dual-Layer Stealth Masking</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
