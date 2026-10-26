import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { executeQuickExit } from '../utils/quickExit.js';

const defaultContext = {
  user: null,
  setUser: () => {},
  updateUser: () => {},
  isUserLoading: false,
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isStealthMode: false,
  setIsStealthMode: () => {},
  toggleStealthMode: () => {},
  isStealthEnabled: true,
  setIsStealthEnabled: () => {},
  toggleStealthEnabled: () => {},
  isBooting: true,
  setIsBooting: () => {},
  hasSeenOnboarding: false,
  setHasSeenOnboarding: () => {},
  activeEmergency: null,
  setActiveEmergency: () => {},
  triggerEmergency: () => {},
  clearEmergency: () => {},
  // SOS State parity
  sosActive: false,
  triggerSos: () => {},
  cancelSos: () => {},
  triggerQuickExit: () => {},
  initiateSensors: async () => false,
  contacts: [],
  setContacts: () => {},
  addresses: [],
  setAddresses: () => {},
};

const AuthAndSafetyContext = createContext(defaultContext);

const SHAKE_JOLT_DELTA = 30; // Hard acceleration delta required
const SHAKE_WINDOW_MS = 800; // 3 jolts must occur within 800ms
const SHAKE_COOLDOWN_MS = 3000; // 3-second lockout between shake triggers

export function AuthAndSafetyProvider({ children }) {
  // Global dynamic user identity
  const [user, setUserState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_user');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [isUserLoading, setIsUserLoading] = useState(false);

  const setUser = useCallback((val) => {
    setUserState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined') {
        try {
          if (next) {
            localStorage.setItem('aura_user', JSON.stringify(next));
          } else {
            localStorage.removeItem('aura_user');
          }
        } catch (e) {}
      }
      return next;
    });
  }, []);

  const updateUser = useCallback((partial) => {
    setUserState((prev) => {
      const next = prev ? { ...prev, ...partial } : partial;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_user', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  }, []);

  // Global dynamic contacts and addresses state with local cache
  const [contacts, setContactsState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_contacts');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  const setContacts = useCallback((val) => {
    setContactsState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_contacts', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  }, []);

  const [addresses, setAddressesState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_addresses');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  const setAddresses = useCallback((val) => {
    setAddressesState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_addresses', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [isStealthEnabled, setIsStealthEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aura_stealth_disguise_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  const [isBooting, setIsBooting] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenOnboarding') === 'true';
    }
    return false;
  });

  const setHasSeenOnboarding = useCallback((val) => {
    setHasSeenOnboardingState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('hasSeenOnboarding', String(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [sosActive, setSosActive] = useState(false);

  // References for shake detection
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const isMotionAttachedRef = useRef(false);
  const joltTimestampsRef = useRef([]);
  const lastShakeTriggerRef = useRef(0);

  // Quick exit redirect invocation
  const triggerQuickExit = useCallback(() => {
    executeQuickExit();
  }, []);

  // Emergency triggering helpers
  const triggerEmergency = useCallback((emergencyData = {}) => {
    const timestamp = new Date().toISOString();
    const payload = {
      id: `AURA-${Date.now().toString().slice(-6)}`,
      status: 'active',
      startedAt: timestamp,
      dispatchedResponders: ['e-SAPS Tactical Rapid Response Unit 4', 'CPF Sector 2 Escort'],
      gpsCoordinates: emergencyData.coordinates || null,
      sector: 'Johannesburg South - Mondeor Sector',
      ...emergencyData,
    };
    setActiveEmergency(payload);
    setSosActive(true);
  }, []);

  const clearEmergency = useCallback(() => {
    setActiveEmergency(null);
    setSosActive(false);
  }, []);

  const triggerSos = useCallback(() => {
    triggerEmergency();
  }, [triggerEmergency]);

  const cancelSos = useCallback(() => {
    clearEmergency();
  }, [clearEmergency]);

  const toggleStealthMode = useCallback(() => {
    setIsStealthMode((prev) => !prev);
  }, []);

  const toggleStealthEnabled = useCallback(() => {
    setIsStealthEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('aura_stealth_disguise_enabled', String(next));
      }
      return next;
    });
  }, []);

  // Hardened 3-Jolt Device Motion Shake Detection (Workstream R0)
  const handleDeviceMotion = useCallback((event) => {
    const currentAcc = event.accelerationIncludingGravity || event.acceleration;
    if (!currentAcc) return;

    const x = currentAcc.x || 0;
    const y = currentAcc.y || 0;
    const z = currentAcc.z || 0;

    const lastAcc = lastAccelerationRef.current;
    const deltaX = Math.abs(x - lastAcc.x);
    const deltaY = Math.abs(y - lastAcc.y);
    const deltaZ = Math.abs(z - lastAcc.z);
    const totalDelta = deltaX + deltaY + deltaZ;

    lastAccelerationRef.current = { x, y, z };

    if (totalDelta > SHAKE_JOLT_DELTA) {
      const now = Date.now();
      // Enforce 3000ms cooldown after successful trigger
      if (now - lastShakeTriggerRef.current < SHAKE_COOLDOWN_MS) {
        return;
      }

      // Filter jolts occurring within the 800ms window
      const recentJolts = joltTimestampsRef.current.filter((t) => now - t <= SHAKE_WINDOW_MS);
      recentJolts.push(now);
      joltTimestampsRef.current = recentJolts;

      // 3 distinct hard jolts within 800ms required to fire
      if (recentJolts.length >= 3) {
        lastShakeTriggerRef.current = now;
        joltTimestampsRef.current = [];
        executeQuickExit();
      }
    }
  }, []);

  const attachDeviceMotion = useCallback(() => {
    if (isMotionAttachedRef.current) return;
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion, false);
      isMotionAttachedRef.current = true;
    }
  }, [handleDeviceMotion]);

  const initiateSensors = useCallback(async () => {
    try {
      const devMotionEvent = window.DeviceMotionEvent;
      if (typeof devMotionEvent !== 'undefined' && typeof devMotionEvent.requestPermission === 'function') {
        const permissionState = await devMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          attachDeviceMotion();
          return true;
        }
        return false;
      } else if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        attachDeviceMotion();
        return true;
      }
    } catch (err) {
      console.warn('Sensors permission error:', err);
    }
    return false;
  }, [attachDeviceMotion]);

  useEffect(() => {
    const devMotionEvent = typeof window !== 'undefined' ? window.DeviceMotionEvent : undefined;
    if (devMotionEvent && typeof devMotionEvent.requestPermission !== 'function') {
      attachDeviceMotion();
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window && isMotionAttachedRef.current) {
        window.removeEventListener('devicemotion', handleDeviceMotion, false);
        isMotionAttachedRef.current = false;
      }
    };
  }, [attachDeviceMotion, handleDeviceMotion]);

  const value = {
    user,
    setUser,
    updateUser,
    isUserLoading,
    setIsUserLoading,
    contacts,
    setContacts,
    addresses,
    setAddresses,
    isAuthenticated,
    setIsAuthenticated,
    isStealthMode,
    setIsStealthMode,
    toggleStealthMode,
    isStealthEnabled,
    setIsStealthEnabled,
    toggleStealthEnabled,
    isBooting,
    setIsBooting,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    activeEmergency,
    setActiveEmergency,
    triggerEmergency,
    clearEmergency,
    sosActive,
    triggerSos,
    cancelSos,
    triggerQuickExit,
    initiateSensors,
  };

  return (
    <AuthAndSafetyContext.Provider value={value}>
      {children}
    </AuthAndSafetyContext.Provider>
  );
}

export function useAuthAndSafety() {
  const context = useContext(AuthAndSafetyContext);
  if (!context) {
    throw new Error('useAuthAndSafety must be used within an AuthAndSafetyProvider');
  }
  return context;
}

export default AuthAndSafetyContext;
