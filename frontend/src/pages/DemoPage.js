import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, BookOpen, ArrowLeft, ArrowRight, Play, Pause,
  Volume2, VolumeX, Download, ChevronRight, MapPin, Calendar,
  Sparkles, Home, Quote, Loader2, Mic, PlayCircle, StopCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { SageAvatar, SageBubble, SageFloatingButton } from '../components/SageCompanion';
import { HeirloomLogoLight } from '../components/HeirloomLogo';
import { 
  DEMO_FAMILY, DEMO_MEMBERS, DEMO_MEMORIES, SAGE_NARRATIONS, DEMO_STATS
} from '../data/demoFamily';
import { downloadDemoLifeBook } from '../utils/pdfExport';
import { transformToThirdPerson, createStoryIntro, createStoryClosing, getMemberGender } from '../utils/narrativeUtils';
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';
import { Toaster, toast } from 'sonner';

const DemoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'intro';
  
  // ElevenLabs TTS hook - with age-appropriate voice support
  const { 
    speakAsSage, 
    speakAsCharacter, 
    stop: stopTTS, 
    isLoading: ttsLoading, 
    isPlaying: ttsPlaying 
  } = useElevenLabsTTS();
  
  const [currentView, setCurrentView] = useState(initialView); // intro, family, memories, memory-detail, export
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [sageMessage, setSageMessage] = useState(null);
  const [showSage, setShowSage] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayTimer, setAutoplayTimer] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [narratorMode, setNarratorMode] = useState('original'); // 'sage' or 'original'

  // Combined playing state from TTS hook
  const isVoicePlaying = ttsPlaying;
  const isVoiceLoading = ttsLoading;

  // Sage narration for each view
  useEffect(() => {
    const narrations = {
      intro: SAGE_NARRATIONS.welcome,
      family: SAGE_NARRATIONS.familyTree,
      memories: SAGE_NARRATIONS.memoryView,
      'memory-detail': "This is a single memory in all its richness. Notice the emotions, the sensory details, the people involved. Every detail helps bring this moment back to life.",
      export: SAGE_NARRATIONS.export
    };
    
    if (showSage && narrations[currentView]) {
      setSageMessage(narrations[currentView]);
    }
  }, [currentView, showSage]);

  // Auto-play memories in cinematic mode
  useEffect(() => {
    if (isPlaying && currentView === 'memories') {
      const timer = setTimeout(() => {
        const nextIndex = (currentMemoryIndex + 1) % DEMO_MEMORIES.length;
        setCurrentMemoryIndex(nextIndex);
        setSelectedMemory(DEMO_MEMORIES[nextIndex]);
      }, 8000); // 8 seconds per memory
      
      setAutoplayTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentMemoryIndex, currentView]);

  // Play original voice using ElevenLabs (gender-appropriate)
  const playOriginalVoice = useCallback((text, member) => {
    if (!voiceEnabled || !text) return;
    
    const gender = getMemberGender(member);
    const birthYear = member?.birth_year || 1970;
    const age = 2024 - birthYear;
    const isYoung = age < 40;
    
    if (gender === 'male') {
      speakAsMale(text, isYoung);
    } else {
      speakAsFemale(text, isYoung);
    }
  }, [voiceEnabled, speakAsMale, speakAsFemale]);

  // Sage narrates story in third person using ElevenLabs
  const narrateWithSage = useCallback((memory, member) => {
    if (!voiceEnabled || !memory) return;
    
    const gender = getMemberGender(member);
    
    // Create introduction
    const intro = createStoryIntro(memory, member);
    
    // Transform narrative to third person
    const thirdPersonNarrative = transformToThirdPerson(memory.narrative, member.name, gender);
    
    // Create closing
    const closing = createStoryClosing(memory, member);
    
    // Full narration
    const fullNarration = `${intro} ${thirdPersonNarrative} ${closing}`;
    
    speakAsSage(fullNarration);
  }, [voiceEnabled, speakAsSage]);

  const handleMemorySelect = (memory, index) => {
    setSelectedMemory(memory);
    setCurrentMemoryIndex(index);
    stopTTS();
    // Don't auto-play, let user choose mode
  };

  const navigateMemory = (direction) => {
    stopTTS();
    const newIndex = direction === 'next' 
      ? (currentMemoryIndex + 1) % DEMO_MEMORIES.length
      : (currentMemoryIndex - 1 + DEMO_MEMORIES.length) % DEMO_MEMORIES.length;
    
    const memory = DEMO_MEMORIES[newIndex];
    setCurrentMemoryIndex(newIndex);
    setSelectedMemory(memory);
  };

  const getMemberMemories = (memberId) => {
    return DEMO_MEMORIES.filter(m => m.author_id === memberId);
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'from-amber-400 to-amber-600',
      nostalgia: 'from-purple-400 to-purple-600',
      love: 'from-rose-400 to-rose-600',
      pride: 'from-emerald-400 to-emerald-600',
      sadness: 'from-slate-400 to-slate-600',
      gratitude: 'from-teal-400 to-teal-600'
    };
    return colors[emotion] || 'from-gray-400 to-gray-600';
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '✨',
      nostalgia: '🌅',
      love: '💕',
      pride: '🏆',
      sadness: '🌧️',
      gratitude: '🙏'
    };
    return emojis[emotion] || '📖';
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress('Starting...');
    
    try {
      const success = await downloadDemoLifeBook((progress) => {
        setPdfProgress(progress);
      });
      
      if (success) {
        toast.success('Life Book downloaded! Check your downloads folder.');
      } else {
        toast.error('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while generating the PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-ivory overflow-hidden">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-charcoal/90 backdrop-blur-sm border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-ivory/70 hover:text-ivory transition-colors"
              data-testid="back-home-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Home</span>
            </button>
            <div className="w-px h-5 bg-ivory/20 hidden md:block" />
            <HeirloomLogoLight size="sm" showText={true} />
            <span className="text-ivory/50 text-sm hidden md:inline">Demo</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="text-ivory/70 hover:text-ivory h-9 w-9"
              data-testid="voice-toggle"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              className="btn-primary text-sm px-3 py-2"
              onClick={() => navigate('/auth?mode=create')}
              data-testid="start-your-vault-btn"
            >
              <span className="hidden sm:inline">Start Your Vault</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="fixed top-[57px] left-0 right-0 z-30 bg-charcoal/80 backdrop-blur-sm border-b border-ivory/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { id: 'intro', label: 'Introduction', icon: <Home className="w-4 h-4" /> },
              { id: 'family', label: 'Family Tree', icon: <Users className="w-4 h-4" /> },
              { id: 'memories', label: 'Memory Gallery', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'export', label: 'Life Book', icon: <Download className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  currentView === tab.id 
                    ? 'bg-emerald text-ivory' 
                    : 'text-ivory/60 hover:text-ivory hover:bg-ivory/10'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-24 min-h-screen">
        <AnimatePresence mode="wait">
          {/* INTRO VIEW */}
          {currentView === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-4 md:px-6"
            >
              {/* Hero */}
              <div className="text-center mb-12 md:mb-16">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-flex items-center gap-2 text-amber-400 text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    Demo Experience
                  </span>
                  <h1 className="font-serif text-5xl md:text-6xl text-ivory mb-4">
                    The {DEMO_FAMILY.name} Family
                  </h1>
                  <p className="text-xl text-ivory/70 max-w-2xl mx-auto">
                    {DEMO_FAMILY.tagline}
                  </p>
                </motion.div>
              </div>

              {/* Family Cover Image */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative rounded-3xl overflow-hidden mb-16 aspect-[21/9]"
              >
                <img 
                  src={DEMO_FAMILY.coverImage}
                  alt="Family gathering"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-wrap items-center gap-6 text-ivory/80">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Est. {DEMO_FAMILY.established}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {DEMO_FAMILY.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {DEMO_STATS.generations} Generations
                    </span>
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {DEMO_STATS.memories_count} Memories
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Family Members Preview */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="font-serif text-2xl text-ivory mb-6 text-center">Meet the Family</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {DEMO_MEMBERS.map((member, index) => (
                    <motion.button
                      key={member.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      onClick={() => {
                        setSelectedMember(member);
                        setCurrentView('family');
                      }}
                      className="group text-center"
                      data-testid={`member-preview-${member.id}`}
                    >
                      <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-ivory/20 group-hover:border-emerald transition-colors">
                          <img 
                            src={member.photo_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald flex items-center justify-center text-xs">
                          {getMemberMemories(member.id).length}
                        </div>
                      </div>
                      <p className="text-sm text-ivory">{member.nickname || member.name.split(' ')[0]}</p>
                      <p className="text-xs text-ivory/50">{member.role}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <Button
                  className="btn-primary text-lg px-8 py-6"
                  onClick={() => setCurrentView('memories')}
                  data-testid="explore-memories-btn"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Their Stories
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* FAMILY TREE VIEW */}
          {currentView === 'family' && (
            <motion.div
              key="family"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-6"
            >
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl text-ivory mb-2">Family Tree</h2>
                <p className="text-ivory/60">Click on any family member to see their stories</p>
              </div>

              {/* Tree Visualization */}
              <div className="relative">
                {/* Generation 1 - Grandparents */}
                <div className="flex justify-center gap-16 mb-8">
                  {DEMO_MEMBERS.filter(m => m.generation === 1).map((member) => (
                    <FamilyMemberCard 
                      key={member.id}
                      member={member}
                      isSelected={selectedMember?.id === member.id}
                      onClick={() => setSelectedMember(member)}
                      memoryCount={getMemberMemories(member.id).length}
                    />
                  ))}
                </div>
                
                {/* Connection Lines */}
                <div className="flex justify-center mb-8">
                  <div className="w-px h-12 bg-ivory/20" />
                </div>

                {/* Generation 2 - Parents */}
                <div className="flex justify-center gap-16 mb-8">
                  {DEMO_MEMBERS.filter(m => m.generation === 2).map((member) => (
                    <FamilyMemberCard 
                      key={member.id}
                      member={member}
                      isSelected={selectedMember?.id === member.id}
                      onClick={() => setSelectedMember(member)}
                      memoryCount={getMemberMemories(member.id).length}
                    />
                  ))}
                </div>

                {/* Connection Lines */}
                <div className="flex justify-center mb-8">
                  <div className="w-px h-12 bg-ivory/20" />
                </div>

                {/* Generation 3 - Children */}
                <div className="flex justify-center gap-16">
                  {DEMO_MEMBERS.filter(m => m.generation === 3).map((member) => (
                    <FamilyMemberCard 
                      key={member.id}
                      member={member}
                      isSelected={selectedMember?.id === member.id}
                      onClick={() => setSelectedMember(member)}
                      memoryCount={getMemberMemories(member.id).length}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Member Detail */}
              <AnimatePresence>
                {selectedMember && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-12 bg-ivory/5 rounded-2xl p-6 border border-ivory/10"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <img 
                        src={selectedMember.photo_url}
                        alt={selectedMember.name}
                        className="w-32 h-32 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-serif text-2xl text-ivory mb-1">{selectedMember.name}</h3>
                        <p className="text-amber-400 text-sm mb-3">{selectedMember.role}</p>
                        <p className="text-ivory/70 mb-4">{selectedMember.bio}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-ivory/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Born {selectedMember.birth_year}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedMember.birth_place}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {getMemberMemories(selectedMember.id).length} stories
                          </span>
                        </div>
                      </div>
                      <Button
                        className="btn-primary self-start"
                        onClick={() => {
                          const memories = getMemberMemories(selectedMember.id);
                          if (memories.length > 0) {
                            setSelectedMemory(memories[0]);
                            setCurrentMemoryIndex(DEMO_MEMORIES.findIndex(m => m.id === memories[0].id));
                            setCurrentView('memories');
                          }
                        }}
                        data-testid="view-member-stories-btn"
                      >
                        View Stories
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* MEMORIES GALLERY / CINEMATIC VIEW */}
          {currentView === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-8rem)]"
            >
              {selectedMemory ? (
                /* Cinematic Memory Detail View - Mobile Optimized */
                <div className="relative min-h-[calc(100vh-8rem)]">
                  {/* Background Image with stronger overlay for readability */}
                  <div className="fixed inset-0 top-32">
                    <img 
                      src={selectedMemory.cover_image}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-charcoal/95 via-charcoal/85 to-charcoal/95" />
                  </div>

                  {/* Content - Scrollable */}
                  <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-6 pb-40">
                    {/* Author */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 mb-4"
                    >
                      <img 
                        src={DEMO_MEMBERS.find(m => m.id === selectedMemory.author_id)?.photo_url}
                        alt={selectedMemory.author_name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-ivory/30"
                      />
                      <div>
                        <p className="text-ivory font-medium text-sm md:text-base">{selectedMemory.author_name}</p>
                        <p className="text-ivory/60 text-xs md:text-sm">{selectedMemory.life_stage} • {selectedMemory.time_period}</p>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-serif text-2xl md:text-4xl text-ivory mb-4"
                    >
                      {selectedMemory.title}
                    </motion.h2>

                    {/* Emotion Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4"
                    >
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getEmotionColor(selectedMemory.emotional_tone)} text-white text-xs md:text-sm`}>
                        {getEmotionEmoji(selectedMemory.emotional_tone)}
                        {selectedMemory.emotional_tone}
                      </span>
                    </motion.div>

                    {/* Narrative - Card style for better readability */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-charcoal/60 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-4 border border-ivory/10"
                    >
                      <p className="text-base md:text-xl text-ivory leading-relaxed">
                        &ldquo;{selectedMemory.narrative}&rdquo;
                      </p>
                    </motion.div>

                    {/* Voice Playback - Clean & Simple with ElevenLabs */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="mb-6"
                    >
                      {/* Big Play Button - Original Voice (Default) */}
                      <div className="flex flex-col items-center gap-4">
                        {(isVoicePlaying || isVoiceLoading) ? (
                          <motion.button
                            onClick={stopTTS}
                            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl"
                            whileTap={{ scale: 0.95 }}
                            data-testid="stop-voice-btn"
                          >
                            {isVoiceLoading ? (
                              <Loader2 className="w-10 h-10 animate-spin" />
                            ) : (
                              <StopCircle className="w-10 h-10" />
                            )}
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={() => {
                              setNarratorMode('original');
                              const member = DEMO_MEMBERS.find(m => m.id === selectedMemory.author_id);
                              playOriginalVoice(selectedMemory.narrative, member);
                            }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white flex items-center justify-center shadow-xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            data-testid="play-voice-btn"
                          >
                            <PlayCircle className="w-10 h-10" />
                          </motion.button>
                        )}
                        
                        {/* Label */}
                        <div className="text-center">
                          {isVoiceLoading ? (
                            <p className="text-ivory text-sm flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating natural voice...
                            </p>
                          ) : isVoicePlaying ? (
                            <p className="text-ivory text-sm flex items-center gap-2">
                              <motion.span
                                className="w-2 h-2 rounded-full bg-amber-400"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              {narratorMode === 'sage' ? 'Sage is narrating...' : 'Playing voice...'}
                            </p>
                          ) : (
                            <p className="text-ivory/80 text-sm">
                              <Mic className="w-4 h-4 inline mr-1" />
                              Hear {selectedMemory.author_name.split(' ')[0]}&apos;s Voice
                            </p>
                          )}
                        </div>

                        {/* Sage option - subtle secondary */}
                        {!(isVoicePlaying || isVoiceLoading) && (
                          <button
                            onClick={() => {
                              setNarratorMode('sage');
                              const member = DEMO_MEMBERS.find(m => m.id === selectedMemory.author_id);
                              narrateWithSage(selectedMemory, member);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-ivory/50 hover:text-ivory/80 text-sm transition-colors"
                          >
                            <SageAvatar size="sm" />
                            <span>or let Sage narrate</span>
                          </button>
                        )}
                      </div>
                    </motion.div>

                    {/* Highlights - Clean list */}
                    {selectedMemory.highlights?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-6 space-y-2"
                      >
                        <p className="text-xs text-ivory/50 uppercase tracking-wide mb-2">Key Moments</p>
                        {selectedMemory.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-2 text-amber-400 text-sm md:text-base">
                            <Quote className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                            <span className="italic">&ldquo;{highlight}&rdquo;</span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Sensory Details - Compact pills */}
                    {selectedMemory.sensory_cues && Object.keys(selectedMemory.sensory_cues).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                      >
                        <p className="text-xs text-ivory/50 uppercase tracking-wide mb-2">Sensory Details</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedMemory.sensory_cues).map(([sense, detail]) => detail && (
                            <span key={sense} className="px-2 py-1 bg-ivory/10 rounded-lg text-xs text-ivory/80">
                              <span className="text-amber-400 capitalize">{sense}:</span> {detail.length > 25 ? detail.substring(0, 25) + '...' : detail}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Fixed Bottom Controls */}
                  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal via-charcoal/95 to-transparent pt-8 pb-4 px-4 z-20">
                    {/* Memory Timeline - Horizontal scroll */}
                    <div className="max-w-4xl mx-auto mb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                        {DEMO_MEMORIES.map((memory, index) => (
                          <button
                            key={memory.id}
                            onClick={() => handleMemorySelect(memory, index)}
                            className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentMemoryIndex 
                                ? 'border-emerald ring-2 ring-emerald/30' 
                                : 'border-ivory/20 opacity-60 hover:opacity-100'
                            }`}
                            data-testid={`memory-thumb-${memory.id}`}
                          >
                            <img 
                              src={memory.cover_image}
                              alt={memory.title}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                      <span className="text-ivory/50 text-sm">
                        {currentMemoryIndex + 1}/{DEMO_MEMORIES.length}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMemory('prev')}
                          className="h-10 w-10 text-ivory hover:bg-ivory/10"
                          data-testid="prev-memory-btn"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="h-12 w-12 rounded-full bg-emerald text-ivory hover:bg-emerald/80"
                          data-testid="play-pause-btn"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigateMemory('next')}
                          className="h-10 w-10 text-ivory hover:bg-ivory/10"
                          data-testid="next-memory-btn"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMemory(null)}
                        className="text-ivory/70 hover:text-ivory text-sm"
                        data-testid="close-memory-detail-btn"
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Memory Grid View */
                <div className="max-w-6xl mx-auto px-6 py-8">
                  <div className="text-center mb-8">
                    <h2 className="font-serif text-3xl text-ivory mb-2">Memory Gallery</h2>
                    <p className="text-ivory/60">Click any memory to experience it in full</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEMO_MEMORIES.map((memory, index) => (
                      <motion.button
                        key={memory.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleMemorySelect(memory, index)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden text-left"
                        data-testid={`memory-card-${memory.id}`}
                      >
                        <img 
                          src={memory.cover_image}
                          alt={memory.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
                        
                        {/* Voice recording indicator */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-amber-500/90 rounded-full text-white text-xs">
                          <Mic className="w-3 h-3" />
                          <span>Voice</span>
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <img 
                              src={DEMO_MEMBERS.find(m => m.id === memory.author_id)?.photo_url}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs text-ivory/70">{memory.author_name.split(' ')[0]}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${getEmotionColor(memory.emotional_tone)} text-white`}>
                              {memory.emotional_tone}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg text-ivory group-hover:text-amber-400 transition-colors">
                            {memory.title}
                          </h3>
                          <p className="text-xs text-ivory/60 mt-1">{memory.time_period} • {memory.place}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* EXPORT / LIFE BOOK VIEW */}
          {currentView === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-6 py-8"
            >
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl text-ivory mb-4">Create a Life Book</h2>
                <p className="text-ivory/60 text-lg">
                  Turn memories into a beautiful printed keepsake
                </p>
              </div>

              {/* Book Preview */}
              <div className="relative mx-auto max-w-md mb-12">
                <motion.div
                  className="relative bg-gradient-to-br from-amber-900 to-amber-950 rounded-lg shadow-2xl overflow-hidden"
                  style={{ aspectRatio: '3/4' }}
                  animate={{ rotateY: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {/* Book spine effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-950 to-amber-900" />
                  
                  {/* Cover content */}
                  <div className="absolute inset-4 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                      <Heart className="w-10 h-10 text-amber-900" />
                    </div>
                    <h3 className="font-serif text-3xl text-amber-100 mb-2">
                      The {DEMO_FAMILY.name}
                    </h3>
                    <p className="text-amber-200/80 text-lg mb-4">Family Stories</p>
                    <div className="w-24 h-0.5 bg-amber-300/30 mb-4" />
                    <p className="text-amber-200/60 text-sm">
                      {DEMO_STATS.years_of_memories}
                    </p>
                  </div>

                  {/* Gold trim */}
                  <div className="absolute inset-0 border-4 border-amber-400/30 rounded-lg pointer-events-none" />
                </motion.div>
              </div>

              {/* Book Contents Preview */}
              <div className="bg-ivory/5 rounded-2xl p-6 mb-8">
                <h4 className="font-serif text-xl text-ivory mb-4">What&apos;s Inside</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['Childhood', 'Youth', 'Adulthood', 'Later Life'].map((stage) => {
                    const count = DEMO_MEMORIES.filter(m => m.life_stage === stage.toLowerCase().replace(' ', '_')).length;
                    return (
                      <div key={stage} className="flex items-center justify-between p-3 bg-ivory/5 rounded-lg">
                        <span className="text-ivory/80">{stage}</span>
                        <span className="text-amber-400">{count} stories</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export Options */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="btn-primary text-lg px-8 py-5"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  data-testid="download-demo-book-btn"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {pdfProgress}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Demo Book
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-lg px-8 py-5 border-ivory/20 text-ivory hover:bg-ivory/10"
                  onClick={() => navigate('/auth?mode=create')}
                  data-testid="create-your-book-btn"
                >
                  Create Your Own Book
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sage Companion */}
      <AnimatePresence>
        {showSage && sageMessage && (
          <SageBubble
            message={sageMessage}
            onClose={() => setShowSage(false)}
            position="bottom-left"
          />
        )}
      </AnimatePresence>

      {!showSage && (
        <SageFloatingButton
          onClick={() => setShowSage(true)}
          hasMessage={true}
        />
      )}

      {/* Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal to-transparent py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-ivory/70 hidden sm:block">
            {SAGE_NARRATIONS.cta}
          </p>
          <Button
            className="btn-primary"
            onClick={() => navigate('/auth?mode=create')}
            data-testid="bottom-cta-btn"
          >
            Create Your Family Vault
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Family Member Card Component
const FamilyMemberCard = ({ member, isSelected, onClick, memoryCount }) => (
  <motion.button
    onClick={onClick}
    className={`relative group ${isSelected ? 'scale-110' : ''}`}
    whileHover={{ scale: 1.05 }}
    data-testid={`family-card-${member.id}`}
  >
    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
      isSelected ? 'border-emerald shadow-lg shadow-emerald/30' : 'border-ivory/20 group-hover:border-ivory/40'
    }`}>
      <img 
        src={member.photo_url}
        alt={member.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="mt-2 text-center">
      <p className="text-ivory text-sm font-medium">{member.nickname || member.name.split(' ')[0]}</p>
      <p className="text-ivory/50 text-xs">{member.birth_year}</p>
    </div>
    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white font-medium">
      {memoryCount}
    </div>
  </motion.button>
);

export default DemoPage;
