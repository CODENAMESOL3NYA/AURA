import React, { createContext, useContext } from 'react';
import { useAuthAndSafety } from './AuthAndSafetyContext.jsx';

/**
 * SafetyContext (Unified Proxy Layer)
 *
 * Forwards calls directly to AuthAndSafetyContext to ensure single-source-of-truth
 * state for isStealthMode, activeEmergency, and sosActive across the entire application.
 */
const SafetyContext = createContext(undefined);

export function SafetyProvider({ children }) {
  const authSafety = useAuthAndSafety();

  const value = {
    isStealthMode: authSafety.isStealthMode,
    setStealthMode: authSafety.setIsStealthMode,
    toggleStealthMode: authSafety.toggleStealthMode,
    sosActive: authSafety.sosActive,
    triggerSos: authSafety.triggerSos,
    cancelSos: authSafety.cancelSos,
    contactsCount: authSafety.contacts?.length || 0,
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    // If used outside SafetyProvider, fallback directly to useAuthAndSafety
    return useAuthAndSafety();
  }
  return context;
}

export default SafetyContext;
