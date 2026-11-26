import Storage from 'expo-sqlite/kv-store';

export type ReadingMode = 'scroll' | 'paged';

export const DEFAULT_READING_MODE: ReadingMode = 'scroll';

const READING_MODE_KEY = 'readingMode';

export async function getReadingMode(): Promise<ReadingMode> {
  const value = await Storage.getItem(READING_MODE_KEY);
  return value === 'paged' ? 'paged' : DEFAULT_READING_MODE;
}

export async function setReadingMode(mode: ReadingMode): Promise<void> {
  await Storage.setItem(READING_MODE_KEY, mode);
}
