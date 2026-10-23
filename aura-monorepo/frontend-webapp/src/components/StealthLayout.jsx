import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, CheckSquare, Settings, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { useSafety } from '../context/SafetyContext.jsx';
import { useAuthAndSafety } from '../context/AuthAndSafetyContext.jsx';

export default function StealthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sosActive } = useSafety();
  const { setIsStealthMode } = useAuthAndSafety();
  const [clickCount, setClickCount] = useState(0);

  // Hidden unlock gesture: clicking the calendar logo 3 times unlocks official portal
  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 3) {
      setClickCount(0);
      setIsStealthMode(false);
      navigate('/');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 pt-6 sm:pt-4">
      {/* Stealth Calendar Header - Designed to look completely innocent like Notion / Apple Reminders */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex justify-between items-center w-full px-4 pt-4 pb-2">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleLogoClick}
              title="Daily Calendar"
              className="flex items-center space-x-2 text-left cursor-pointer group select-none min-h-[40px]"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-900 tracking-tight leading-snug block">Daily Focus</span>
                <span className="text-[10px] text-slate-400 block">Personal Tasks</span>
              </div>
            </button>
          </div>

          {/* Innocent-looking top controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-[11px]">
              <button
                onClick={() => navigate('/calendar')}
                className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer min-h-[36px] ${
                  location.pathname === '/calendar' || location.pathname === '/' || location.pathname === '/planner' || location.pathname === '/stealth'
                    ? 'bg-white shadow-xs text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => navigate('/journal')}
                className={`px-3 py-1.5 font-medium rounded-md transition cursor-pointer min-h-[36px] ${
                  location.pathname === '/journal'
                    ? 'bg-white shadow-xs text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Notes
              </button>
            </div>

            {/* Hidden discrete exit button */}
            <button
              onClick={() => {
                setIsStealthMode(false);
                navigate('/');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Switch Mode"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Disguise Body with Outlet */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 bg-white py-2 px-4 text-center text-[10px] text-slate-400 flex items-center justify-between">
        <span>Workspace v3.4 &bull; Offline Auto-save</span>
        <span className="flex items-center space-x-1 text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Cloud Mirror Synced</span>
        </span>
      </footer>
    </div>
  );
}
