import { useTheme } from '@/lib/ThemeProvider';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface EmptyLibraryProps {
  onUpload: () => void;
}

export function EmptyLibrary({ onUpload }: EmptyLibraryProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.mark, { backgroundColor: colors.surface }]}>
        <Text style={[styles.markText, { color: colors.primary }]}>+</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Your library is empty</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Upload a PDF to start building your personal collection.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onUpload}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>Upload a PDF</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  mark: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  markText: {
    fontSize: 32,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 280,
    textAlign: 'center',
  },
  button: {
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
