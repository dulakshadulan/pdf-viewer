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
  background: '#0E0E10',
  surface: '#17171A',
  card: '#1C1C20',
  text: '#EDEDEE',
  textSecondary: '#A1A1A8',
  border: '#2C2C31',
  primary: '#9DB8D6',
  danger: '#F87171',
  tabBar: '#121214',
  tabIconActive: '#9DB8D6',
  tabIconInactive: '#8A8A92',
  overlay: 'rgba(0, 0, 0, 0.7)',
};
