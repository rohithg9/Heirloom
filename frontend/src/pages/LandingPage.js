import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Home, ArrowRight, Heart, Mic, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="min-h-screen bg-ivory relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1726731819337-d337f181bd85?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Family gathering"
            className="w-full h-full object-cover img-heirloom opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory/80 via-ivory/60 to-ivory" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center">
              <Heart className="w-6 h-6 text-ivory" />
            </div>
            <span className="font-serif text-2xl text-charcoal">Heirloom</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
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
              Preserve Your Family's
              <span className="block text-emerald">Living Legacy</span>
            </h1>
            <p className="text-xl md:text-2xl text-charcoal-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Every family has stories worth preserving. Create a private sanctuary where 
              memories live on through voice, photos, and the connections that bind us.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                className="btn-primary text-xl px-10 py-5 group"
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
              <Button 
                variant="outline"
                className="btn-secondary text-xl"
                onClick={() => navigate('/auth?mode=join')}
                data-testid="join-vault-btn"
              >
                <Home className="w-5 h-5 mr-2" />
                Join Existing Vault
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
              More than an app — a sanctuary for your family's most precious memories
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
            "Every ordinary life deserves to be preserved with the dignity, 
            voice, and beauty usually reserved for kings and queens."
          </blockquote>
          <div className="w-16 h-0.5 bg-ivory/30 mx-auto" />
        </motion.div>
      </section>

      {/* Elder-Friendly Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1662971640032-ed60396966a0?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Elder storytelling"
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
                <span className="text-emerald">Every Generation</span>
              </h2>
              <p className="text-charcoal-light text-xl leading-relaxed">
                Our voice-first approach means grandparents can share stories naturally, 
                just by talking. Large text, simple navigation, and a gentle AI companion 
                make preserving memories feel like a warm conversation.
              </p>
              <ul className="space-y-4">
                {[
                  "Voice recording — no typing required",
                  "Large, readable text for comfortable viewing",
                  "Gentle AI that listens and guides",
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

      {/* CTA Section */}
      <section className="py-24 px-6 bg-ivory-200/50">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-charcoal mb-6">
            Start Your Family's Story Today
          </h2>
          <p className="text-charcoal-light text-xl mb-10">
            Create a private vault where your family's memories will be 
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
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald" />
            <span className="font-serif text-lg text-ivory">Heirloom</span>
          </div>
          <p className="text-sm">
            Preserving family stories across generations
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
