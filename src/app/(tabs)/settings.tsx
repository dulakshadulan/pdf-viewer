import { listBooks } from '@/db';
import { runDatabaseSmokeTest } from '@/db/devCheck';
import { errorMessage } from '@/lib/errors';
import { runFileSystemSmokeTest } from '@/lib/devCheck';
import { useTheme } from '@/lib/ThemeProvider';
import type { ThemePreference } from '@/lib/settings';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { colors, preference, setPreference } = useTheme();
  const [bookCount, setBookCount] = useState<number | null>(null);
  const [fileTestResult, setFileTestResult] = useState<string | null>(null);

  const handleDatabaseSmokeTest = async () => {
    try {
      await runDatabaseSmokeTest(db);
    } catch (error) {
      console.error('[db smoke] failed', error);
    }
  };

  const handleLogBookCount = async () => {
    try {
      const books = await listBooks(db);
      setBookCount(books.length);
      console.log('[db] book count', books.length, books);
    } catch (error) {
      console.error('[db] book count failed', error);
    }
  };

  const handleFileSystemSmokeTest = async () => {
    try {
      const copiedUri = await runFileSystemSmokeTest();
      setFileTestResult(`File copy OK: ${copiedUri}`);
      console.log('[file smoke] ok', copiedUri);
    } catch (error) {
      setFileTestResult(`File copy failed: ${errorMessage(error)}`);
      console.error('[file smoke] failed', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        A simple, free, offline PDF reader. Your PDFs stay on this device.
      </Text>

      <View
        style={[
          styles.appearanceCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Choose how the app looks.
        </Text>
        <View
          style={[
            styles.appearanceOptions,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {THEME_OPTIONS.map((option) => {
            const selected = preference === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityLabel={`${option.label} appearance`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  void setPreference(option.value);
                }}
                style={({ pressed }) => [
                  styles.appearanceOption,
                  selected && { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.appearanceOptionText,
                    { color: selected ? colors.background : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {__DEV__ ? (
        <>
          <Text style={[styles.debug, { color: colors.textSecondary }]}>
            Books in DB: {bookCount ?? '—'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleLogBookCount}
            style={({ pressed }) => [
              styles.debugButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.debugButtonText, { color: colors.background }]}>
              Log book count
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleDatabaseSmokeTest}
            style={({ pressed }) => [
              styles.debugButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.debugButtonText, { color: colors.background }]}>
              Run DB smoke test
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleFileSystemSmokeTest}
            style={({ pressed }) => [
              styles.debugButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.debugButtonText, { color: colors.background }]}>
              Test file copy
            </Text>
          </Pressable>
          {fileTestResult ? (
            <Text style={[styles.debug, { color: colors.textSecondary }]}>{fileTestResult}</Text>
          ) : null}
        </>
      ) : (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your PDFs are stored on this device only.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  appearanceCard: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 8,
    maxWidth: 420,
    padding: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  appearanceOptions: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  appearanceOption: {
    alignItems: 'center',
    borderRadius: 9,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  appearanceOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debug: {
    fontSize: 14,
    textAlign: 'center',
  },
  debugButton: {
    alignItems: 'center',
    borderRadius: 10,
    maxWidth: 320,
    paddingHorizontal: 18,
    paddingVertical: 11,
    width: '100%',
  },
  debugButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
