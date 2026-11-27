import {
  DEFAULT_THEME_PREFERENCE,
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '@/lib/settings';
import { darkColors, lightColors, type ThemeColors } from '@/lib/theme';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyColorScheme(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    getThemePreference()
      .then((savedPreference) => {
        if (!active) {
          return;
        }

        applyColorScheme(savedPreference);
        setPreferenceState(savedPreference);
        setLoaded(true);
      })
      .catch((error) => {
        console.error('[theme] failed to load preference', error);

        if (active) {
          applyColorScheme(DEFAULT_THEME_PREFERENCE);
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    applyColorScheme(nextPreference);

    try {
      await setThemePreference(nextPreference);
    } catch (error) {
      console.error('[theme] failed to save preference', error);
    }
  }, []);

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, isDark, preference, setPreference }),
    [colors, isDark, preference, setPreference]
  );

  if (!loaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return value;
}
