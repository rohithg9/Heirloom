import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const JoinInvitePage = () => {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    inviteCode: '',
    memberName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    validateInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken]);

  const validateInvite = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invites/validate/${inviteToken}`);
      const data = await response.json();
      
      if (response.ok) {
        setInviteValid(true);
        setInviteInfo(data);
        if (data.invited_name) {
          setFormData(prev => ({ ...prev, memberName: data.invited_name }));
        }
      } else {
        setError(data.detail || 'Invalid or expired invite');
      }
    } catch (err) {
      setError('Unable to validate invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/invites/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_token: inviteToken,
          invite_code: formData.inviteCode,
          member_name: formData.memberName,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and redirect
        localStorage.setItem('heirloom_token', data.token);
        localStorage.setItem('heirloom_vault_id', data.vault_id);
        localStorage.setItem('heirloom_member_id', data.member_id);
        localStorage.setItem('heirloom_family_name', data.family_name);
        localStorage.setItem('heirloom_member_name', data.member_name);
        
        toast.success(`Welcome to the ${data.family_name} family!`);
        navigate('/dashboard');
      } else {
        toast.error(data.detail || 'Failed to join family');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-2xl font-serif text-ivory mb-2">Invalid Invite</h1>
          <p className="text-ivory/60 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-sage text-charcoal rounded-full hover:bg-sage-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal-light/80 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-ivory/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-sage" />
            </div>
            <h1 className="text-2xl font-serif text-ivory mb-2">
              Join {inviteInfo?.family_name} Family
            </h1>
            <p className="text-ivory/60">
              You've been invited to preserve precious memories together
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ivory/70 mb-1">Invite Code</label>
              <input
                type="text"
                value={formData.inviteCode}
                onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value }))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 bg-charcoal border border-ivory/20 rounded-xl text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-sage text-center text-xl tracking-widest"
                required
                data-testid="invite-code-input"
              />
              <p className="text-xs text-ivory/50 mt-1">Ask the person who invited you for the code</p>
            </div>
            
            <div>
              <label className="block text-sm text-ivory/70 mb-1">Your Name</label>
              <input
                type="text"
                value={formData.memberName}
                onChange={(e) => setFormData(prev => ({ ...prev, memberName: e.target.value }))}
                placeholder="Your full name"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/20 rounded-xl text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-sage"
                required
                data-testid="member-name-input"
              />
            </div>
            
            <div>
              <label className="block text-sm text-ivory/70 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/20 rounded-xl text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-sage"
                required
                data-testid="email-input"
              />
            </div>
            
            <div>
              <label className="block text-sm text-ivory/70 mb-1">Create Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/20 rounded-xl text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-sage"
                required
                data-testid="password-input"
              />
            </div>
            
            <div>
              <label className="block text-sm text-ivory/70 mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-charcoal border border-ivory/20 rounded-xl text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-sage"
                required
                data-testid="confirm-password-input"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-sage text-charcoal font-medium rounded-xl hover:bg-sage-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="join-family-btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Join Family
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-ivory/40 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="text-sage hover:underline"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinInvitePage;
