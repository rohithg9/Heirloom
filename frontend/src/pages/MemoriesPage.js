import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, BookOpen, Clock, MapPin, 
  Heart, Plus, ChevronDown, Grid, List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Toaster, toast } from 'sonner';

const MemoriesPage = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const response = await api.get('/memories');
      setMemories(response.data);
    } catch (error) {
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.narrative.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === 'all' || memory.life_stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'bg-amber/20 border-amber',
      nostalgia: 'bg-emerald/10 border-emerald',
      love: 'bg-rose/20 border-rose',
      pride: 'bg-amber/30 border-amber',
      gratitude: 'bg-emerald/20 border-emerald',
      sadness: 'bg-charcoal/10 border-charcoal-muted',
    };
    return colors[emotion] || 'bg-ivory-200 border-ivory-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse text-charcoal-muted">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="font-serif text-2xl text-charcoal">All Memories</h1>
          
          <Button 
            className="btn-primary"
            onClick={() => navigate('/voice-studio')}
            data-testid="new-memory-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">New Story</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="input-heirloom pl-12"
              data-testid="search-input"
            />
          </div>
          
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="input-heirloom w-full sm:w-48" data-testid="filter-stage">
              <SelectValue placeholder="Life Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="childhood">Childhood</SelectItem>
              <SelectItem value="youth">Youth</SelectItem>
              <SelectItem value="adulthood">Adulthood</SelectItem>
              <SelectItem value="later_life">Later Life</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 border border-ivory-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-ivory-200' : ''}`}
              data-testid="grid-view-btn"
            >
              <Grid className="w-5 h-5 text-charcoal-muted" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-ivory-200' : ''}`}
              data-testid="list-view-btn"
            >
              <List className="w-5 h-5 text-charcoal-muted" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-charcoal-muted mb-6">
          {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'} found
        </p>

        {/* Memories Grid/List */}
        {filteredMemories.length === 0 ? (
          <motion.div 
            className="card-paper p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen className="w-12 h-12 text-emerald mx-auto mb-4" />
            <h3 className="font-serif text-xl text-charcoal mb-2">No Memories Found</h3>
            <p className="text-charcoal-muted mb-6">
              {searchQuery || filterStage !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start preserving your family stories'}
            </p>
            <Button 
              className="btn-primary"
              onClick={() => navigate('/voice-studio')}
              data-testid="create-first-btn"
            >
              Tell Your First Story
            </Button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory.id}
                className={`memory-card cursor-pointer border-l-4 ${getEmotionColor(memory.emotional_tone)} ${
                  viewMode === 'list' ? 'flex gap-6' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/memories/${memory.id}`)}
                data-testid={`memory-card-${memory.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-charcoal mb-2 line-clamp-1">
                    {memory.title}
                  </h3>
                  <p className={`text-charcoal-muted mb-4 ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                    {memory.narrative}
                  </p>
                  
                  {memory.highlights && memory.highlights.length > 0 && (
                    <blockquote className="text-charcoal italic text-sm border-l-2 border-emerald pl-3 mb-4 line-clamp-2">
                      "{memory.highlights[0]}"
                    </blockquote>
                  )}
                  
                  <div className="flex items-center flex-wrap gap-3 text-sm text-charcoal-muted">
                    {memory.life_stage && (
                      <span className="flex items-center gap-1 bg-ivory-200 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {memory.life_stage.replace('_', ' ')}
                      </span>
                    )}
                    {memory.place && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {memory.place}
                      </span>
                    )}
                    {memory.emotional_tone && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {memory.emotional_tone}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MemoriesPage;
