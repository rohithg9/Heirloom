import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, ArrowLeft, Send, Loader2, Save, 
  Sparkles, ChevronDown, Clock, MapPin, Heart, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Toaster, toast } from 'sonner';

const VoiceStudio = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  
  const [mode, setMode] = useState('welcome'); // welcome, recording, interview, review
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedMemory, setExtractedMemory] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error('Voice recognition error. Please try again.');
        }
      };
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const startRecording = () => {
    setIsRecording(true);
    setMode('recording');
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error('Failed to stop recording:', e);
    }
    if (transcript.trim()) {
      sendToAI(transcript);
    }
  };

  const sendToAI = async (message) => {
    setLoading(true);
    setMode('interview');
    
    const newMessages = [...aiMessages, { role: 'user', content: message }];
    setAiMessages(newMessages);
    setUserInput('');
    setTranscript('');

    try {
      const response = await api.post('/ai/interview', {
        message,
        session_id: sessionId,
      });

      setSessionId(response.data.session_id);
      setAiMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
      
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
      toast.error('Failed to get response. Please try again.');
      setAiMessages([...newMessages, { 
        role: 'assistant', 
        content: "I'm here to listen. Please take your time and share what's on your mind." 
      }]);
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
              <p className="text-charcoal-muted text-xl mb-12 max-w-md">
                Press the button and speak naturally. Our AI companion will listen and help preserve your memories.
              </p>
              
              <motion.button
                onClick={startRecording}
                className="voice-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="start-recording-btn"
              >
                <Mic className="w-12 h-12" />
              </motion.button>
              
              <p className="text-charcoal-muted mt-6">Tap to start speaking</p>
              
              {/* Quick prompts */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                {[
                  "Tell me about your childhood home",
                  "What's your favorite family tradition?",
                  "Share a memory of your parents",
                  "What was your wedding day like?",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMode('interview');
                      sendToAI(prompt);
                    }}
                    className="card-paper p-4 text-left hover:shadow-deep transition-all text-charcoal-muted hover:text-charcoal"
                    data-testid={`prompt-${i}`}
                  >
                    <Sparkles className="w-4 h-4 mb-2 text-emerald" />
                    {prompt}
                  </button>
                ))}
              </div>
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
                  {isRecording ? "I'm listening..." : "Processing..."}
                </h2>
                <p className="text-charcoal-muted">
                  Speak naturally. Take your time.
                </p>
              </div>

              {/* Recording visualization */}
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
                {isRecording ? 'Tap to finish' : 'Tap to continue'}
              </p>

              {/* Live transcript */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 w-full max-w-xl"
                >
                  <div className="card-paper p-6">
                    <p className="text-charcoal text-xl leading-relaxed">
                      "{transcript}"
                    </p>
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
                      onClick={isRecording ? stopRecording : startRecording}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Save Memory Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-ivory max-w-lg">
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
                      <SelectItem value="childhood">Childhood</SelectItem>
                      <SelectItem value="youth">Youth</SelectItem>
                      <SelectItem value="adulthood">Adulthood</SelectItem>
                      <SelectItem value="later_life">Later Life</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
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
    </div>
  );
};

export default VoiceStudio;
