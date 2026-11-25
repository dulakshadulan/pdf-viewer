import { useOpenIncomingFile } from '@/features/open/useOpenIncomingFile';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OpenScreen() {
  const params = useLocalSearchParams<{ uri?: string | string[] }>();
  const uri = Array.isArray(params.uri) ? params.uri[0] : params.uri;
  const { status, error } = useOpenIncomingFile(uri);

  return (
    <>
      <Stack.Screen options={{ title: 'Open PDF' }} />
      <View style={styles.container}>
        {status === 'error' ? (
          <>
            <Text style={styles.title}>Could not open this file</Text>
            <Text style={styles.message}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/')}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Back to library</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color="#355070" size="large" />
            <Text style={styles.message}>Opening PDF...</Text>
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
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#355070',
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
