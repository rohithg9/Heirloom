import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Indian languages with native scripts
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇳🇵' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', flag: '🇵🇰' },
];

const LanguageSelector = ({ 
  selectedLanguage = 'en', 
  onLanguageChange, 
  compact = false,
  showNativeScript = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  const handleSelect = (langCode) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-ivory/20 bg-charcoal hover:bg-charcoal-light transition-colors ${
          compact ? 'text-sm' : ''
        }`}
        data-testid="language-selector-btn"
      >
        <Globe className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-sage`} />
        <span className="text-ivory">
          {showNativeScript ? currentLanguage.native : currentLanguage.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-ivory/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-64 bg-charcoal-light border border-ivory/20 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
            >
              <div className="p-2">
                <p className="text-xs text-ivory/50 px-2 py-1 mb-1">Select Language</p>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedLanguage === lang.code 
                        ? 'bg-sage/20 text-sage' 
                        : 'hover:bg-ivory/10 text-ivory'
                    }`}
                    data-testid={`language-option-${lang.code}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{lang.native}</p>
                      <p className="text-xs text-ivory/50">{lang.name}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Check className="w-4 h-4 text-sage" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Translation toggle component
export const TranslationToggle = ({ 
  originalLanguage = 'hi',
  showOriginal = true,
  onToggle,
  className = ''
}) => {
  const langInfo = LANGUAGES.find(l => l.code === originalLanguage) || LANGUAGES[1];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onToggle(!showOriginal)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
          showOriginal 
            ? 'bg-sage/20 text-sage border border-sage/30' 
            : 'bg-ivory/10 text-ivory/70 border border-ivory/20'
        }`}
        data-testid="translation-toggle"
      >
        <span>{showOriginal ? langInfo.native : 'English'}</span>
        <span className="text-ivory/40">↔</span>
        <span>{showOriginal ? 'English' : langInfo.native}</span>
      </button>
    </div>
  );
};

// Bilingual text display component
export const BilingualText = ({
  originalText,
  translatedText,
  originalLanguage = 'hi',
  showOriginal = true,
  className = ''
}) => {
  const langInfo = LANGUAGES.find(l => l.code === originalLanguage) || LANGUAGES[1];
  
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showOriginal ? 'original' : 'translated'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-ivory leading-relaxed">
            {showOriginal ? (originalText || translatedText) : (translatedText || originalText)}
          </p>
          <p className="text-xs text-ivory/40 mt-2">
            {showOriginal ? langInfo.native : 'English'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
