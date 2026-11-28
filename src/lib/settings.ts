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

export type ThemePreference = 'system' | 'light' | 'dark';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

const THEME_PREFERENCE_KEY = 'themePreference';

export async function getThemePreference(): Promise<ThemePreference> {
  const value = await Storage.getItem(THEME_PREFERENCE_KEY);
  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME_PREFERENCE;
}

export async function setThemePreference(preference: ThemePreference): Promise<void> {
  await Storage.setItem(THEME_PREFERENCE_KEY, preference);
}

export type PageTheme = 'auto' | 'white' | 'sepia' | 'night';

export const DEFAULT_PAGE_THEME: PageTheme = 'auto';

const PAGE_THEME_KEY = 'pageTheme';

export async function getPageTheme(): Promise<PageTheme> {
  const value = await Storage.getItem(PAGE_THEME_KEY);
  return value === 'white' || value === 'sepia' || value === 'night'
    ? value
    : DEFAULT_PAGE_THEME;
}

export async function setPageTheme(theme: PageTheme): Promise<void> {
  await Storage.setItem(PAGE_THEME_KEY, theme);
}
