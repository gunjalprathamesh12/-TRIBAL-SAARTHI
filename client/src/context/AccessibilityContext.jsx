import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations.js';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const decreaseFontSize = () => setFontScale((prev) => Math.max(0.85, prev - 0.1));
  const resetFontSize = () => setFontScale(1);
  const increaseFontSize = () => setFontScale((prev) => Math.min(1.3, prev + 0.1));
  const toggleContrast = () => setHighContrast((prev) => !prev);
  const toggleMotion = () => setReduceMotion((prev) => !prev);

  // Translation helper
  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        highContrast,
        reduceMotion,
        language,
        setLanguage,
        decreaseFontSize,
        resetFontSize,
        increaseFontSize,
        toggleContrast,
        toggleMotion,
        t,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
