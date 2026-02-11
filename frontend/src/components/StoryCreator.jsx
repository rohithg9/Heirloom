import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, ArrowLeft, Loader2, Save, 
  Sparkles, Clock, MapPin, Heart, X, Image as ImageIcon,
  Volume2, Globe, Check, Plus, Trash2, Eye, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { SageAvatar } from '../components/SageCompanion';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Indian languages with native scripts
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
];

const StoryCreator = ({ isDemo = false, onSaveRequest }) => {
  const navigate = useNavigate();
  const { api, user, isAuthenticated } = useAuth() || {};
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  // Transcription state
  const [originalText, setOriginalText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  
  // Language selection
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Photos
  const [photos, setPhotos] = useState([]);
  const photoInputRef = useRef(null);
  
  // Story analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [storyAnalysis, setStoryAnalysis] = useState(null);
  
  // Preview mode
  const [showPreview, setShowPreview] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  
  // Saving
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Duration timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started. Speak your story...');
      
    } catch (err) {
      console.error('Microphone access error:', err);
      toast.error('Unable to access microphone. Please grant permission.');
    }
  };

  // Stop recording and transcribe
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    clearInterval(recordingIntervalRef.current);
    
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Transcribe
        await transcribeAudio(audioBlob);
        resolve();
      };
      
      mediaRecorderRef.current.stop();
    });
  };

  // Transcribe audio using Whisper
  const transcribeAudio = async (blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        try {
          const response = await fetch(`${API_URL}/api/stt/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio_data: base64Audio,
              language: selectedLanguage !== 'en' ? selectedLanguage : null,
              translate_to_english: true
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setOriginalText(data.text || '');
            setEnglishText(data.text_english || data.text || '');
            setDetectedLanguage(data.language || selectedLanguage);
            
            toast.success('Transcription complete!');
            
            // Auto-analyze after transcription
            if (data.text) {
              await analyzeStory(data.text_english || data.text);
            }
          } else {
            const error = await response.json();
            toast.error(error.detail || 'Transcription failed');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          toast.error('Transcription failed. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setIsTranscribing(false);
      toast.error('Error processing audio');
    }
  };

  // Analyze story for emotions, key moments, etc.
  const analyzeStory = async (text) => {
    if (!text || text.length < 20) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/ai/analyze-story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setStoryAnalysis(analysis);
        setStoryTitle(analysis.suggested_title || '');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      // Generate basic analysis locally if API fails
      setStoryAnalysis({
        emotions: ['nostalgia', 'love'],
        highlights: [text.substring(0, 50) + '...'],
        suggested_title: 'My Story',
        time_period: '',
        people: [],
        places: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: reader.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // Save story
  const saveStory = async () => {
    if (!isAuthenticated && !isDemo) {
      // Prompt login
      if (onSaveRequest) {
        onSaveRequest({
          originalText,
          englishText,
          language: detectedLanguage,
          photos,
          analysis: storyAnalysis,
          title: storyTitle
        });
      }
      return;
    }
    
    if (isDemo) {
      toast.success('Create an account to save your stories!');
      navigate('/auth?mode=create');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Upload photos first
      const photoUrls = [];
      for (const photo of photos) {
        const formData = new FormData();
        formData.append('file', photo.file);
        
        const uploadRes = await api.upload('/upload/image', formData);
        if (uploadRes.url) {
          photoUrls.push(uploadRes.url);
        }
      }
      
      // Create memory
      const memoryData = {
        title: storyTitle || 'My Story',
        narrative: englishText,
        narrative_original: originalText,
        narrative_english: englishText,
        original_language: detectedLanguage,
        emotional_tone: storyAnalysis?.emotions?.[0] || 'nostalgia',
        highlights: storyAnalysis?.highlights || [],
        time_period: storyAnalysis?.time_period || '',
        people_involved: storyAnalysis?.people || [],
        place: storyAnalysis?.places?.[0] || '',
        cover_image: photoUrls[0] || null,
        photos: photoUrls
      };
      
      const response = await api.post('/memories', memoryData);
      
      if (response.id) {
        toast.success('Story saved successfully!');
        navigate(`/memories/${response.id}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get language info
  const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[1];

  return (
    <div className="min-h-screen bg-charcoal pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-charcoal/95 backdrop-blur-sm border-b border-ivory/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-ivory/60 hover:text-ivory"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <SageAvatar size="sm" />
            <span className="font-serif text-ivory">Share Your Story</span>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-ivory/10 rounded-full text-ivory text-sm"
              data-testid="language-selector"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLanguage.native}</span>
            </button>
            
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-charcoal-light border border-ivory/20 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        selectedLanguage === lang.code 
                          ? 'bg-sage/20 text-sage' 
                          : 'text-ivory hover:bg-ivory/10'
                      }`}
                    >
                      {lang.native} <span className="text-ivory/50">({lang.name})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Recording Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal-light rounded-2xl p-6 border border-ivory/10"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-serif text-ivory mb-2">
              {isRecording ? 'Listening...' : 'Tap to Record'}
            </h2>
            <p className="text-ivory/60 text-sm">
              Speak in {currentLanguage.native}. We'll transcribe and translate instantly.
            </p>
          </div>
          
          {/* Big Mic Button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-sage hover:bg-sage-light'
              } ${isTranscribing ? 'opacity-50' : ''}`}
              data-testid="record-button"
            >
              {isTranscribing ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </motion.button>
            
            {isRecording && (
              <div className="flex items-center gap-2 text-red-400">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono">{formatDuration(recordingDuration)}</span>
              </div>
            )}
            
            {isTranscribing && (
              <p className="text-sage text-sm">Transcribing your story...</p>
            )}
          </div>
        </motion.div>

        {/* Real-time Transcription Display */}
        {(originalText || isTranscribing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Original Language Box */}
            <div className="bg-charcoal-light rounded-xl p-4 border border-sage/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-sage uppercase">
                  {LANGUAGES.find(l => l.code === detectedLanguage)?.native || 'Original'}
                </span>
              </div>
              <p className="text-ivory text-lg leading-relaxed min-h-[60px]">
                {originalText || (isTranscribing ? '...' : '')}
              </p>
            </div>
            
            {/* English Translation Box */}
            {detectedLanguage !== 'en' && (
              <div className="bg-charcoal-light rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-amber-400 uppercase">
                    English Translation
                  </span>
                </div>
                <p className="text-ivory/80 text-base leading-relaxed min-h-[60px]">
                  {englishText || (isTranscribing ? 'Translating...' : '')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Photo Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-charcoal-light rounded-xl p-4 border border-ivory/10"
        >
          <h3 className="text-ivory font-medium mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sage" />
            Add Photos (up to 3)
          </h3>
          
          <div className="flex gap-3 flex-wrap">
            {photos.map(photo => (
              <div key={photo.id} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            
            {photos.length < 3 && (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-ivory/30 rounded-lg flex flex-col items-center justify-center text-ivory/50 hover:border-sage hover:text-sage transition-colors"
                data-testid="add-photo-btn"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
          
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </motion.div>

        {/* Story Analysis / Preview */}
        {(storyAnalysis || isAnalyzing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-sage/10 to-amber-500/10 rounded-xl p-4 border border-sage/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-sage" />
              <h3 className="text-ivory font-medium">Story Insights</h3>
              {isAnalyzing && <Loader2 className="w-4 h-4 text-sage animate-spin ml-auto" />}
            </div>
            
            {storyAnalysis && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-ivory/50 uppercase mb-1 block">Suggested Title</label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Give your story a title"
                    className="w-full bg-charcoal border border-ivory/20 rounded-lg px-3 py-2 text-ivory placeholder:text-ivory/40"
                    data-testid="story-title-input"
                  />
                </div>
                
                {/* Emotions */}
                {storyAnalysis.emotions?.length > 0 && (
                  <div>
                    <label className="text-xs text-ivory/50 uppercase mb-2 block">Emotions</label>
                    <div className="flex flex-wrap gap-2">
                      {storyAnalysis.emotions.map((emotion, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-sm">
                          {emotion === 'love' && '❤️'} 
                          {emotion === 'nostalgia' && '💭'} 
                          {emotion === 'joy' && '😊'} 
                          {emotion === 'pride' && '🏆'} 
                          {emotion === 'sadness' && '😢'} 
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Key Moments */}
                {storyAnalysis.highlights?.length > 0 && (
                  <div>
                    <label className="text-xs text-ivory/50 uppercase mb-2 block">Key Moments</label>
                    <div className="space-y-1">
                      {storyAnalysis.highlights.slice(0, 3).map((highlight, i) => (
                        <p key={i} className="text-ivory/80 text-sm italic">"{highlight}"</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Time & Place */}
                <div className="flex gap-4 text-sm">
                  {storyAnalysis.time_period && (
                    <span className="flex items-center gap-1 text-ivory/60">
                      <Clock className="w-4 h-4" />
                      {storyAnalysis.time_period}
                    </span>
                  )}
                  {storyAnalysis.places?.[0] && (
                    <span className="flex items-center gap-1 text-ivory/60">
                      <MapPin className="w-4 h-4" />
                      {storyAnalysis.places[0]}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Save Button - Fixed at bottom on mobile */}
        {(originalText || englishText) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-charcoal border-t border-ivory/10 md:relative md:bg-transparent md:border-0 md:p-0 safe-area-bottom"
          >
            <button
              onClick={saveStory}
              disabled={isSaving || isTranscribing}
              className="w-full py-4 bg-sage text-charcoal font-medium rounded-xl hover:bg-sage-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="save-story-btn"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : isDemo ? (
                <>
                  <Save className="w-5 h-5" />
                  Create Account to Save
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Approve & Save Story
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryCreator;
