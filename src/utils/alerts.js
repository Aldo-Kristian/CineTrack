import { Alert } from 'react-native';

export const confirmDeleteMedia = (media, onConfirm) => {
  Alert.alert(
    'Delete this title?',
    `"${media.title}" will be permanently removed.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onConfirm(media.id),
      },
    ]
  );
};