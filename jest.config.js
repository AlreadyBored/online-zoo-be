module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lambdas'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'lambdas/**/*.ts',
    '!lambdas/**/*.test.ts',
    '!lambdas/**/types.ts',
    '!lambdas/**/test-helpers.ts',
    '!lambdas/common/data/**'
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
};
