import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Save, User, MapPin, Calendar,
  BookOpen, Mic, Clock, ChevronRight, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Toaster, toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { user, api } = useAuth();
  
  const [member, setMember] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwnProfile = memberId === user?.member_id;

  useEffect(() => {
    loadProfile();
  }, [memberId]);

  const loadProfile = async () => {
    try {
      const [memberRes, memoriesRes] = await Promise.all([
        api.get(`/members/${memberId}`),
        api.get(`/memories?author_id=${memberId}`),
      ]);
      setMember(memberRes.data);
      setMemories(memoriesRes.data);
      setEditData(memberRes.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/members/${memberId}`, {
        name: editData.name,
        birth_year: editData.birth_year,
        birth_place: editData.birth_place,
        bio: editData.bio,
      });
      setMember(editData);
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

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

  const lifeStages = ['childhood', 'youth', 'adulthood', 'later_life'];

  const memoriesByStage = lifeStages.reduce((acc, stage) => {
    acc[stage] = memories.filter(m => m.life_stage === stage);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse text-charcoal-muted">Loading profile...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-charcoal-muted mx-auto mb-4" />
          <p className="text-charcoal-muted">Profile not found</p>
          <Button className="btn-primary mt-4" onClick={() => navigate('/dashboard')}>
            Go Home
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            {isOwnProfile && !editing && (
              <Button 
                variant="ghost" 
                onClick={() => setEditing(true)}
                data-testid="edit-profile-btn"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>
            )}
            <Button 
              className="btn-primary"
              onClick={() => navigate(`/export/${memberId}`)}
              data-testid="export-btn"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Life Book
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-paper p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-emerald/10 flex items-center justify-center border-4 border-ivory-300 overflow-hidden">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover img-heirloom" />
              ) : (
                <span className="font-serif text-4xl text-emerald">
                  {member.name?.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-charcoal-light">Name</Label>
                    <Input
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="input-heirloom"
                      data-testid="edit-name-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-charcoal-light">Birth Year</Label>
                      <Input
                        type="number"
                        value={editData.birth_year || ''}
                        onChange={(e) => setEditData({...editData, birth_year: parseInt(e.target.value) || null})}
                        className="input-heirloom"
                        placeholder="e.g., 1950"
                        data-testid="edit-birth-year-input"
                      />
                    </div>
                    <div>
                      <Label className="text-charcoal-light">Birth Place</Label>
                      <Input
                        value={editData.birth_place || ''}
                        onChange={(e) => setEditData({...editData, birth_place: e.target.value})}
                        className="input-heirloom"
                        placeholder="City, Country"
                        data-testid="edit-birth-place-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-charcoal-light">Bio</Label>
                    <Textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      className="input-heirloom"
                      placeholder="A few words about yourself..."
                      data-testid="edit-bio-input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button className="btn-primary" onClick={handleSave} data-testid="save-profile-btn">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-serif text-3xl text-charcoal mb-2">{member.name}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-charcoal-muted mb-4">
                    {member.birth_year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Born {member.birth_year}
                      </span>
                    )}
                    {member.birth_place && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {member.birth_place}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {memories.length} stories
                    </span>
                  </div>
                  {member.bio && (
                    <p className="text-charcoal-light leading-relaxed">{member.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Life Timeline */}
        <section>
          <h2 className="font-serif text-2xl text-charcoal mb-6">Life Story</h2>
          
          {memories.length === 0 ? (
            <motion.div 
              className="card-paper p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <BookOpen className="w-12 h-12 text-emerald mx-auto mb-4" />
              <h3 className="font-serif text-xl text-charcoal mb-2">No Stories Yet</h3>
              <p className="text-charcoal-muted mb-6">
                {isOwnProfile ? 'Start sharing your memories' : `${member.name} hasn't shared any stories yet`}
              </p>
              {isOwnProfile && (
                <Button 
                  className="btn-primary"
                  onClick={() => navigate('/voice-studio')}
                  data-testid="start-story-btn"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Tell a Story
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-12">
              {lifeStages.map((stage, stageIndex) => {
                const stageMemories = memoriesByStage[stage];
                if (stageMemories.length === 0) return null;
                
                const stageLabel = stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stageIndex * 0.1 }}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="timeline-dot" />
                      <h3 className="font-serif text-xl text-charcoal">{stageLabel}</h3>
                      <div className="flex-1 h-px bg-ivory-300" />
                      <span className="text-charcoal-muted text-sm">
                        {stageMemories.length} {stageMemories.length === 1 ? 'story' : 'stories'}
                      </span>
                    </div>

                    {/* Stage Memories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 border-l-2 border-ivory-300 pl-8">
                      {stageMemories.map((memory, memIndex) => (
                        <motion.div
                          key={memory.id}
                          className={`memory-card border-l-4 ${getEmotionColor(memory.emotional_tone)}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: memIndex * 0.05 }}
                          onClick={() => navigate(`/memories/${memory.id}`)}
                          data-testid={`memory-${memory.id}`}
                        >
                          <h4 className="font-serif text-lg text-charcoal mb-2 line-clamp-1">
                            {memory.title}
                          </h4>
                          <p className="text-charcoal-muted line-clamp-3 mb-3">
                            {memory.narrative}
                          </p>
                          <div className="flex items-center justify-between text-sm text-charcoal-muted">
                            <div className="flex items-center gap-2">
                              {memory.place && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {memory.place}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
