import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ShieldAlert, 
  Phone, 
  Users, 
  MapPin, 
  Radio, 
  CheckCircle, 
  Clock, 
  Volume2, 
  EyeOff,
  HeartHandshake,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext.jsx';
import { useAuthAndSafety } from '../../context/AuthAndSafetyContext.jsx';

export default function OfficialHome() {
  const navigate = useNavigate();
  const { sosActive, triggerSos, cancelSos } = useSafety();
  const { activeEmergency, setIsStealthMode } = useAuthAndSafety();

  const gbvHotlines = [
    {
      name: 'National GBV Command Centre',
      number: '0800 428 428',
      desc: '24/7 Toll-Free Emergency Support & Extraction',
      badge: 'Official DSD',
    },
    {
      name: 'Stop Gender Violence Helpline',
      number: '0800 150 150',
      desc: 'Confidential Crisis Counselling & Safe Havens',
      badge: '24/7 Toll-Free',
    },
    {
      name: 'Thuthuzela Care Centre Network',
      number: '011 488 4000',
      desc: 'One-stop medical, legal, and trauma centers',
      badge: 'Gauteng Health',
    },
    {
      name: 'Childline South Africa',
      number: '116',
      desc: 'Free support for children and family disputes',
      badge: 'Toll-Free',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pt-10 sm:pt-10 bg-black text-white font-sans selection:bg-rose-500/30 selection:text-white space-y-4">
      {/* GBV & Crisis Support Banner */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-rose-500">
          <HeartHandshake className="w-5 h-5" />
          <h2 className="text-sm font-bold tracking-tight leading-snug text-white">GBV Crisis & Safe Havens</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Support integrations are not connected in this prototype.
        </p>
      </div>

      {/* Incident Status Feed */}
      {!activeEmergency && !sosActive ? (
        <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-850 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white/40 mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
            No Incidents Reported
          </h3>
          <p className="text-xs text-white/40 font-mono">
            Your safety perimeter is currently secure.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-3xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight leading-snug">Active Alert Transmitting</h4>
              <p className="text-[10px] text-rose-300 font-mono">GPS live coordinates locked</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/active-tracker')}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
          >
            Track Unit
          </button>
        </div>
      )}

      {/* Emergency Hotlines Directory */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
          Direct Hotlines (Toll-Free)
        </h3>

        <div className="space-y-2">
          {gbvHotlines.map((hotline, idx) => (
            <a
              key={idx}
              href={`tel:${hotline.number.replace(/\s+/g, '')}`}
              className="p-3 rounded-2xl bg-zinc-950/90 hover:bg-zinc-900/90 border border-zinc-800 flex items-center justify-between transition cursor-pointer group min-h-[50px]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white tracking-tight leading-snug">{hotline.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {hotline.badge}
                    </span>
                  </div>
                  <span className="text-xs text-rose-400 font-mono font-semibold block">{hotline.number}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Task 2: Relocated Disguise (Stealth Mode) Button replacing legacy 10111 dispatch prompt */}
      <div className="pt-2">
        <button
          onClick={() => {
            setIsStealthMode(true);
            navigate('/calendar');
          }}
          className="bg-[#111111] hover:bg-zinc-800 text-white w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs font-semibold tracking-tight leading-snug"
        >
          <EyeOff size={20} className="text-zinc-400" />
          <span>Disguise</span>
        </button>
      </div>
    </div>
  );
}
