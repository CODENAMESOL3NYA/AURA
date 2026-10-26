import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Car, 
  Volume2, 
  Mic, 
  MicOff, 
  ShieldCheck,
  EyeOff
} from 'lucide-react';
import { useAuthAndSafety } from '../../context/AuthAndSafetyContext';
import { useSafety } from '../../context/SafetyContext';
import apiClient from '../../services/apiClient.js';

export default function ActiveTracker() {
  const navigate = useNavigate();
  const { activeEmergency, clearEmergency, setIsStealthMode } = useAuthAndSafety();
  const { cancelSos, sosActive } = useSafety();

  const isEmergencyActive = !!activeEmergency || sosActive;

  // Task 3: Dynamic live telemetry activeIncident state object
  const [activeIncident, setActiveIncident] = useState(() => {
    if (activeEmergency) {
      const coords = activeEmergency.gpsCoordinates || activeEmergency.coordinates || null;
      return {
        id: activeEmergency.id || activeEmergency.incidentId || `INC-${Date.now().toString().slice(-4)}`,
        status: activeEmergency.status || 'ACTIVE_DISPATCH',
        responderName: activeEmergency.responderName || null,
        unitCallsign: activeEmergency.unit || activeEmergency.unitCallsign || null,
        vehicleDetails: null,
        badgeNumber: null,
        locationName: activeEmergency.neighborhood || 'Location shared with server',
        coordinates: coords,
        responderCoordinates: null,
        etaMinutes: activeEmergency.etaMinutes ?? null,
        etaSeconds: null,
        distanceKm: null,
        speedKmh: null,
        sirenActive: false,
        approachRoute: null,
      };
    }
    return null;
  });

  const [isMicBroadcasting, setIsMicBroadcasting] = useState(false);

  // Sync activeIncident whenever emergency state changes
  useEffect(() => {
    if (isEmergencyActive) {
      setActiveIncident((prev) => {
        if (prev) return { ...prev, status: activeEmergency?.status || prev.status, unitCallsign: activeEmergency?.unit || activeEmergency?.unitCallsign || prev.unitCallsign, etaMinutes: activeEmergency?.etaMinutes ?? prev.etaMinutes };
        const coords = activeEmergency?.gpsCoordinates || activeEmergency?.coordinates || null;
        return {
          id: activeEmergency?.id || activeEmergency?.incidentId || `INC-${Date.now().toString().slice(-4)}`,
          status: activeEmergency?.status || 'ACTIVE_DISPATCH',
          responderName: activeEmergency?.responderName || null,
          unitCallsign: activeEmergency?.unit || activeEmergency?.unitCallsign || null,
          vehicleDetails: null,
          badgeNumber: null,
          locationName: activeEmergency?.neighborhood || 'Location shared with server',
          coordinates: coords,
          responderCoordinates: null,
          etaMinutes: activeEmergency?.etaMinutes ?? null,
          etaSeconds: null,
          distanceKm: null,
          speedKmh: null,
          sirenActive: false,
          approachRoute: null,
        };
      });
    } else {
      setActiveIncident(null);
    }
  }, [isEmergencyActive, activeEmergency]);

  // Hold-to-Cancel Mechanic State (3-second duration)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);

  // 3-second real-time telemetry polling with backend mesh
  useEffect(() => {
    if (!activeIncident?.id) return;
    const pollBackend = async () => {
      try {
        const res = await apiClient.getIncident(activeIncident.id);
        if (res?.incident) {
          setActiveIncident((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: res.incident.status,
              etaMinutes: res.incident.etaMinutes ?? prev.etaMinutes,
              responderName: res.incident.responderName || prev.responderName,
              unitCallsign: res.incident.unit || prev.unitCallsign,
            };
          });
        }
      } catch (err) {
        // network dip
      }
    };
    const pollInterval = setInterval(pollBackend, 3000);
    return () => clearInterval(pollInterval);
  }, [activeIncident?.id]);

  const handleStandDown = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]); } catch (e) {}
    }
    if (activeIncident?.id) {
      try {
        await apiClient.cancelEmergency(activeIncident.id, 'Citizen marked safe from ActiveTracker');
      } catch (e) {}
    }
    clearEmergency();
    cancelSos();
    setActiveIncident(null);
    navigate('/');
  };

  // Hold to Cancel 3-second handler
  const handlePointerDown = () => {
    setIsHolding(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }

    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setIsHolding(false);
        setHoldProgress(0);
        handleStandDown();
      }
    }, 30);
  };

  const handlePointerUpOrLeave = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  const remainingSeconds = Math.max(1, Math.ceil(3 - (holdProgress / 100) * 3));

  // Task 4 / Empty State when no emergency is active
  if (!isEmergencyActive || !activeIncident) {
    return (
      <div className="flex-1 flex flex-col justify-between p-4 pt-10 sm:pt-12 bg-black text-white font-sans selection:bg-rose-500/30 selection:text-white">
        {/* Empty State Centered */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 my-auto">
          <div className="w-20 h-20 rounded-full bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-white/40 shadow-xl">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              No Incidents Reported
            </h3>
            <p className="text-xs text-white/40 max-w-xs font-mono leading-relaxed mx-auto">
              Your safety perimeter is currently secure.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold tracking-tight leading-snug transition cursor-pointer min-h-[46px]"
            >
              Return to Tactical Beacon
            </button>
            <button
              onClick={() => navigate('/emergency-grid')}
              className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-tight leading-snug shadow-lg shadow-rose-600/25 transition cursor-pointer min-h-[46px]"
            >
              Report Incident
            </button>
          </div>
        </div>

        {/* Relocated Disguise (Stealth Mode) Button */}
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

  return (
    <div className="flex-1 flex flex-col justify-between p-4 pt-10 sm:pt-12 bg-black text-white font-sans selection:bg-rose-500/30 selection:text-white space-y-3">
      {/* Illustrative map graphic only; this is not a live map or responder tracking view. */}
      <div className="relative rounded-3xl border border-zinc-800 bg-[#000000] tactical-grid-streets min-h-[260px] p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Map Top Status Bar */}
        <div className="flex items-center justify-between bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] font-mono z-10">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>INCIDENT: {(activeIncident.status || 'active').toUpperCase()}</span>
          </div>
          <span className="text-zinc-500 font-mono text-[10px]">
            {activeIncident.coordinates ? `${activeIncident.coordinates.lat.toFixed(4)}, ${activeIncident.coordinates.lng.toFixed(4)}` : 'Coordinates not shown in incident summary'}
          </span>
        </div>

        {/* Animated Tactical Route SVG with dynamic coordinates */}
        <div className="relative my-auto flex items-center justify-center py-6">
          <div className="w-full h-32 relative border border-zinc-800/80 rounded-2xl bg-zinc-950/80 p-3 flex flex-col justify-between overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 40 30 Q 140 100 280 90"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </svg>

            {/* Police Unit Marker */}
            <div className="flex items-center space-x-2 z-10">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white tracking-tight leading-snug">
                  {activeIncident.unitCallsign || 'Awaiting responder assignment'}
                </div>
                <div className="text-[9px] text-zinc-400 font-mono">
                  {activeIncident.approachRoute || 'Status updates from responder console'}
                </div>
              </div>
            </div>

            {/* Citizen Marker */}
            <div className="flex items-center justify-end space-x-2 z-10 self-end">
              <div className="text-right">
                <div className="text-[11px] font-bold text-white tracking-tight leading-snug">
                  Your Location ({activeIncident.locationName})
                </div>
                <div className="text-[9px] text-rose-400 font-mono">
                  Location sent with request
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-rose-500 flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Distance & Siren Bar */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono z-10">
          <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[9px]">DISTANCE TO UNIT</span>
            <span className="font-bold text-white text-xs">Distance unavailable</span>
          </div>
          <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block text-[9px]">SIREN STATUS</span>
            <span className="font-bold text-emerald-400 text-xs flex items-center justify-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>{activeIncident.sirenActive ? 'Audible Siren' : 'Silent Approach'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic ETA Large Card */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-4 text-center shadow-xl">
        <div className="flex items-center justify-center space-x-1.5 text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-1">
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>Estimated Police Arrival</span>
        </div>
        <div className="text-4xl font-black text-white tracking-tight leading-snug">
          {activeIncident.etaMinutes == null ? '—' : `${activeIncident.etaMinutes} min`}
          <span className="text-sm font-semibold text-zinc-400 ml-1.5">min</span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
          Priority blue lights engaged. Stay in safe cover if threat is nearby.
        </p>
      </div>

      {/* Assigned Unit & Officer Card */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-3.5 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-rose-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs tracking-tight leading-snug">
                {activeIncident.unitCallsign || 'Awaiting responder assignment'}
              </h4>
              <p className="text-[10px] text-zinc-400 font-mono">
                {activeIncident.vehicleDetails}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400 uppercase">
            {activeIncident.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-500 block">LEAD OFFICER</span>
            <span className="font-semibold text-white">{activeIncident.responderName || 'Not assigned yet'}</span>
          </div>
          <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-zinc-500 block">BADGE SERIAL</span>
            <span className="font-semibold text-white">{activeIncident.badgeNumber}</span>
          </div>
        </div>
      </div>

      {/* Primary Actions: Disguise & Hold-to-Cancel */}
      <div className="space-y-2">
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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsMicBroadcasting(!isMicBroadcasting)}
            className={`py-3 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer min-h-[50px] tracking-tight leading-snug ${
              isMicBroadcasting
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            {isMicBroadcasting ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-zinc-400" />}
            <span className="text-[11px]">{isMicBroadcasting ? 'Live Mic' : 'Silent Audio'}</span>
          </button>

          {/* Task 1: Robust Hold-to-Cancel Button with 3-second progress fill */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 select-none">
            {/* Dynamic Fill Progress Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-rose-600/40 transition-all duration-75 ease-linear pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />
            <button
              type="button"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUpOrLeave}
              onPointerLeave={handlePointerUpOrLeave}
              onPointerCancel={handlePointerUpOrLeave}
              className="w-full py-3 px-3 text-[11px] font-semibold text-zinc-300 active:text-white flex flex-col items-center justify-center cursor-pointer relative z-10 min-h-[50px] tracking-tight leading-snug"
            >
              <span className="text-zinc-200">
                {isHolding ? `Hold to Cancel (${remainingSeconds}s)` : 'Hold to Cancel'}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">
                {isHolding ? `${Math.round(holdProgress)}% completed` : 'Press 3 seconds'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
