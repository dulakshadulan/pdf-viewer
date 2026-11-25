import { listBooks } from '@/db';
import { runDatabaseSmokeTest } from '@/db/devCheck';
import { errorMessage } from '@/lib/errors';
import { runFileSystemSmokeTest } from '@/lib/devCheck';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const db = useSQLiteContext();
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
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Account and sync settings will live here.</Text>
      {__DEV__ ? (
        <>
          <Text style={styles.debug}>Books in DB: {bookCount ?? '—'}</Text>
          <Button title="Log book count" onPress={handleLogBookCount} />
          <Button title="Run DB smoke test" onPress={handleDatabaseSmokeTest} />
          <Button title="Test file copy" onPress={handleFileSystemSmokeTest} />
          {fileTestResult ? <Text style={styles.debug}>{fileTestResult}</Text> : null}
        </>
      ) : (
        <Text style={styles.subtitle}>Your PDFs are stored on this device only.</Text>
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
    color: '#6b7280',
    fontSize: 16,
  },
  debug: {
    color: '#6b7280',
    fontSize: 14,
  },
});
