import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

// Sage Avatar Component - Friendly face design
export const SageAvatar = ({ size = 'md', speaking = false, onClick }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16'
  };

  const faceSizes = {
    sm: { face: 20, eye: 2, smile: 6 },
    md: { face: 24, eye: 2.5, smile: 7 },
    lg: { face: 28, eye: 3, smile: 8 },
    xl: { face: 32, eye: 3.5, smile: 9 }
  };

  const s = faceSizes[size];

  return (
    <motion.button
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2 border-amber-300/50`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="sage-avatar"
    >
      {/* Friendly face SVG */}
      <svg viewBox="0 0 40 40" className="w-full h-full p-1">
        {/* Face background */}
        <circle cx="20" cy="20" r="18" fill="#FEF3C7" />
        
        {/* Rosy cheeks */}
        <circle cx="10" cy="22" r="3" fill="#FECACA" opacity="0.6" />
        <circle cx="30" cy="22" r="3" fill="#FECACA" opacity="0.6" />
        
        {/* Eyes - happy closed crescents when speaking, open dots otherwise */}
        {speaking ? (
          <>
            <path d="M12 18 Q15 15 18 18" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M22 18 Q25 15 28 18" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="14" cy="17" r="2.5" fill="#374151" />
            <circle cx="26" cy="17" r="2.5" fill="#374151" />
            {/* Eye sparkle */}
            <circle cx="13" cy="16" r="1" fill="white" />
            <circle cx="25" cy="16" r="1" fill="white" />
          </>
        )}
        
        {/* Warm smile */}
        <path 
          d="M13 25 Q20 31 27 25" 
          stroke="#374151" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
        />
      </svg>
      
      {/* Speaking animation rings */}
      {speaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-300"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-300"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
        </>
      )}
    </motion.button>
  );
};

// Sage Chat Bubble
export const SageBubble = ({ message, onClose, position = 'bottom-right', showVoice = true }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };
    
    loadVoices();
    synthRef.current.addEventListener('voiceschanged', loadVoices);
    return () => {
      synthRef.current.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Find the best natural female voice
  const getBestVoice = useCallback(() => {
    const voices = synthRef.current.getVoices();
    // Priority order for natural female voices
    const preferredVoices = [
      'Google UK English Female',
      'Google US English',
      'Samantha', // macOS
      'Karen', // macOS Australian
      'Moira', // macOS Irish
      'Fiona', // macOS Scottish
      'Victoria', // macOS
      'Microsoft Zira', // Windows
      'Microsoft Aria', // Windows
    ];
    
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    
    // Fallback to any English female voice
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.includes('Samantha') ||
       v.name.includes('Karen'))
    );
    
    return femaleVoice || voices.find(v => v.lang.startsWith('en'));
  }, []);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Slower for more natural feel
    utterance.pitch = 1.05; // Slightly warmer tone
    utterance.volume = 1;
    
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled, getBestVoice]);

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (message && voiceEnabled && voicesLoaded) {
      // Small delay before speaking
      const timer = setTimeout(() => speak(message), 500);
      return () => clearTimeout(timer);
    }
  }, [message, voiceEnabled, voicesLoaded, speak]);

  useEffect(() => {
    const synth = synthRef.current;
    return () => {
      synth.cancel();
    };
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-36 right-4 md:bottom-24 md:right-6',
    'bottom-left': 'bottom-36 left-4 md:bottom-24 md:left-6',
    'top-right': 'top-36 right-4 md:top-24 md:right-6',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed ${positionClasses[position]} z-50 max-w-xs md:max-w-sm`}
      data-testid="sage-bubble"
    >
      <div className="bg-white rounded-xl shadow-xl border border-emerald/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald/10 to-emerald/5 px-3 py-2 flex items-center justify-between border-b border-emerald/10">
          <div className="flex items-center gap-2">
            <SageAvatar size="sm" speaking={isSpeaking} />
            <div>
              <span className="font-serif text-charcoal font-medium text-sm">Sage</span>
              <span className="text-xs text-charcoal-muted block">Memory Guide</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {showVoice && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                data-testid="sage-voice-toggle"
              >
                {voiceEnabled ? (
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-pulse' : 'text-charcoal-muted'}`} />
                ) : (
                  <VolumeX className="w-4 h-4 text-charcoal-muted" />
                )}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
                data-testid="sage-close"
              >
                <X className="w-4 h-4 text-charcoal-muted" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Message */}
        <div className="p-4">
          <p className="text-charcoal leading-relaxed text-sm">{message}</p>
        </div>
      </div>
      
      {/* Speech bubble pointer */}
      <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-emerald/20 transform rotate-45" />
    </motion.div>
  );
};

// Floating Sage Button (for demo mode)
export const SageFloatingButton = ({ onClick, hasMessage = false }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      data-testid="sage-floating-btn"
    >
      <div className="relative">
        <SageAvatar size="md" />
        {hasMessage && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MessageCircle className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

// Sage Welcome Modal (for landing page)
export const SageWelcomeModal = ({ isOpen, onClose, onExploreDemo }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);

  const welcomeMessage = "Hello! I'm Sage, your family memory guide. I help families preserve their most precious stories across generations. Would you like to explore a demo family and see the magic of Heirloom?";

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };
    
    loadVoices();
    synthRef.current.addEventListener('voiceschanged', loadVoices);
    return () => {
      synthRef.current.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Find best voice
  const getBestVoice = () => {
    const voices = synthRef.current.getVoices();
    const preferredVoices = [
      'Google UK English Female',
      'Google US English',
      'Samantha',
      'Karen',
      'Victoria',
      'Microsoft Zira',
    ];
    
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) return voice;
    }
    
    return voices.find(v => v.lang.startsWith('en'));
  };

  useEffect(() => {
    if (isOpen && voicesLoaded) {
      const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(welcomeMessage);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.05;
        
        const voice = getBestVoice();
        if (voice) {
          utterance.voice = voice;
        }
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        
        const synth = synthRef.current;
        synth.speak(utterance);
      }, 800);
      
      return () => {
        clearTimeout(timer);
        synthRef.current.cancel();
      };
    }
  }, [isOpen, voicesLoaded, welcomeMessage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-ivory rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          data-testid="sage-welcome-modal"
        >
          {/* Sage header */}
          <div className="bg-gradient-to-br from-emerald/20 to-emerald/10 p-6 text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <SageAvatar size="lg" speaking={isSpeaking} />
            </motion.div>
            <h2 className="font-serif text-xl text-charcoal mt-3">Meet Sage</h2>
            <p className="text-charcoal-muted text-sm">Your Family Memory Guide</p>
          </div>
          
          {/* Message */}
          <div className="p-5 text-center">
            <p className="text-charcoal text-sm leading-relaxed mb-5">
              {welcomeMessage}
            </p>
            
            <div className="flex flex-col gap-2">
              <Button
                className="w-full btn-primary py-4 text-base"
                onClick={onExploreDemo}
                data-testid="explore-demo-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Demo Family
              </Button>
              <Button
                variant="ghost"
                className="w-full py-3 text-sm text-charcoal-muted"
                onClick={onClose}
                data-testid="close-welcome-btn"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default {
  SageAvatar,
  SageBubble,
  SageFloatingButton,
  SageWelcomeModal
};
