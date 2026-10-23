import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown, 
  VolumeX, 
  SunDim, 
  Lock, 
  FileText, 
  Lightbulb, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Home,
  Compass,
  EyeOff,
  Radio
} from 'lucide-react';
import { useAuthAndSafety } from '../context/AuthAndSafetyContext';

export default function SafetyDrawer() {
  const { activeEmergency, isStealthMode } = useAuthAndSafety();

  const [isThreatInside, setIsThreatInside] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [screenDimmed, setScreenDimmed] = useState(false);

  if (!activeEmergency) return null;

  return (
    <>
      {/* Screen Blackout Overlay Mode */}
      <AnimatePresence>
        {screenDimmed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setScreenDimmed(false)}
            className="fixed inset-0 bg-black/98 z-[9999] flex items-center justify-center p-4 cursor-pointer"
            title="Tap screen to restore"
          >
            <div className="text-center text-zinc-600 text-xs font-mono">
              <SunDim className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-500" />
              <p>Screen Blackout Active &bull; Responders tracking live GPS</p>
              <p className="text-[10px] text-zinc-700 mt-1">Tap anywhere to restore screen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Up Spring Physics Safety Drawer */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: isExpanded ? 0 : 'calc(100% - 3.25rem)' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-40 font-sans pointer-events-auto"
      >
        <div className="max-w-md mx-auto px-2 sm:px-4">
          <div
            className={`rounded-t-[32px] shadow-2xl border transition-colors ${
              isStealthMode
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#0f0f11] border-zinc-800 text-white'
            }`}
          >
            {/* Drawer Header Handle */}
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-3.5 flex items-center justify-between cursor-pointer select-none rounded-t-[32px] border-b ${
                isStealthMode ? 'border-slate-100 hover:bg-slate-50' : 'border-zinc-800 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div 
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isStealthMode 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-rose-950 text-rose-500 border border-rose-500/30'
                  }`}
                >
                  {isStealthMode ? <FileText className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 animate-pulse" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight flex items-center space-x-1.5">
                    <span>{isStealthMode ? 'Environment Checklist & Protocols' : 'Tactical Safety Protocols'}</span>
                    <span 
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isStealthMode ? 'bg-slate-100 text-slate-600' : 'bg-rose-600 text-white'
                      }`}
                    >
                      LIVE ADVICE
                    </span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {isExpanded ? 'Tap to collapse' : 'Tap to expand life-safety steps'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-zinc-400">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </div>

            {/* Expanded Drawer Content */}
            {isExpanded && (
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* 1. Dynamic Toggle: Is Threat Inside the Premises? */}
                <div 
                  className={`p-3 rounded-2xl border ${
                    isStealthMode ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
                  }`}
                >
                  <label className="block text-xs font-semibold mb-2">
                    Is the threat inside the premises?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsThreatInside(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                        isThreatInside
                          ? isStealthMode
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-rose-600 text-white shadow-rose-600/30 shadow-md'
                          : isStealthMode
                          ? 'bg-white text-slate-600 border border-slate-200'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <span>Yes (Threat Inside)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsThreatInside(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                        !isThreatInside
                          ? isStealthMode
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md'
                          : isStealthMode
                          ? 'bg-white text-slate-600 border border-slate-200'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <span>No (Threat Outside)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Dynamic Instructions based on Threat Location */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400">
                    {isThreatInside ? 'Immediate Survival Steps (Threat Inside)' : 'Responder Preparation Steps (Threat Outside)'}
                  </h5>

                  {isThreatInside ? (
                    <div className="space-y-2 text-xs">
                      <div 
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          isStealthMode ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <VolumeX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Mute Media & Silence Ringers</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Set phone to silent (not vibrate). Do not make voice calls unless hidden safely.
                          </p>
                        </div>
                      </div>

                      <div 
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          isStealthMode ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Barricade Doors & Secure Inward</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Move furniture against the door. Lock internal latch if in a safe room or bathroom.
                          </p>
                        </div>
                      </div>

                      <div 
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          isStealthMode ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <SunDim className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Blackout Screen</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5 mb-2">
                            Dim phone light so glare does not reveal your location under a door gap.
                          </p>
                          <button
                            type="button"
                            onClick={() => setScreenDimmed(true)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Activate Screen Blackout
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div 
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          isStealthMode ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <Key className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Unlock Perimeter Gates</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            If safe to reach controls, buzz open perimeter gates to allow tactical rapid entry without breaching.
                          </p>
                        </div>
                      </div>

                      <div 
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          isStealthMode ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Turn On Exterior Lights</strong>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Illuminates fleeing suspects and assists patrol spotlight alignment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
