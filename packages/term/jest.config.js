export default {
  preset: 'ts-jest',
  extensionsToTreat: ['.ts'],
  moduleNameMapper: {
    '^(\\.)(.*)\\.js$': '$1$2',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.ts'],
};