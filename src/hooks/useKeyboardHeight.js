import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Tinggi keyboard saat ini. Android memakai event Did* karena edge-to-edge
// tidak lagi me-resize window; iOS memakai Will* agar padding tidak telat.
const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setHeight(event?.endCoordinates?.height ?? 0);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return height;
};

export default useKeyboardHeight;
