import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, MessageCircle, Sparkles, Mic } from 'lucide-react';
import { Button } from './ui/button';

// Sage Avatar Component - Elegant minimal design
export const SageAvatar = ({ size = 'md', speaking = false, onClick }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald to-emerald-dark shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2 border-emerald/30`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="sage-avatar"
    >
      {/* Sage Icon - Sparkles representing wisdom/AI */}
      <Sparkles className={`${iconSizes[size]} text-white`} />
      
      {/* Speaking animation rings */}
      {speaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
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
  const synthRef = React.useRef(window.speechSynthesis);

  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // Slightly higher for friendly tone
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (message && voiceEnabled) {
      // Small delay before speaking
      const timer = setTimeout(() => speak(message), 500);
      return () => clearTimeout(timer);
    }
  }, [message, voiceEnabled, speak]);

  useEffect(() => {
    const synth = synthRef.current;
    return () => {
      synth.cancel();
    };
  }, []);

  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
    'top-right': 'top-24 right-6',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed ${positionClasses[position]} z-50 max-w-sm`}
      data-testid="sage-bubble"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 flex items-center justify-between border-b border-amber-200">
          <div className="flex items-center gap-2">
            <SageAvatar size="sm" speaking={isSpeaking} />
            <div>
              <span className="font-serif text-charcoal font-medium">Sage</span>
              <span className="text-xs text-charcoal-muted block">Your Memory Guide</span>
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
          <p className="text-charcoal leading-relaxed">{message}</p>
        </div>
      </div>
      
      {/* Speech bubble pointer */}
      <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-amber-200 transform rotate-45" />
    </motion.div>
  );
};

// Floating Sage Button (for demo mode)
export const SageFloatingButton = ({ onClick, hasMessage = false }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      data-testid="sage-floating-btn"
    >
      <div className="relative">
        <SageAvatar size="lg" />
        {hasMessage && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MessageCircle className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

// Sage Welcome Modal (for landing page)
export const SageWelcomeModal = ({ isOpen, onClose, onExploreDemo }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);

  const welcomeMessage = "Hello! I'm Sage, your family memory guide. I help families preserve their most precious stories across generations. Would you like to explore a demo family and see the magic of Heirloom?";

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(welcomeMessage);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
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
  }, [isOpen, welcomeMessage]);

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
          className="bg-ivory rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          data-testid="sage-welcome-modal"
        >
          {/* Sage header */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-8 text-center">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <SageAvatar size="xl" speaking={isSpeaking} />
            </motion.div>
            <h2 className="font-serif text-2xl text-charcoal mt-4">Meet Sage</h2>
            <p className="text-charcoal-muted">Your Family Memory Guide</p>
          </div>
          
          {/* Message */}
          <div className="p-6 text-center">
            <p className="text-charcoal text-lg leading-relaxed mb-6">
              {welcomeMessage}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 btn-primary py-6 text-lg"
                onClick={onExploreDemo}
                data-testid="explore-demo-btn"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Demo Family
              </Button>
              <Button
                variant="outline"
                className="flex-1 py-6 text-lg"
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
