import { useState, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Custom hook for ElevenLabs Text-to-Speech
 * Provides natural, human-like voices with emotion
 */
export const useElevenLabsTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Stop any currently playing audio
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Generate and play speech
  const speak = useCallback(async (text, voiceType = 'sage', options = {}) => {
    if (!text) return;
    
    // Stop any current playback
    stop();
    
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
          stability: options.stability || 0.5,
          similarity_boost: options.similarity_boost || 0.75,
          style: options.style || 0.3
        }),
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
      
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      
      setIsPlaying(true);
      await audio.play();
      
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err.message);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  // Speak as Sage (warm female narrator)
  const speakAsSage = useCallback((text, options = {}) => {
    return speak(text, 'sage', { stability: 0.6, similarity_boost: 0.8, style: 0.4, ...options });
  }, [speak]);

  // Speak as female character (for stories)
  const speakAsFemale = useCallback((text, young = false, options = {}) => {
    const voiceType = young ? 'female_young' : 'female_warm';
    return speak(text, voiceType, { stability: 0.5, similarity_boost: 0.75, style: 0.3, ...options });
  }, [speak]);

  // Speak as male character (for stories)
  const speakAsMale = useCallback((text, young = false, options = {}) => {
    const voiceType = young ? 'male_young' : 'male_warm';
    return speak(text, voiceType, { stability: 0.5, similarity_boost: 0.75, style: 0.3, ...options });
  }, [speak]);

  return {
    speak,
    speakAsSage,
    speakAsFemale,
    speakAsMale,
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
