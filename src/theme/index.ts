// theme.ts — Rodo Design System (Light Theme)

export const Colors = {
  // Core backgrounds
  bg: '#F5F2ED',
  bgCard: '#FFFFFF',
  bgElevated: '#EEE9E2',
  bgInput: '#F0EDE8',

  // Brand
  amber: '#E86A1A',
  amberLight: '#F08040',
  amberGlow: 'rgba(232,106,26,0.12)',
  amberGlow2: 'rgba(232,106,26,0.08)',

  // Greens
  vegGreen: '#16A34A',
  successGreen: '#15803D',

  // Text
  textPrimary: '#1A1610',
  textSecondary: '#6B6560',
  textMuted: '#B0A89E',
  textOnAmber: '#FFFFFF',

  // Accents
  blue: '#2563EB',
  redPin: '#DC2626',

  // Borders
  border: 'rgba(0,0,0,0.08)',
  borderActive: 'rgba(232,106,26,0.35)',

  // Status
  ahead: '#E86A1A',
  passed: '#D4CFC8',
  passedText: '#A09890',
};

export const Fonts = {
  display: 'SpaceGrotesk-Bold',
  displayMedium: 'SpaceGrotesk-Medium',
  body: 'DM Sans',
  bodyMedium: 'DM Sans Medium',
  mono: 'JetBrains Mono',
};

export const Radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 999,
};

export const Shadow = {
  amber: {
    shadowColor: '#E86A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#8A7060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};