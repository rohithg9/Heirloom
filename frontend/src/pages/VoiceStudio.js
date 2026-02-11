import React from 'react';
import StoryCreator from '../components/StoryCreator';
import { Toaster } from 'sonner';

const VoiceStudio = () => {
  return (
    <>
      <Toaster position="top-center" richColors />
      <StoryCreator isDemo={false} />
    </>
  );
};

export default VoiceStudio;
