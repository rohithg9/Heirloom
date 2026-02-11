import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCreator from '../components/StoryCreator';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Heart } from 'lucide-react';

const TryStoryPage = () => {
  const navigate = useNavigate();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [savedStoryData, setSavedStoryData] = useState(null);

  // Called when user tries to save without being logged in
  const handleSaveRequest = (storyData) => {
    setSavedStoryData(storyData);
    setShowSignupPrompt(true);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      
      {/* Demo banner */}
      <div className="bg-amber-500 text-charcoal text-center py-2 px-4 text-sm font-medium">
        🎤 Demo Mode — Create a test story. Sign up to save your memories forever.
      </div>
      
      <StoryCreator isDemo={true} onSaveRequest={handleSaveRequest} />

      {/* Signup Prompt Modal */}
      <AnimatePresence>
        {showSignupPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSignupPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-ivory rounded-2xl max-w-md w-full p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="absolute top-4 right-4 p-2 hover:bg-charcoal/10 rounded-full"
              >
                <X className="w-5 h-5 text-charcoal/60" />
              </button>

              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>

              <h2 className="text-2xl font-serif text-charcoal mb-2">
                Beautiful Story!
              </h2>
              <p className="text-charcoal-muted mb-6">
                Create a free account to save this story and start preserving your family's precious memories.
              </p>

              {/* Story preview */}
              {savedStoryData && (
                <div className="bg-charcoal/5 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-charcoal/80 line-clamp-3">
                    "{savedStoryData.englishText || savedStoryData.originalText}"
                  </p>
                  {savedStoryData.photos?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {savedStoryData.photos.slice(0, 3).map((photo, i) => (
                        <img key={i} src={photo.url} alt="" className="w-12 h-12 rounded object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/auth?mode=create')}
                  className="w-full py-3 bg-sage text-white font-medium rounded-xl hover:bg-sage-dark transition-colors flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/auth?mode=login')}
                  className="w-full py-3 bg-charcoal/10 text-charcoal font-medium rounded-xl hover:bg-charcoal/20 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>

              <p className="text-xs text-charcoal/50 mt-4">
                Your story is saved locally and will be preserved when you sign up.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TryStoryPage;
