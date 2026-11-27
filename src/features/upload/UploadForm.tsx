import { useTheme } from '@/lib/ThemeProvider';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { UploadStatus } from './useUploadBook';

interface UploadFormProps {
  status: UploadStatus;
  pickedFileName: string | null;
  title: string;
  author: string;
  error: string | null;
  confirmation: string | null;
  onPickFile: () => void;
  onTitleChange: (title: string) => void;
  onAuthorChange: (author: string) => void;
  onSave: () => void;
}

export function UploadForm({
  status,
  pickedFileName,
  title,
  author,
  error,
  confirmation,
  onPickFile,
  onTitleChange,
  onAuthorChange,
  onSave,
}: UploadFormProps) {
  const { colors } = useTheme();
  const isPicking = status === 'picking';
  const isSaving = status === 'saving';
  const canSave = Boolean(pickedFileName && title.trim()) && !isPicking && !isSaving;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Upload a PDF</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Choose a PDF from your device to add it to your library.
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={isPicking || isSaving}
        onPress={onPickFile}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          (isPicking || isSaving) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {isPicking ? 'Choosing...' : pickedFileName ? 'Choose Another PDF' : 'Choose PDF'}
        </Text>
      </Pressable>

      {pickedFileName ? (
        <Text style={[styles.filename, { color: colors.textSecondary }]}>{pickedFileName}</Text>
      ) : null}

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={title}
          onChangeText={onTitleChange}
          placeholder="Book title"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          editable={!isSaving}
          autoCapitalize="sentences"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Author</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={author}
          onChangeText={onAuthorChange}
          placeholder="Optional"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          editable={!isSaving}
          autoCapitalize="words"
        />
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      {confirmation ? (
        <Text style={[styles.confirmation, { color: colors.primary }]}>{confirmation}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!canSave}
        onPress={onSave}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          !canSave && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {isSaving ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filename: {
    fontSize: 14,
    textAlign: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  confirmation: {
    fontSize: 14,
    textAlign: 'center',
  },
});
