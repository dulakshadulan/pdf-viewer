import type { PageTheme } from '@/lib/settings';
import { StyleSheet, View } from 'react-native';

export type ResolvedPageTheme = Exclude<PageTheme, 'auto'>;

export const PAGE_THEME_BACKGROUNDS: Record<ResolvedPageTheme, string> = {
  white: '#FFFFFF',
  sepia: '#EFE3CA',
  night: '#0E0E10',
};

export function resolvePageTheme(pageTheme: PageTheme, isDark: boolean): ResolvedPageTheme {
  if (pageTheme === 'auto') {
    return isDark ? 'night' : 'white';
  }

  return pageTheme;
}

export function PageColorOverlay({ mode }: { mode: ResolvedPageTheme }) {
  if (mode === 'white') {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, mode === 'sepia' ? styles.sepia : styles.night]}
    />
  );
}

const styles = StyleSheet.create({
  sepia: {
    backgroundColor: '#D8B97A',
    mixBlendMode: 'multiply',
    opacity: 0.4,
  },
  night: {
    backgroundColor: '#FFFFFF',
    mixBlendMode: 'difference',
    opacity: 0.95,
  },
});
