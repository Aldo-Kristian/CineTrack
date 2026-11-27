module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/constants/genres.js',
    'src/services/tmdbMapper.js',
    'src/services/providerService.js',
    'src/services/validationService.js',
  ],
};
