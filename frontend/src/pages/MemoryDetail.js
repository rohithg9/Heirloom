import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Trash2, MapPin, Clock, Heart, 
  Users, Calendar, Eye, EyeOff, Volume2, Save, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';

const MemoryDetail = () => {
  const navigate = useNavigate();
  const { memoryId } = useParams();
  const { user, api } = useAuth();
  
  const [memory, setMemory] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwner = memory?.author_id === user?.member_id;

  useEffect(() => {
    loadMemory();
  }, [memoryId]);

  const loadMemory = async () => {
    try {
      const response = await api.get(`/memories/${memoryId}`);
      setMemory(response.data);
      setEditData(response.data);
      
      // Load author info
      const authorRes = await api.get(`/members/${response.data.author_id}`);
      setAuthor(authorRes.data);
    } catch (error) {
      toast.error('Failed to load memory');
      navigate('/memories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/memories/${memoryId}`, {
        title: editData.title,
        narrative: editData.narrative,
        time_period: editData.time_period,
        life_stage: editData.life_stage,
        place: editData.place,
        emotional_tone: editData.emotional_tone,
        highlights: editData.highlights,
        privacy_level: editData.privacy_level,
      });
      setMemory(editData);
      setEditing(false);
      toast.success('Memory updated');
    } catch (error) {
      toast.error('Failed to update memory');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/memories/${memoryId}`);
      toast.success('Memory deleted');
      navigate('/memories');
    } catch (error) {
      toast.error('Failed to delete memory');
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'bg-amber/20 border-amber text-amber',
      nostalgia: 'bg-emerald/10 border-emerald text-emerald',
      love: 'bg-rose/20 border-rose text-rose',
      pride: 'bg-amber/30 border-amber text-amber',
      gratitude: 'bg-emerald/20 border-emerald text-emerald',
      sadness: 'bg-charcoal/10 border-charcoal-muted text-charcoal-muted',
    };
    return colors[emotion] || 'bg-ivory-200 border-ivory-300 text-charcoal';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse text-charcoal-muted">Loading memory...</div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal-muted">Memory not found</p>
          <Button className="btn-primary mt-4" onClick={() => navigate('/memories')}>
            View All Memories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setEditing(true)}
                data-testid="edit-memory-btn"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-rose" data-testid="delete-memory-btn">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-ivory">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Delete this memory?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This memory will be permanently removed from your family vault.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-rose hover:bg-rose/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title & Meta */}
          <header className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${getEmotionColor(memory.emotional_tone)}`}>
              <Heart className="w-4 h-4" />
              <span className="capitalize">{memory.emotional_tone || 'Memory'}</span>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
              {memory.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-charcoal-muted">
              {author && (
                <button 
                  onClick={() => navigate(`/profile/${author.id}`)}
                  className="flex items-center gap-2 hover:text-emerald transition-colors"
                  data-testid="author-link"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center">
                    <span className="text-emerald text-sm">{author.name?.charAt(0)}</span>
                  </div>
                  <span>{author.name}</span>
                </button>
              )}
              
              {memory.life_stage && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {memory.life_stage.replace('_', ' ')}
                </span>
              )}
              
              {memory.place && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {memory.place}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                {memory.privacy_level === 'private' ? (
                  <><EyeOff className="w-4 h-4" /> Private</>
                ) : (
                  <><Eye className="w-4 h-4" /> Family</>
                )}
              </span>
            </div>
          </header>

          {/* Narrative */}
          <div className="card-paper p-8 md:p-12">
            <p className="text-charcoal text-xl leading-relaxed whitespace-pre-wrap">
              {memory.narrative}
            </p>
          </div>

          {/* Highlights */}
          {memory.highlights && memory.highlights.length > 0 && (
            <div className="bg-emerald/5 border-l-4 border-emerald p-6 rounded-r-xl">
              <h3 className="font-serif text-lg text-emerald mb-4">Highlights</h3>
              <div className="space-y-3">
                {memory.highlights.map((highlight, i) => (
                  <blockquote key={i} className="text-charcoal italic text-lg">
                    "{highlight}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Sensory Cues */}
          {memory.sensory_cues && Object.keys(memory.sensory_cues).some(k => memory.sensory_cues[k]) && (
            <div className="card-paper p-6">
              <h3 className="font-serif text-lg text-charcoal mb-4">Sensory Memories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(memory.sensory_cues).map(([sense, value]) => value && (
                  <div key={sense} className="text-center">
                    <div className="text-sm text-charcoal-muted capitalize mb-1">{sense}</div>
                    <div className="text-charcoal">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* People Involved */}
          {memory.people_involved && memory.people_involved.length > 0 && (
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-charcoal-muted" />
              <div className="flex flex-wrap gap-2">
                {memory.people_involved.map((person, i) => (
                  <span key={i} className="bg-ivory-200 px-3 py-1 rounded-full text-charcoal-light">
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.article>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-ivory max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-charcoal">Edit Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-charcoal-light">Title</Label>
              <Input
                value={editData.title || ''}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                className="input-heirloom"
                data-testid="edit-title-input"
              />
            </div>
            
            <div>
              <Label className="text-charcoal-light">Story</Label>
              <Textarea
                value={editData.narrative || ''}
                onChange={(e) => setEditData({...editData, narrative: e.target.value})}
                className="input-heirloom min-h-[200px]"
                data-testid="edit-narrative-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-charcoal-light">Life Stage</Label>
                <Select 
                  value={editData.life_stage || ''} 
                  onValueChange={(v) => setEditData({...editData, life_stage: v})}
                >
                  <SelectTrigger className="input-heirloom" data-testid="edit-stage-select">
                    <SelectValue placeholder="Select" />
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
                  value={editData.emotional_tone || ''} 
                  onValueChange={(v) => setEditData({...editData, emotional_tone: v})}
                >
                  <SelectTrigger className="input-heirloom" data-testid="edit-emotion-select">
                    <SelectValue placeholder="Select" />
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
                value={editData.place || ''}
                onChange={(e) => setEditData({...editData, place: e.target.value})}
                className="input-heirloom"
                placeholder="Where did this happen?"
                data-testid="edit-place-input"
              />
            </div>
            
            <div>
              <Label className="text-charcoal-light">Privacy</Label>
              <Select 
                value={editData.privacy_level || 'family'} 
                onValueChange={(v) => setEditData({...editData, privacy_level: v})}
              >
                <SelectTrigger className="input-heirloom" data-testid="edit-privacy-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                  <SelectItem value="family">Family (All Members)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSave} data-testid="save-edit-btn">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoryDetail;
