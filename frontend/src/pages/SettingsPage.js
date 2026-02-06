import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Shield, Bell, Download, Trash2,
  ChevronRight, LogOut, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: false,
    aiSuggestions: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User className="w-5 h-5" />,
          label: 'Edit Profile',
          description: 'Update your name, bio, and photo',
          action: () => navigate(`/profile/${user?.member_id}`),
        },
        {
          icon: <Shield className="w-5 h-5" />,
          label: 'Privacy Settings',
          description: 'Control who can see your stories',
          toggle: true,
          toggleKey: 'publicProfile',
          toggleLabel: 'Public profile',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell className="w-5 h-5" />,
          label: 'Notifications',
          description: 'Get notified about new family stories',
          toggle: true,
          toggleKey: 'notifications',
        },
        {
          icon: <Heart className="w-5 h-5" />,
          label: 'AI Suggestions',
          description: 'Get personalized story prompts',
          toggle: true,
          toggleKey: 'aiSuggestions',
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: <Download className="w-5 h-5" />,
          label: 'Export All Data',
          description: 'Download your stories and family data',
          action: () => {
            toast.info('Data export feature coming soon');
          },
        },
      ],
    },
  ];

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

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h3 className="font-medium text-charcoal-muted mb-3">{section.title}</h3>
            <div className="card-paper divide-y divide-ivory-300">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`p-4 flex items-center justify-between ${item.action ? 'cursor-pointer hover:bg-ivory-200/50 transition-colors' : ''}`}
                  onClick={item.action}
                  data-testid={`setting-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-muted">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-charcoal font-medium">{item.label}</p>
                      <p className="text-sm text-charcoal-muted">{item.description}</p>
                    </div>
                  </div>
                  
                  {item.toggle ? (
                    <Switch
                      checked={settings[item.toggleKey]}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({ ...prev, [item.toggleKey]: checked }));
                        toast.success(`${item.label} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                      data-testid={`toggle-${item.toggleKey}`}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-charcoal-muted" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
