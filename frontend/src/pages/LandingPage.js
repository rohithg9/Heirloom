import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Home, ArrowRight, Heart, Mic, BookOpen, Play, Sparkles, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SageAvatar, SageWelcomeModal } from '../components/SageCompanion';
import { HeirloomLogo } from '../components/HeirloomLogo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showSageWelcome, setShowSageWelcome] = useState(false);
  const [hasSeenSage, setHasSeenSage] = useState(() => {
    return localStorage.getItem('heirloom_seen_sage') === 'true';
  });

  // Show Sage welcome after a short delay for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem('heirloom_seen_sage');
    if (!seen) {
      const timer = setTimeout(() => {
        setShowSageWelcome(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleExploreDemo = () => {
    localStorage.setItem('heirloom_seen_sage', 'true');
    setShowSageWelcome(false);
    setHasSeenSage(true);
    navigate('/demo');
  };

  const handleCloseSageWelcome = () => {
    localStorage.setItem('heirloom_seen_sage', 'true');
    setShowSageWelcome(false);
    setHasSeenSage(true);
  };

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice-First Stories",
      description: "Share memories naturally through conversation with our gentle AI companion"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Tree",
      description: "Build an organic, living tree that connects generations of your family"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Life Books",
      description: "Export beautiful PDF books of your family's stories to treasure forever"
    }
  ];

  // Life moments that represent the product concept
  const lifeMoments = [
    {
      image: "https://images.unsplash.com/photo-1761671614198-20038c11fe89?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Wedding Day",
      description: "The day two lives became one"
    },
    {
      image: "https://images.unsplash.com/photo-1764816655546-e4aef64918f7?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Adventures Together",
      description: "Travels that shaped who we are"
    },
    {
      image: "https://images.unsplash.com/photo-1720798299028-c3bfaf06b522?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Celebrations",
      description: "Milestones worth remembering"
    },
    {
      image: "https://images.unsplash.com/photo-1576089073624-b5751a8f4de9?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Family Gatherings",
      description: "Meals that brought us together"
    },
    {
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Friendships",
      description: "Bonds that last forever"
    },
    {
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?crop=entropy&cs=srgb&fm=jpg&q=85",
      title: "Home Memories",
      description: "Where life happened"
    }
  ];

  return (
    <div className="min-h-screen bg-ivory relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image - Old photographs showing memories */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1722173205783-d602329f0743?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Vintage family photographs"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/90 via-ivory/70 to-ivory" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <HeirloomLogo size="md" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button 
              variant="ghost" 
              className="btn-ghost hidden sm:flex items-center gap-2"
              onClick={() => navigate('/demo')}
              data-testid="demo-btn"
            >
              <Play className="w-4 h-4" />
              Demo
            </Button>
            <Button 
              variant="ghost" 
              className="btn-ghost"
              onClick={() => navigate('/auth')}
              data-testid="login-btn"
            >
              Sign In
            </Button>
            <Button 
              className="btn-primary"
              onClick={() => navigate('/auth?mode=create')}
              data-testid="get-started-btn"
            >
              Get Started
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="font-serif text-charcoal mb-6">
              Preserve Your Family&apos;s<br/>
              Living Legacy
            </h1>
            <p className="text-xl md:text-2xl text-charcoal-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Every life has moments worth preserving — weddings, travels, celebrations, 
              and the everyday magic that makes your family unique.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Demo button FIRST with attractive background */}
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg md:text-xl px-8 py-5 rounded-xl shadow-lg"
                onClick={() => navigate('/demo')}
                data-testid="explore-demo-btn"
              >
                <Play className="w-5 h-5 mr-2" />
                Try the Demo Experience
              </Button>
              
              {/* Create vault button second */}
              <Button 
                className="w-full sm:w-auto btn-primary text-lg md:text-xl px-8 py-5 group"
                onClick={() => navigate('/auth?mode=create')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                data-testid="create-vault-btn"
              >
                Create Your Family Vault
                <motion.span
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-charcoal-muted flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-charcoal-muted rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Life Moments Gallery - The Product Concept */}
      <section className="py-24 px-6 bg-charcoal">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-ivory mb-4">Life&apos;s Best Moments</h2>
            <p className="text-ivory/70 text-xl max-w-2xl mx-auto">
              From your wedding day to family dinners, every memory tells your story
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {lifeMoments.map((moment, index) => (
              <motion.div
                key={index}
                className="relative rounded-xl overflow-hidden aspect-[4/3] group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={moment.image}
                  alt={moment.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-ivory font-serif text-lg md:text-xl">{moment.title}</h3>
                  <p className="text-ivory/70 text-sm hidden md:block">{moment.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-ivory-200/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-charcoal mb-4">A Digital Heirloom</h2>
            <p className="text-charcoal-light text-xl max-w-2xl mx-auto">
              More than an app — a sanctuary for your family&apos;s most precious memories
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-paper p-8 text-center hover:shadow-deep transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-6 text-emerald">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-xl text-charcoal mb-3">{feature.title}</h3>
                <p className="text-charcoal-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 px-6 bg-emerald text-ivory">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <blockquote className="font-serif text-3xl md:text-4xl leading-relaxed mb-8 italic">
            &ldquo;Every ordinary life deserves to be preserved with the dignity, 
            voice, and beauty usually reserved for kings and queens.&rdquo;
          </blockquote>
          <div className="w-16 h-0.5 bg-ivory/30 mx-auto" />
        </motion.div>
      </section>

      {/* How It Works - Elder Friendly */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-charcoal mb-4">Simple as a Conversation</h2>
            <p className="text-charcoal-light text-xl max-w-2xl mx-auto">
              Just speak naturally — our AI listens like a caring friend
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1761829792955-ef883430594f?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Happy elderly couple on park bench"
                  className="rounded-2xl shadow-deep img-heirloom"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-amber flex items-center justify-center">
                  <Mic className="w-10 h-10 text-ivory" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-serif text-charcoal">
                Designed for<br/>
                Every Generation
              </h2>
              <p className="text-charcoal-light text-xl leading-relaxed">
                Our voice-first approach means grandparents can share stories naturally, 
                just by talking. Large text, simple navigation, and a gentle AI companion 
                make preserving memories feel like a warm conversation.
              </p>
              <ul className="space-y-4">
                {[
                  "Voice recording — no typing required",
                  "AI asks about time, place, and people",
                  "Stories organized by life stage automatically",
                  "Private and secure family spaces"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-charcoal-light">
                    <div className="w-2 h-2 rounded-full bg-emerald" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Sage Section - Demo CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-ivory to-amber-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <SageAvatar size="xl" />
              </motion.div>
            </div>
            <h2 className="font-serif text-charcoal mb-4">Meet Sage, Your Memory Guide</h2>
            <p className="text-charcoal-light text-xl max-w-2xl mx-auto mb-8">
              Sage guides families through the journey of preserving memories. 
              See how it works with a real demo family — three generations of stories, 
              waiting to inspire your own.
            </p>
            <Button 
              className="btn-primary text-xl px-12 py-6"
              onClick={() => navigate('/demo')}
              data-testid="meet-sage-demo-btn"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Explore the Demo Experience
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-ivory-200/50">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-charcoal mb-6">
            Start Your Family&apos;s Story Today
          </h2>
          <p className="text-charcoal-light text-xl mb-10">
            Create a private vault where your family&apos;s memories will be 
            treasured for generations to come.
          </p>
          <Button 
            className="btn-primary text-xl px-12 py-6"
            onClick={() => navigate('/auth?mode=create')}
            data-testid="cta-create-vault-btn"
          >
            Create Your Heirloom
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-charcoal text-ivory/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <img src="/images/heirloom-logo.png" alt="Heirloom" className="h-8 w-auto" />
            <span className="font-serif text-lg text-ivory">Heirloom</span>
          </button>
          <p className="text-sm">
            Preserving family stories across generations
          </p>
        </div>
      </footer>

      {/* Sage Welcome Modal */}
      <SageWelcomeModal
        isOpen={showSageWelcome}
        onClose={handleCloseSageWelcome}
        onExploreDemo={handleExploreDemo}
      />

      {/* Floating Sage button after dismissing modal */}
      {hasSeenSage && !showSageWelcome && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-40"
          onClick={() => navigate('/demo')}
          data-testid="floating-sage-btn"
        >
          <div className="relative group">
            <SageAvatar size="lg" />
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Try Demo
            </div>
          </div>
        </motion.button>
      )}
    </div>
  );
};

export default LandingPage;
