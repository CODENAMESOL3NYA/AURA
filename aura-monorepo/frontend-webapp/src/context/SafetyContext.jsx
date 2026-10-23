import React, { createContext, useContext, useState } from 'react';

const SafetyContext = createContext(undefined);

export function SafetyProvider({ children }) {
  const [isStealthMode, setStealthMode] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const toggleStealthMode = () => setStealthMode(prev => !prev);
  const triggerSos = () => setSosActive(true);
  const cancelSos = () => setSosActive(false);

  return (
    <SafetyContext.Provider
      value={{
        isStealthMode,
        setStealthMode,
        toggleStealthMode,
        sosActive,
        triggerSos,
        cancelSos,
        contactsCount: 3,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}

export default SafetyContext;
