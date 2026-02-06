import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Home, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Toaster, toast } from 'sonner';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createVault, joinVault, login, isAuthenticated } = useAuth();
  
  const [mode, setMode] = useState(searchParams.get('mode') || 'login'); // create, join, login
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    family_name: '',
    family_code: '',
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        await createVault({
          family_name: formData.family_name,
          family_code: formData.family_code,
          created_by_name: formData.name,
          created_by_email: formData.email,
          password: formData.password,
        });
        toast.success('Family vault created successfully!');
      } else if (mode === 'join') {
        await joinVault({
          family_name: formData.family_name,
          family_code: formData.family_code,
          member_name: formData.name,
          member_email: formData.email,
          password: formData.password,
        });
        toast.success('Joined family vault successfully!');
      } else {
        await login({
          family_name: formData.family_name,
          family_code: formData.family_code,
          email: formData.email,
          password: formData.password,
        });
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'login', label: 'Sign In', icon: <Users className="w-5 h-5" /> },
    { id: 'create', label: 'Create Vault', icon: <Heart className="w-5 h-5" /> },
    { id: 'join', label: 'Join Vault', icon: <Home className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      <Toaster position="top-center" richColors />
      
      {/* Left Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1758686254593-7c4cd55b2621?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Family memories"
          className="w-full h-full object-cover img-heirloom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="font-serif text-ivory text-4xl mb-4">
            Your Family's Stories Deserve Forever
          </h2>
          <p className="text-ivory/80 text-lg">
            A private sanctuary for the memories that make your family unique.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-charcoal-light hover:text-charcoal transition-colors"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center">
              <Heart className="w-5 h-5 text-ivory" />
            </div>
            <span className="font-serif text-xl text-charcoal">Heirloom</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex bg-ivory-200 rounded-full p-1 mb-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-medium transition-all
                    ${mode === tab.id 
                      ? 'bg-ivory text-charcoal shadow-soft' 
                      : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  data-testid={`${tab.id}-tab`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="font-serif text-3xl text-charcoal mb-2">
                    {mode === 'create' && 'Create Your Family Vault'}
                    {mode === 'join' && 'Join Your Family'}
                    {mode === 'login' && 'Welcome Back'}
                  </h1>
                  <p className="text-charcoal-muted">
                    {mode === 'create' && 'Start preserving your family\'s stories'}
                    {mode === 'join' && 'Connect with your family\'s memories'}
                    {mode === 'login' && 'Continue your family\'s journey'}
                  </p>
                </div>

                {/* Family Name */}
                <div className="space-y-2">
                  <Label htmlFor="family_name" className="text-charcoal-light text-lg">
                    Family Name
                  </Label>
                  <Input
                    id="family_name"
                    name="family_name"
                    placeholder="e.g., Sharma, Johnson, Patel"
                    value={formData.family_name}
                    onChange={handleChange}
                    className="input-heirloom"
                    required
                    data-testid="family-name-input"
                  />
                </div>

                {/* Family Code */}
                <div className="space-y-2">
                  <Label htmlFor="family_code" className="text-charcoal-light text-lg">
                    Family Code
                  </Label>
                  <Input
                    id="family_code"
                    name="family_code"
                    type="password"
                    placeholder={mode === 'create' ? 'Create a secret code' : 'Enter family code'}
                    value={formData.family_code}
                    onChange={handleChange}
                    className="input-heirloom"
                    required
                    data-testid="family-code-input"
                  />
                  {mode === 'create' && (
                    <p className="text-sm text-charcoal-muted">
                      Share this code with family members to let them join
                    </p>
                  )}
                </div>

                {/* Name - for create and join */}
                {(mode === 'create' || mode === 'join') && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-charcoal-light text-lg">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-heirloom"
                      required
                      data-testid="name-input"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-charcoal-light text-lg">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-heirloom"
                    required
                    data-testid="email-input"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-charcoal-light text-lg">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-heirloom pr-12"
                      required
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                      data-testid="toggle-password-btn"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="btn-primary w-full text-lg"
                  disabled={loading}
                  data-testid="submit-auth-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {mode === 'create' && 'Create Vault'}
                  {mode === 'join' && 'Join Vault'}
                  {mode === 'login' && 'Sign In'}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
