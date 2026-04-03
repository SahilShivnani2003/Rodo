module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@features': './src/features',
          '@assets': './src/assets',
          '@utils': './src/utils',
          '@services': './src/services',
          '@navigation': './src/navigation',
          '@context': './src/context',
          '@types': './src/types',
          '@store': './src/store',
          '@theme': './src/theme',
        }
      }
    ]
  ]
};
