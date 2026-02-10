import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Eye, ArrowLeft, Loader2, AlertCircle, 
  Play, Pause, MapPin, Calendar, Share2, Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import useElevenLabsTTS from '../hooks/useElevenLabsTTS';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SharedStoryPage = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasHearted, setHasHearted] = useState(false);
  
  const { 
    isPlaying, 
    isLoading: isVoiceLoading, 
    speakAsSage, 
    stop 
  } = useElevenLabsTTS();

  useEffect(() => {
    fetchStory();
    // Check if user has already hearted (stored in localStorage)
    const hearted = localStorage.getItem(`hearted_${shareToken}`);
    if (hearted) setHasHearted(true);
  }, [shareToken]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stories/shared/${shareToken}`);
      const data = await response.json();
      
      if (response.ok) {
        setStory(data);
      } else {
        setError(data.detail || 'Story not found');
      }
    } catch (err) {
      setError('Unable to load story');
    } finally {
      setLoading(false);
    }
  };

  const handleHeart = async () => {
    if (hasHearted) return;
    
    try {
      const response = await fetch(`${API_URL}/api/stories/shared/${shareToken}/heart`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStory(prev => ({ ...prev, heart_count: data.heart_count }));
        setHasHearted(true);
        localStorage.setItem(`hearted_${shareToken}`, 'true');
        toast.success('Thank you for your love! ❤️');
      }
    } catch (err) {
      console.error('Failed to heart story');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: `A beautiful family story: ${story.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePlayVoice = () => {
    if (isPlaying) {
      stop();
    } else {
      speakAsSage(story.narrative, { emotion: story.emotional_tone || 'warm' });
    }
  };

  const getEmotionColor = (tone) => {
    const colors = {
      'joy': 'from-amber-500 to-orange-500',
      'love': 'from-rose-500 to-pink-500',
      'nostalgia': 'from-indigo-500 to-purple-500',
      'pride': 'from-emerald-500 to-teal-500',
      'sadness': 'from-blue-500 to-indigo-500',
      'gratitude': 'from-amber-500 to-yellow-500'
    };
    return colors[tone] || 'from-sage to-sage-light';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal-light rounded-2xl p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-ivory mb-2">Story Not Found</h1>
          <p className="text-ivory/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-sage text-charcoal rounded-full hover:bg-sage-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Discover Heirloom
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${story.cover_image || ''})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-charcoal/80 to-charcoal" />
      </div>
      
      <div className="relative max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Discover Heirloom</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-ivory/10 rounded-full text-ivory hover:bg-ivory/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>

        {/* Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal-light/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-ivory/10"
        >
          {/* Cover Image */}
          {story.cover_image && (
            <div className="relative h-64 md:h-80">
              <img 
                src={story.cover_image} 
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              {story.author_photo ? (
                <img src={story.author_photo} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center">
                  <span className="text-sage text-lg">{story.author_name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-ivory font-medium">{story.author_name}</p>
                <div className="flex items-center gap-3 text-sm text-ivory/60">
                  {story.time_period && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {story.time_period}
                    </span>
                  )}
                  {story.place && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {story.place}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-serif text-ivory mb-4">{story.title}</h1>

            {/* Emotion Badge */}
            {story.emotional_tone && (
              <span className={`inline-block px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${getEmotionColor(story.emotional_tone)} mb-4`}>
                {story.emotional_tone}
              </span>
            )}

            {/* Voice Button */}
            <button
              onClick={handlePlayVoice}
              disabled={isVoiceLoading}
              className="w-full mb-6 py-4 bg-sage/20 hover:bg-sage/30 rounded-xl flex items-center justify-center gap-3 transition-colors"
              data-testid="play-story-voice-btn"
            >
              {isVoiceLoading ? (
                <Loader2 className="w-6 h-6 text-sage animate-spin" />
              ) : isPlaying ? (
                <>
                  <Pause className="w-6 h-6 text-sage" />
                  <span className="text-ivory">Pause Story</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-6 h-6 text-sage" />
                  <span className="text-ivory">Listen to this Story</span>
                </>
              )}
            </button>

            {/* Narrative */}
            <div className="bg-charcoal/50 rounded-xl p-6 mb-6">
              <p className="text-ivory leading-relaxed text-lg">
                &ldquo;{story.narrative}&rdquo;
              </p>
            </div>

            {/* Highlights */}
            {story.highlights && story.highlights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-ivory/60 mb-2">Key Moments</h3>
                <div className="flex flex-wrap gap-2">
                  {story.highlights.map((highlight, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      "{highlight}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center justify-between pt-6 border-t border-ivory/10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-ivory/60">
                  <Eye className="w-5 h-5" />
                  {story.view_count || 0} views
                </span>
                <button
                  onClick={handleHeart}
                  disabled={hasHearted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    hasHearted 
                      ? 'bg-rose-500/20 text-rose-400' 
                      : 'bg-ivory/10 text-ivory hover:bg-rose-500/20 hover:text-rose-400'
                  }`}
                  data-testid="heart-story-btn"
                >
                  <Heart className={`w-5 h-5 ${hasHearted ? 'fill-rose-400' : ''}`} />
                  {story.heart_count || 0}
                </button>
              </div>
              
              <a
                href="/"
                className="text-sm text-sage hover:underline"
              >
                Create your family's Heirloom →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-ivory/40 text-sm">
            Preserved with love on{' '}
            <a href="/" className="text-sage hover:underline">Heirloom</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedStoryPage;
