import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Shield, Bell, Download, Trash2,
  ChevronRight, LogOut, Heart, Volume2, VolumeX, Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: false,
    aiSuggestions: true,
  });
  
  // Language and voice settings from localStorage
  const [language, setLanguage] = useState(localStorage.getItem('heirloom_language') || 'en-US');
  const [voiceEnabled, setVoiceEnabled] = useState(localStorage.getItem('heirloom_voice') !== 'false');

  // Save language when changed
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('heirloom_language', newLang);
    toast.success(`Language changed to ${LANGUAGES.find(l => l.code === newLang)?.name}`);
  };

  // Save voice setting when changed
  const handleVoiceToggle = (enabled) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('heirloom_voice', enabled.toString());
    toast.success(`AI voice ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-ivory border-b border-ivory-300 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="font-serif text-2xl text-charcoal">Settings</h1>
          
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* User Info */}
        <motion.div 
          className="card-paper p-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center">
            <span className="font-serif text-2xl text-emerald">
              {user?.member_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-serif text-xl text-charcoal">{user?.member_name}</h2>
            <p className="text-charcoal-muted capitalize">{user?.family_name} Family</p>
            <span className="text-sm text-emerald">{user?.role}</span>
          </div>
        </motion.div>

        {/* Language & Voice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-medium text-charcoal-muted mb-3">Language & Voice</h3>
          <div className="card-paper divide-y divide-ivory-300">
            {/* Language Selection */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">Story Language</p>
                    <p className="text-sm text-charcoal-muted">Language for voice recognition & AI</p>
                  </div>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48 input-heirloom" data-testid="language-setting">
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
              </div>
            </div>
            
            {/* Voice Toggle */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                    {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">AI Voice Responses</p>
                    <p className="text-sm text-charcoal-muted">Let AI speak responses aloud</p>
                  </div>
                </div>
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={handleVoiceToggle}
                  data-testid="voice-setting-toggle"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-medium text-charcoal-muted mb-3">Account</h3>
          <div className="card-paper divide-y divide-ivory-300">
            <button
              onClick={() => navigate(`/profile/${user?.member_id}`)}
              className="p-4 flex items-center justify-between w-full hover:bg-ivory-200/50 transition-colors"
              data-testid="edit-profile-setting"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-charcoal font-medium">Edit Profile</p>
                  <p className="text-sm text-charcoal-muted">Update your name, bio, and photo</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-charcoal-muted" />
            </button>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">Privacy Settings</p>
                    <p className="text-sm text-charcoal-muted">Control who sees your stories</p>
                  </div>
                </div>
                <Switch
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, publicProfile: checked }));
                    toast.success(`Profile ${checked ? 'public' : 'private'}`);
                  }}
                  data-testid="privacy-toggle"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium text-charcoal-muted mb-3">Preferences</h3>
          <div className="card-paper divide-y divide-ivory-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">Notifications</p>
                    <p className="text-sm text-charcoal-muted">Get notified about new stories</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, notifications: checked }));
                    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                  data-testid="notifications-toggle"
                />
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-charcoal font-medium">AI Suggestions</p>
                    <p className="text-sm text-charcoal-muted">Get personalized story prompts</p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiSuggestions}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, aiSuggestions: checked }));
                    toast.success(`AI suggestions ${checked ? 'enabled' : 'disabled'}`);
                  }}
                  data-testid="ai-suggestions-toggle"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-medium text-charcoal-muted mb-3">Data</h3>
          <div className="card-paper divide-y divide-ivory-300">
            <button
              onClick={() => toast.info('Data export feature coming soon')}
              className="p-4 flex items-center justify-between w-full hover:bg-ivory-200/50 transition-colors"
              data-testid="export-data-setting"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-charcoal font-medium">Export All Data</p>
                  <p className="text-sm text-charcoal-muted">Download your stories and family data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-charcoal-muted" />
            </button>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-medium text-charcoal-muted mb-3">Account Actions</h3>
          <div className="card-paper divide-y divide-ivory-300">
            <button
              onClick={handleLogout}
              className="p-4 flex items-center gap-4 w-full hover:bg-ivory-200/50 transition-colors"
              data-testid="logout-btn"
            >
              <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-charcoal font-medium">Sign Out</p>
                <p className="text-sm text-charcoal-muted">Log out of your account</p>
              </div>
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-4 flex items-center gap-4 w-full hover:bg-rose/5 transition-colors"
                  data-testid="delete-account-btn"
                >
                  <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center text-rose">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-rose font-medium">Delete Account</p>
                    <p className="text-sm text-charcoal-muted">Permanently remove your data</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-ivory">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all your stories. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-rose hover:bg-rose/90"
                    onClick={() => toast.info('Account deletion coming soon')}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        {/* App Info */}
        <div className="text-center pt-8 text-charcoal-muted text-sm">
          <p>Heirloom v1.0.0</p>
          <p className="mt-1">Made with love for families everywhere</p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
