import { File } from 'expo-file-system';

// Menghapus file poster lokal; diamkan jika file sudah tidak ada.
export const deleteLocalFile = (uri) => {
  if (!uri || !String(uri).startsWith('file://')) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File bisa sudah dihapus user; tidak perlu mengganggu alur.
  }
};
