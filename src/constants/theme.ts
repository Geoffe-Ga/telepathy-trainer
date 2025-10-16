export const theme = {
  colors: {
    // Mystical, modern palette
    primary: '#6B4CE6', // Deep purple
    secondary: '#9D7CFF', // Light purple
    accent: '#FF6B9D', // Mystical pink
    background: '#0A0A0F', // Near black
    surface: '#1A1A2E', // Dark blue-gray
    surfaceLight: '#2A2A40',
    text: '#FFFFFF',
    textSecondary: '#A0A0B0',
    success: '#00D9A0', // Teal green
    warning: '#FFB74D', // Amber
    error: '#FF5252', // Red
    border: '#3A3A50',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '600' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 4,
    },
  },
};
