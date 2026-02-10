import { useState, useCallback, useRef, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Custom hook for ElevenLabs Text-to-Speech
 * Provides natural, human-like voices with emotion and age-appropriate selection
 */
export const useElevenLabsTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const currentAudioRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Stop any currently playing audio - CRITICAL for preventing voice clashing
  const stop = useCallback(() => {
    // Abort any pending fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Stop and cleanup audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      } catch (e) {
        console.log('Audio cleanup:', e);
      }
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Generate and play speech
  const speak = useCallback(async (text, voiceType = 'sage', options = {}) => {
    if (!text) return;
    
    // ALWAYS stop any current playback first
    stop();
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_type: voiceType,
          stability: options.stability || 0.4,     // Lower = more natural variation
          similarity_boost: options.similarity_boost || 0.8,
          style: options.style || 0.65  // Higher = more emotional/expressive
        }),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }
      
      const data = await response.json();
      
      // Create audio from base64
      const audioBlob = base64ToBlob(data.audio_data, data.content_type);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      
      setIsLoading(false);
      setIsPlaying(true);
      await audio.play();
      
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, this is expected behavior
        console.log('TTS request cancelled');
      } else {
        console.error('TTS Error:', err);
        setError(err.message);
      }
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [stop]);

  // Get age-appropriate voice type based on birth year and gender
  const getVoiceType = useCallback((gender, birthYear) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - (birthYear || 1980);
    
    if (gender === 'male') {
      if (age >= 65) return 'male_elderly';
      if (age >= 40) return 'male_mature';
      return 'male_young';
    } else {
      if (age >= 65) return 'female_elderly';
      if (age >= 40) return 'female_mature';
      return 'female_young';
    }
  }, []);

  // Speak as Sage (warm female narrator) - with more emotion
  const speakAsSage = useCallback((text, options = {}) => {
    return speak(text, 'sage', { 
      stability: 0.5,      // More variation = more natural
      similarity_boost: 0.8, 
      style: 0.6,          // More expressive
      ...options 
    });
  }, [speak]);

  // Speak as character with age-appropriate voice
  const speakAsCharacter = useCallback((text, gender, birthYear, options = {}) => {
    const voiceType = getVoiceType(gender, birthYear);
    return speak(text, voiceType, {
      stability: 0.4,      // More natural variation
      similarity_boost: 0.75,
      style: 0.6,          // More emotional/expressive
      ...options
    });
  }, [speak, getVoiceType]);

  // Speak as female character (legacy support)
  const speakAsFemale = useCallback((text, young = false, options = {}) => {
    const voiceType = young ? 'female_young' : 'female_mature';
    return speak(text, voiceType, { 
      stability: 0.4, 
      similarity_boost: 0.75, 
      style: 0.6,
      ...options 
    });
  }, [speak]);

  // Speak as male character (legacy support)
  const speakAsMale = useCallback((text, young = false, options = {}) => {
    const voiceType = young ? 'male_young' : 'male_mature';
    return speak(text, voiceType, { 
      stability: 0.4, 
      similarity_boost: 0.75, 
      style: 0.6,
      ...options 
    });
  }, [speak]);

  return {
    speak,
    speakAsSage,
    speakAsCharacter,
    speakAsFemale,
    speakAsMale,
    getVoiceType,
    stop,
    isLoading,
    isPlaying,
    error
  };
};

// Helper function to convert base64 to blob
function base64ToBlob(base64, contentType = 'audio/mpeg') {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
}

export default useElevenLabsTTS;
