import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Mic, BookOpen, Users, Settings, LogOut, Plus, 
  ChevronRight, Clock, MapPin, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Toaster, toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, api, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, memoriesRes, membersRes] = await Promise.all([
        api.get('/stats'),
        api.get('/memories'),
        api.get('/members')
      ]);
      setStats(statsRes.data);
      setRecentMemories(memoriesRes.data.slice(0, 6));
      setMembers(membersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-emerald" />
          </div>
          <p className="text-charcoal-muted">Loading your family vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center">
              <Heart className="w-5 h-5 text-ivory" />
            </div>
            <div>
              <span className="font-serif text-xl text-charcoal block">Heirloom</span>
              <span className="text-sm text-charcoal-muted capitalize">{user?.family_name} Family</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-charcoal-light hidden sm:block">Welcome, {user?.member_name}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/settings')}
              data-testid="settings-btn"
            >
              <Settings className="w-5 h-5 text-charcoal-muted" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 text-charcoal-muted" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions - Elder Friendly */}
        <section className="mb-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Tell a Story - Primary Action */}
            <motion.button
              onClick={() => navigate('/voice-studio')}
              className="col-span-1 md:col-span-2 bg-emerald text-ivory p-8 rounded-2xl shadow-deep flex items-center justify-between group hover:bg-emerald-dark transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              data-testid="tell-story-btn"
            >
              <div className="text-left">
                <h2 className="font-serif text-3xl mb-2">Tell a Story</h2>
                <p className="text-ivory/80 text-lg">Share your memories through voice</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Mic className="w-10 h-10" />
              </div>
            </motion.button>

            {/* See Family */}
            <motion.button
              onClick={() => navigate('/family-tree')}
              className="card-paper p-6 text-left hover:shadow-deep transition-all group"
              whileHover={{ scale: 1.02 }}
              data-testid="see-family-btn"
            >
              <Users className="w-10 h-10 text-emerald mb-4" />
              <h3 className="font-serif text-xl text-charcoal mb-2">See My Family</h3>
              <p className="text-charcoal-muted">View your family tree</p>
              <ChevronRight className="w-5 h-5 text-emerald mt-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Family Members', value: stats?.members_count || 0, icon: <Users className="w-5 h-5" /> },
              { label: 'Stories Preserved', value: stats?.memories_count || 0, icon: <BookOpen className="w-5 h-5" /> },
              { label: 'Connections', value: stats?.relationships_count || 0, icon: <Heart className="w-5 h-5" /> },
              { label: 'Life Chapters', value: Object.keys(stats?.memories_by_stage || {}).length, icon: <Sparkles className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="card-paper p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-2 text-emerald">
                  {stat.icon}
                </div>
                <div className="font-serif text-3xl text-charcoal">{stat.value}</div>
                <div className="text-sm text-charcoal-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Memories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-charcoal">Recent Stories</h2>
            <Button 
              variant="ghost" 
              className="btn-ghost"
              onClick={() => navigate('/memories')}
              data-testid="view-all-memories-btn"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {recentMemories.length === 0 ? (
            <motion.div 
              className="card-paper p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald" />
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-2">No Stories Yet</h3>
              <p className="text-charcoal-muted mb-6">Start preserving your family's memories</p>
              <Button 
                className="btn-primary"
                onClick={() => navigate('/voice-studio')}
                data-testid="first-story-btn"
              >
                <Mic className="w-5 h-5 mr-2" />
                Tell Your First Story
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  className={`memory-card cursor-pointer border-l-4 ${getEmotionColor(memory.emotional_tone)}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/memories/${memory.id}`)}
                  data-testid={`memory-card-${memory.id}`}
                >
                  <h3 className="font-serif text-xl text-charcoal mb-2 line-clamp-1">
                    {memory.title}
                  </h3>
                  <p className="text-charcoal-muted line-clamp-3 mb-4">
                    {memory.narrative}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-charcoal-muted">
                    {memory.life_stage && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {memory.life_stage}
                      </span>
                    )}
                    {memory.place && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {memory.place}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Family Members */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-charcoal">Family Members</h2>
            <Button 
              variant="ghost" 
              className="btn-ghost"
              onClick={() => navigate('/family-tree')}
              data-testid="view-tree-btn"
            >
              View Tree
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            {members.map((member, index) => (
              <motion.button
                key={member.id}
                className="flex flex-col items-center gap-2 p-4 hover:bg-ivory-200/50 rounded-xl transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/profile/${member.id}`)}
                data-testid={`member-${member.id}`}
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center overflow-hidden border-2 border-ivory-300">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover img-heirloom" />
                  ) : (
                    <span className="font-serif text-xl text-emerald">
                      {member.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-charcoal">{member.name}</span>
              </motion.button>
            ))}
            
            <motion.button
              className="flex flex-col items-center gap-2 p-4 hover:bg-ivory-200/50 rounded-xl transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: members.length * 0.05 }}
              onClick={() => navigate('/family-tree?add=true')}
              data-testid="add-member-btn"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald/30 flex items-center justify-center">
                <Plus className="w-6 h-6 text-emerald/50" />
              </div>
              <span className="text-sm text-charcoal-muted">Add Member</span>
            </motion.button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Tablet Friendly */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ivory border-t border-ivory-300 py-4 px-6 md:hidden">
        <div className="flex items-center justify-around">
          {[
            { icon: <Mic className="w-6 h-6" />, label: 'Story', path: '/voice-studio' },
            { icon: <BookOpen className="w-6 h-6" />, label: 'Memories', path: '/memories' },
            { icon: <Users className="w-6 h-6" />, label: 'Family', path: '/family-tree' },
            { icon: <Settings className="w-6 h-6" />, label: 'Settings', path: '/settings' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 text-charcoal-muted hover:text-emerald transition-colors"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
