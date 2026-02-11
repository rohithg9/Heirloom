import { useState, useCallback, useRef } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptEnglish, setTranscriptEnglish] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please grant permission.');
    }
  }, []);

  // Stop recording and transcribe
  const stopRecording = useCallback(async (language = null, translateToEnglish = true) => {
    if (!mediaRecorderRef.current) return null;
    
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        
        try {
          // Combine audio chunks into a blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            
            try {
              // Send to backend for transcription
              const response = await fetch(`${API_URL}/api/stt/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audio_data: base64Audio,
                  language: language,
                  translate_to_english: translateToEnglish
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                setTranscript(data.text);
                setDetectedLanguage(data.language);
                
                if (data.text_english) {
                  setTranscriptEnglish(data.text_english);
                }
                
                resolve({
                  text: data.text,
                  textEnglish: data.text_english,
                  language: data.language,
                  languageName: data.language_name
                });
              } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Transcription failed');
                resolve(null);
              }
            } catch (err) {
              console.error('Transcription error:', err);
              setError('Transcription failed. Please try again.');
              resolve(null);
            } finally {
              setIsTranscribing(false);
            }
          };
        } catch (err) {
          console.error('Error processing audio:', err);
          setError('Error processing audio');
          setIsTranscribing(false);
          resolve(null);
        }
        
        // Stop all tracks
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.stop();
    });
  }, []);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  // Reset state
  const reset = useCallback(() => {
    setTranscript('');
    setTranscriptEnglish('');
    setDetectedLanguage('en');
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    transcriptEnglish,
    detectedLanguage,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset
  };
};

export default useSpeechToText;
