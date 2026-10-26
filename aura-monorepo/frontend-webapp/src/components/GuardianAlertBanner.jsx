import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient.js';
import { startGuardianMonitoring } from '../services/guardian.js';
import { useAuthAndSafety } from '../context/AuthAndSafetyContext.jsx';

export default function GuardianAlertBanner({ stealth = false }) {
  const { isAuthenticated } = useAuthAndSafety();
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) { setAlerts([]); return undefined; }
    return startGuardianMonitoring(setAlerts);
  }, [isAuthenticated]);
  if (!isAuthenticated || !alerts.length) return null;
  const current = alerts[0];
  const dismiss = async () => { try { await apiClient.dismissGuardianAlert(current.id); setAlerts((items) => items.filter((item) => item.id !== current.id)); } catch {} };
  return <aside aria-live="polite" className={`mx-3 my-2 rounded-xl border p-3 shadow-sm ${stealth ? 'border-slate-200 bg-white text-slate-700' : 'border-amber-300 bg-amber-50 text-slate-900'}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="text-sm font-semibold">{stealth ? 'Community notice nearby' : 'Community Guardian alert'}</p><p className="mt-1 text-xs">Approximate area: {Number(current.areaLat).toFixed(2)}, {Number(current.areaLng).toFixed(2)}</p><p className="text-xs">Distance: {current.distanceBand}</p><p className="text-xs">Received: {current.createdAt ? new Date(current.createdAt).toLocaleTimeString() : 'just now'}</p></div>
      <button type="button" onClick={dismiss} className="rounded-lg border px-3 py-2 text-xs">Dismiss</button>
    </div>
    <a className={`mt-3 inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-xs font-semibold ${stealth ? 'bg-slate-100 text-slate-700' : 'bg-amber-200 text-slate-900'}`} href="tel:10111">{stealth ? 'Open phone' : 'Call emergency services · 10111'}</a>
    <a className="ml-2 inline-flex min-h-10 items-center rounded-lg border px-3 py-2 text-xs font-semibold" href="tel:112">{stealth ? 'Phone options' : '112'}</a>
  </aside>;
}
