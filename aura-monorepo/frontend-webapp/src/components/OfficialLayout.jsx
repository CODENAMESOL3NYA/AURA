import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, 
  Radio, 
  FileText, 
  Grid, 
  Navigation, 
  User 
} from 'lucide-react';

export default function OfficialLayout() {
  const location = useLocation();

  // Network connection status indicator with ternary check
  const [isConnected, setIsConnected] = useState(() => {
    return typeof window !== 'undefined' && typeof window.navigator !== 'undefined'
      ? window.navigator.onLine
      : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { name: 'Beacon', path: '/', icon: AlertTriangle },
    { name: 'Incidents', path: '/emergency-grid', icon: Grid },
    { name: 'Tracker', path: '/active-tracker', icon: Navigation },
    { name: 'GBV Crisis', path: '/report', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const isBeaconHome = location.pathname === '/' || location.pathname === '/beacon';

  const hideHeaderRoutes = ['/emergency-grid', '/active-tracker', '/report', '/profile'];
  const shouldHideHeader = hideHeaderRoutes.some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  return (
    <div className="flex-1 flex flex-col bg-black text-white font-sans selection:bg-rose-500/30 selection:text-white relative">
      {!shouldHideHeader && (
        <header className="border-b border-zinc-900 bg-black/95 backdrop-blur-xl sticky top-0 z-30">
          {isBeaconHome ? (
            <div className="flex items-center justify-between w-full px-4 pt-6 pb-2">
              <Link to="/" className="flex items-center group focus:outline-none">
                <img
                  src="/AURA logo_text.png"
                  alt="AURA"
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <div 
                className="flex items-center justify-center p-1.5"
                title={isConnected ? 'Network Online' : 'Network Disconnected'}
                aria-label={isConnected ? 'Online' : 'Disconnected'}
              >
                <Radio 
                  className={`w-4 h-4 ${
                    isConnected ? 'text-emerald-500' : 'text-rose-500'
                  } transition-colors`} 
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full px-4 pt-4 pb-2">
              <Link to="/" className="flex items-center space-x-2 group focus:outline-none">
                <img
                  src="/AURA_Logo.png"
                  alt="AURA Brand Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <div className="flex items-center space-x-1.5 leading-none">
                    <span className="font-bold text-sm tracking-tight leading-snug text-white">AURA</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tight mt-0.5">Tactical Command</p>
                </div>
              </Link>

              <div className="flex items-center space-x-2.5">
                <div 
                  className="flex items-center justify-center p-1.5"
                  title={isConnected ? 'Network Online' : 'Network Disconnected'}
                  aria-label={isConnected ? 'Online' : 'Disconnected'}
                >
                  <Radio 
                    className={`w-3.5 h-3.5 ${
                      isConnected ? 'text-emerald-500' : 'text-rose-500'
                    } transition-colors`} 
                  />
                </div>

                {/* Sprint 1: Re-enable after the stealth routes are implemented.
                {isStealthEnabled && (
                  <button
                    onClick={() => {
                      setIsStealthMode(true);
                      navigate('/calendar');
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold min-h-[40px] tracking-tight leading-snug"
                    title="Switch to Stealth Planner Disguise"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Disguise</span>
                  </button>
                )}
                */}
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex-1 flex flex-col relative overflow-x-hidden">
        <Outlet />
      </main>

      <nav className="border-t border-zinc-900 bg-black/95 backdrop-blur-xl sticky bottom-0 z-30 px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/' && location.pathname === '/beacon');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-medium transition-all min-h-[46px] ${
                  isActive
                    ? 'text-white bg-zinc-900/90 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-rose-500' : 'text-zinc-500'}`} />
                <span className="tracking-tight leading-snug">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
