module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    'TechElixirSolutionCenterWebPartStrings': '<rootDir>/src/webparts/techElixirSolutionCenter/loc/en-us.js',
    '\\.module\\.scss$': '<rootDir>/src/__mocks__/styleMock.js'
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx'
  ]
};
