module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lambdas', '<rootDir>/lib'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'lambdas/**/*.ts',
    'lib/**/*.ts',
    '!lambdas/**/*.test.ts',
    '!lib/**/*.test.ts',
    '!lambdas/**/types.ts',
    '!lib/**/types.ts',
    '!lambdas/**/test-helpers.ts',
    '!lib/**/test-helpers.ts',
    '!lib/data/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
