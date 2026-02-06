import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, ArrowLeft, Send, Loader2, Save, 
  Sparkles, Clock, MapPin, Heart, X, Edit2, Check,
  Volume2, VolumeX, Globe, Pause, Play, History, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { SageAvatar } from '../components/SageCompanion';

// Language options
const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
];

const VoiceStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { api, user } = useAuth();
  
  // Core state
  const [mode, setMode] = useState('welcome'); // welcome, recording, interview, review
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionId, setSessionId] = useState(searchParams.get('session') || null);
  const [loading, setLoading] = useState(false);
  const [extractedMemory, setExtractedMemory] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [savedSessions, setSavedSessions] = useState([]);
  
  // Voice & Language settings
  const [language, setLanguage] = useState(localStorage.getItem('heirloom_language') || 'en-US');
  const [voiceEnabled, setVoiceEnabled] = useState(localStorage.getItem('heirloom_voice') !== 'false');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Audio recording state (for saving user's actual voice)
  const [audioRecording, setAudioRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('heirloom_language', language);
  }, [language]);

  // Save voice preference
  useEffect(() => {
    localStorage.setItem('heirloom_voice', voiceEnabled.toString());
  }, [voiceEnabled]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          setEditableTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error('Voice recognition error. Please try again.');
        }
      };
    }
  }, [language]);

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Load existing session if provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, []);

  // Load saved sessions
  useEffect(() => {
    loadSavedSessions();
  }, []);

  const loadSavedSessions = async () => {
    try {
      const response = await api.get('/ai/sessions');
      setSavedSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (sid) => {
    try {
      const response = await api.get(`/ai/sessions/${sid}`);
      const session = response.data;
      
      // Reconstruct messages
      const messages = session.messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      setAiMessages(messages);
      setSessionId(sid);
      setMode('interview');
      toast.success('Session loaded. Continue your story!');
    } catch (error) {
      toast.error('Failed to load session');
    }
  };

  // Text-to-Speech function
  const speak = useCallback((text) => {
    if (!voiceEnabled || !text) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for elders
    utterance.pitch = 1;
    
    // Find a voice that matches the language
    const voices = synthRef.current.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled, language]);

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // Start actual audio recording (to save user's voice)
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsAudioRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isAudioRecording) {
      mediaRecorderRef.current.stop();
      setIsAudioRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Upload audio recording to server
  const uploadAudioRecording = async (memoryId = null) => {
    if (!audioBlob) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      if (memoryId) formData.append('memory_id', memoryId);
      formData.append('title', extractedMemory?.title || 'Voice Recording');
      
      const response = await api.post('/audio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Voice recording saved! Your voice is now preserved with this memory.');
      return response.data;
    } catch (error) {
      console.error('Failed to upload audio:', error);
      toast.error('Failed to save voice recording');
      return null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = () => {
    setIsRecording(true);
    setMode('recording');
    setTranscript('');
    setEditableTranscript('');
    setAudioBlob(null);
    setAudioUrl(null);
    try {
      recognitionRef.current?.start();
      // Also start audio recording to capture actual voice
      startAudioRecording();
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    try {
      recognitionRef.current?.stop();
      // Also stop audio recording
      stopAudioRecording();
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
  };

  const confirmTranscript = () => {
    if (editableTranscript.trim()) {
      sendToAI(editableTranscript.trim());
    }
    setIsEditingTranscript(false);
  };

  const sendToAI = async (message) => {
    setLoading(true);
    setMode('interview');
    
    const newMessages = [...aiMessages, { role: 'user', content: message }];
    setAiMessages(newMessages);
    setUserInput('');
    setTranscript('');
    setEditableTranscript('');

    try {
      const response = await api.post('/ai/interview', {
        message,
        session_id: sessionId,
        language: language,
      });

      setSessionId(response.data.session_id);
      
      const aiResponse = response.data.response;
      setAiMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
      
      // Speak the AI response
      speak(aiResponse);
      
      if (response.data.extracted_memory) {
        setExtractedMemory(response.data.extracted_memory);
        toast.success('A memory has been captured! Review and save it.', {
          action: {
            label: 'View',
            onClick: () => setShowSaveDialog(true),
          },
        });
      }
    } catch (error) {
      const fallbackResponse = "I'm here to listen. Please take your time and share what's on your mind.";
      setAiMessages([...newMessages, { role: 'assistant', content: fallbackResponse }]);
      speak(fallbackResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      sendToAI(userInput.trim());
    }
  };

  const saveMemory = async () => {
    if (!extractedMemory) return;

    try {
      await api.post('/memories', {
        title: extractedMemory.title || 'Untitled Memory',
        narrative: extractedMemory.narrative || '',
        time_period: extractedMemory.time_period,
        life_stage: extractedMemory.life_stage,
        people_involved: extractedMemory.people_involved || [],
        place: extractedMemory.place,
        emotional_tone: extractedMemory.emotional_tone,
        sensory_cues: extractedMemory.sensory_cues || {},
        occasion: extractedMemory.occasion,
        highlights: extractedMemory.highlights || [],
        privacy_level: 'family',
        confidence: 'clear',
      });
      
      toast.success('Memory saved to your family vault!');
      setExtractedMemory(null);
      setShowSaveDialog(false);
    } catch (error) {
      toast.error('Failed to save memory. Please try again.');
    }
  };

  const startNewConversation = () => {
    // Start with Sage greeting
    const greeting = "Hello! I'm Sage, your memory guide. I'm so glad you're here to share your story. I'd love to hear about your life. Tell me about an interesting memory — maybe from your childhood, your school days, or a special moment with family. Take your time, I'm here to listen.";
    
    setMode('interview');
    setAiMessages([{ role: 'assistant', content: greeting }]);
    setSessionId(null);
    speak(greeting);
  };

  const continueSession = (sid) => {
    loadSession(sid);
    setShowSessionsDialog(false);
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 input-heirloom h-10" data-testid="language-select">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Voice Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`h-10 w-10 ${voiceEnabled ? 'text-emerald' : 'text-charcoal-muted'}`}
              data-testid="voice-toggle"
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            
            {/* Saved Sessions */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                loadSavedSessions();
                setShowSessionsDialog(true);
              }}
              className="h-10 w-10"
              data-testid="sessions-btn"
            >
              <History className="w-5 h-5" />
            </Button>
            
            {extractedMemory && (
              <Button 
                className="btn-primary"
                onClick={() => setShowSaveDialog(true)}
                data-testid="review-memory-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Review Memory
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {mode === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <h1 className="font-serif text-4xl text-charcoal mb-4">
                Share Your Story
              </h1>
              <p className="text-charcoal-muted text-xl mb-8 max-w-md">
                I'll listen and help preserve your precious memories. 
                {voiceEnabled ? " I'll speak too, like a friend." : ""}
              </p>
              
              {/* Language reminder */}
              <div className="mb-8 flex items-center gap-2 text-charcoal-muted">
                <Globe className="w-5 h-5" />
                <span>Speaking in: {LANGUAGES.find(l => l.code === language)?.name}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  onClick={startNewConversation}
                  className="btn-primary text-xl px-8 py-5 flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid="start-conversation-btn"
                >
                  <Sparkles className="w-6 h-6" />
                  Start a New Story
                </motion.button>
                
                {savedSessions.length > 0 && (
                  <motion.button
                    onClick={() => setShowSessionsDialog(true)}
                    className="btn-secondary text-xl px-8 py-5 flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    data-testid="continue-story-btn"
                  >
                    <History className="w-6 h-6" />
                    Continue a Story
                  </motion.button>
                )}
              </div>
              
              <motion.button
                onClick={startRecording}
                className="voice-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="start-recording-btn"
              >
                <Mic className="w-12 h-12" />
              </motion.button>
              
              <p className="text-charcoal-muted mt-6">Or tap to speak directly</p>
            </motion.div>
          )}

          {/* Recording Screen */}
          {mode === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-charcoal mb-2">
                  {isRecording ? "I'm listening..." : "Review your words"}
                </h2>
                <p className="text-charcoal-muted">
                  {isRecording ? "Speak naturally. Take your time." : "Edit if needed, then send."}
                </p>
              </div>

              {/* Recording button */}
              <motion.div
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="recording-btn"
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </motion.div>
              
              <p className="text-charcoal-muted mt-4">
                {isRecording ? 'Tap to finish' : 'Tap to record more'}
              </p>

              {/* Editable transcript */}
              {editableTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-xl"
                >
                  <div className="card-paper p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-charcoal-muted">Your words (you can edit)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                        data-testid="edit-transcript-btn"
                      >
                        {isEditingTranscript ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    {isEditingTranscript ? (
                      <Textarea
                        value={editableTranscript}
                        onChange={(e) => setEditableTranscript(e.target.value)}
                        className="input-heirloom min-h-[120px]"
                        data-testid="transcript-textarea"
                      />
                    ) : (
                      <p className="text-charcoal text-xl leading-relaxed">
                        "{editableTranscript}"
                      </p>
                    )}
                    
                    {!isRecording && editableTranscript && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditableTranscript('');
                            setTranscript('');
                          }}
                          data-testid="clear-transcript-btn"
                        >
                          Clear
                        </Button>
                        <Button
                          className="btn-primary"
                          onClick={confirmTranscript}
                          data-testid="send-transcript-btn"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send to AI
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Interview/Chat Screen */}
          {mode === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Session info */}
              {sessionId && (
                <div className="text-center mb-4">
                  <span className="text-sm text-charcoal-muted bg-ivory-200 px-3 py-1 rounded-full">
                    Session saved automatically
                  </span>
                </div>
              )}
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {aiMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-emerald text-ivory rounded-br-none' 
                        : 'card-paper rounded-bl-none'
                    }`}>
                      <p className={`text-lg leading-relaxed ${
                        msg.role === 'user' ? '' : 'text-charcoal'
                      }`}>
                        {msg.content}
                      </p>
                      
                      {/* Replay button for AI messages */}
                      {msg.role === 'assistant' && voiceEnabled && (
                        <button
                          onClick={() => speak(msg.content)}
                          className="mt-2 text-emerald hover:text-emerald-dark text-sm flex items-center gap-1"
                          data-testid={`replay-${i}`}
                        >
                          <Volume2 className="w-4 h-4" />
                          Listen again
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="card-paper p-4 rounded-2xl rounded-bl-none">
                      <div className="flex items-center gap-2 text-charcoal-muted">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Speaking indicator */}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-2 text-emerald bg-emerald/10 px-4 py-2 rounded-full"
                      data-testid="stop-speaking-btn"
                    >
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      Speaking... (tap to stop)
                    </button>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-ivory-300 pt-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type or speak your response..."
                      className="input-heirloom min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      data-testid="message-input"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-12 w-12 rounded-full ${isRecording ? 'bg-rose text-white' : ''}`}
                      onClick={() => {
                        if (isRecording) {
                          stopRecording();
                          if (editableTranscript) {
                            setUserInput(prev => prev + ' ' + editableTranscript);
                            setEditableTranscript('');
                          }
                        } else {
                          setTranscript('');
                          setEditableTranscript('');
                          startRecording();
                        }
                      }}
                      data-testid="voice-input-btn"
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button
                      className="btn-primary h-12 w-12 rounded-full p-0"
                      onClick={handleSendMessage}
                      disabled={loading || !userInput.trim()}
                      data-testid="send-btn"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Show live transcript while recording in chat mode */}
                {isRecording && editableTranscript && (
                  <div className="mt-3 p-3 bg-rose/10 rounded-lg text-charcoal-muted">
                    <span className="text-sm">Recording: </span>
                    <span className="text-charcoal">"{editableTranscript}"</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Save Memory Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-ivory max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-charcoal">
              Memory Captured
            </DialogTitle>
          </DialogHeader>
          
          {extractedMemory && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-charcoal-light">Title</Label>
                <Input 
                  value={extractedMemory.title || ''} 
                  onChange={(e) => setExtractedMemory({...extractedMemory, title: e.target.value})}
                  className="input-heirloom"
                  data-testid="memory-title-input"
                />
              </div>
              
              <div>
                <Label className="text-charcoal-light">Story</Label>
                <Textarea 
                  value={extractedMemory.narrative || ''} 
                  onChange={(e) => setExtractedMemory({...extractedMemory, narrative: e.target.value})}
                  className="input-heirloom min-h-[120px]"
                  data-testid="memory-narrative-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-charcoal-light">Life Stage</Label>
                  <Select 
                    value={extractedMemory.life_stage || ''} 
                    onValueChange={(v) => setExtractedMemory({...extractedMemory, life_stage: v})}
                  >
                    <SelectTrigger className="input-heirloom" data-testid="life-stage-select">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="childhood">Childhood (0-12)</SelectItem>
                      <SelectItem value="youth">Youth (13-25)</SelectItem>
                      <SelectItem value="adulthood">Adulthood (26-55)</SelectItem>
                      <SelectItem value="later_life">Later Life (55+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-charcoal-light">Approximate Age</Label>
                  <Input 
                    type="number"
                    value={extractedMemory.approximate_age || ''} 
                    onChange={(e) => setExtractedMemory({...extractedMemory, approximate_age: e.target.value})}
                    className="input-heirloom"
                    placeholder="e.g., 8"
                    data-testid="memory-age-input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-charcoal-light">Emotion</Label>
                  <Select 
                    value={extractedMemory.emotional_tone || ''} 
                    onValueChange={(v) => setExtractedMemory({...extractedMemory, emotional_tone: v})}
                  >
                    <SelectTrigger className="input-heirloom" data-testid="emotion-select">
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joy">Joy</SelectItem>
                      <SelectItem value="nostalgia">Nostalgia</SelectItem>
                      <SelectItem value="love">Love</SelectItem>
                      <SelectItem value="pride">Pride</SelectItem>
                      <SelectItem value="gratitude">Gratitude</SelectItem>
                      <SelectItem value="sadness">Sadness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-charcoal-light">Place</Label>
                  <Input 
                    value={extractedMemory.place || ''} 
                    onChange={(e) => setExtractedMemory({...extractedMemory, place: e.target.value})}
                    className="input-heirloom"
                    placeholder="Where did this happen?"
                    data-testid="memory-place-input"
                  />
                </div>
              </div>
              
              {extractedMemory.highlights?.length > 0 && (
                <div className="card-paper p-4">
                  <Label className="text-charcoal-light mb-2 block">Highlights</Label>
                  {extractedMemory.highlights.map((h, i) => (
                    <p key={i} className="text-charcoal italic">"{h}"</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)} data-testid="cancel-save-btn">
              Cancel
            </Button>
            <Button className="btn-primary" onClick={saveMemory} data-testid="save-memory-btn">
              <Save className="w-4 h-4 mr-2" />
              Save to Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Sessions Dialog */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className="bg-ivory max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-charcoal">
              Continue a Story
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
            {savedSessions.length === 0 ? (
              <p className="text-charcoal-muted text-center py-8">
                No saved stories yet. Start a new one!
              </p>
            ) : (
              savedSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => continueSession(session.session_id)}
                  className="w-full card-paper p-4 text-left hover:shadow-deep transition-all"
                  data-testid={`session-${session.session_id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-charcoal font-medium">
                        Story Session
                      </p>
                      <p className="text-sm text-charcoal-muted">
                        {new Date(session.created_at).toLocaleDateString()} at{' '}
                        {new Date(session.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Play className="w-5 h-5 text-emerald" />
                  </div>
                </button>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSessionsDialog(false)}>
              Close
            </Button>
            <Button className="btn-primary" onClick={() => {
              setShowSessionsDialog(false);
              startNewConversation();
            }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start New Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceStudio;
