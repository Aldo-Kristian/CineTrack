import { useContext } from 'react';

import { MediaContext } from '../context/MediaContext';

const useMedia = () => {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('useMedia must be used inside <MediaProvider>.');
  }

  return context;
};

export default useMedia;