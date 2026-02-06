import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Sage Avatar Component - Using the cute cloud character
export const SageAvatar = ({ size = 'md', speaking = false, onClick }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      data-testid="sage-avatar"
    >
      {/* Sage cloud character image */}
      <img 
        src="/images/sage-avatar.png" 
        alt="Sage" 
        className="w-full h-full object-cover rounded-full"
      />
      
      {/* Speaking animation rings */}
      {speaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-sky-300"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-sky-300"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
        </>
      )}
    </motion.button>
  );
};

// Helper to convert base64 to blob
function base64ToBlob(base64, contentType = 'audio/mpeg') {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}

// Sage Chat Bubble with ElevenLabs voice
export const SageBubble = ({ message, onClose, position = 'bottom-right', showVoice = true }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const audioRef = useRef(null);

  // Speak using ElevenLabs
  const speak = useCallback(async (text) => {
    if (!voiceEnabled || !text) return;
    
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_type: 'sage',
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.4
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }
      
      const data = await response.json();
      const audioBlob = base64ToBlob(data.audio_data, data.content_type);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      setIsLoading(false);
      setIsSpeaking(true);
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (message && voiceEnabled) {
      // Small delay before speaking
      const timer = setTimeout(() => speak(message), 800);
      return () => clearTimeout(timer);
    }
  }, [message, voiceEnabled, speak]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
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
            <SageAvatar size="sm" speaking={isSpeaking || isLoading} />
            <div>
              <span className="font-serif text-charcoal font-medium text-sm">Sage</span>
              <span className="text-xs text-charcoal-muted block">
                {isLoading ? 'Preparing...' : 'Memory Guide'}
              </span>
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

// Sage Welcome Modal (for landing page) - with ElevenLabs voice
export const SageWelcomeModal = ({ isOpen, onClose, onExploreDemo }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const welcomeMessage = "Hello! I'm Sage, your family memory guide. I help families preserve their most precious stories across generations. Would you like to explore a demo family and see the magic of Heirloom?";

  // Speak using ElevenLabs
  const speak = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: welcomeMessage,
          voice_type: 'sage',
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.4
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }
      
      const data = await response.json();
      const audioBlob = base64ToBlob(data.audio_data, data.content_type);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      setIsLoading(false);
      setIsSpeaking(true);
      await audio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => speak(), 800);
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
