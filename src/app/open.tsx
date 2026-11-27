import { useOpenIncomingFile } from '@/features/open/useOpenIncomingFile';
import { useTheme } from '@/lib/ThemeProvider';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OpenScreen() {
  const params = useLocalSearchParams<{ uri?: string | string[] }>();
  const uri = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const { status, error } = useOpenIncomingFile(uri);
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Open PDF' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {status === 'error' ? (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Could not open this file</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/')}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Back to library
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.message, { color: colors.textSecondary }]}>Opening PDF...</Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
