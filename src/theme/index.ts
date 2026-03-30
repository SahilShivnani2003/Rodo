// theme.ts — Rodo Design System (Light Theme)

export const Colors = {
  // Core backgrounds
  bg: '#FFF8ED',
  bgCard: '#FFFFFF',
  bgElevated: '#FFECD2',
  bgInput: '#FFF2DE',

  // Brand
  brandRed: '#D61A1A',
  brandYellow: '#FFD300',
  amber: '#FFB300',
  amberLight: '#FFD140',
  amberGlow: 'rgba(255,195,0,0.18)',
  amberGlow2: 'rgba(255,195,0,0.1)',

  // Greens
  vegGreen: '#16A34A',
  successGreen: '#15803D',

  // Text
  textPrimary: '#261B0F',
  textSecondary: '#6A584A',
  textMuted: '#A98F7D',
  textOnAmber: '#2D1000',

  // Accents
  blue: '#2563EB',
  redPin: '#C62828',

  // Borders
  border: 'rgba(222,138,16,0.24)',
  borderActive: 'rgba(255,195,0,0.45)',

  // Status
  ahead: '#D61A1A',
  passed: '#F8E5C4',
  passedText: '#B88357',
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