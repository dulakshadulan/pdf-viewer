import { UploadForm } from '@/features/upload/UploadForm';
import { useUploadBook } from '@/features/upload/useUploadBook';
import { useTheme } from '@/lib/ThemeProvider';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function UploadScreen() {
  const { state, pickFile, setTitle, setAuthor, save } = useUploadBook();
  const { colors } = useTheme();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmation) {
      return;
    }

    const timeout = setTimeout(() => {
      setConfirmation(null);
      router.navigate('/');
    }, 1200);

    return () => clearTimeout(timeout);
  }, [confirmation]);

  const handleSave = async () => {
    const book = await save();

    if (book) {
      setConfirmation(`"${book.title}" added to your library.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UploadForm
        status={state.status}
        pickedFileName={state.pickedFile?.name ?? null}
        title={state.title}
        author={state.author}
        error={state.error}
        confirmation={confirmation}
        onPickFile={pickFile}
        onTitleChange={setTitle}
        onAuthorChange={setAuthor}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
});
