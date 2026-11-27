export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  danger: string;
  tabBar: string;
  tabIconActive: string;
  tabIconInactive: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#EEF2F6',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#355070',
  danger: '#B91C1C',
  tabBar: '#FFFFFF',
  tabIconActive: '#355070',
  tabIconInactive: '#6B7280',
  overlay: 'rgba(17, 24, 39, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#15181E',
  surface: '#1E232B',
  card: '#252B34',
  text: '#F3F4F6',
  textSecondary: '#A7B0BD',
  border: '#343B46',
  primary: '#9CC2E8',
  danger: '#F87171',
  tabBar: '#1A1E25',
  tabIconActive: '#9CC2E8',
  tabIconInactive: '#8B95A5',
  overlay: 'rgba(0, 0, 0, 0.65)',
};
