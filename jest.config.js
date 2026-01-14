export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/docs/'],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/app.js',
    '!js/router.js',
    '!js/views.js',
    '!js/project-view.js',
    '!js/types.js',
    '!js/projects.js',
    '!js/ai-mock-ui.js',
    '!js/lib/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 35,
      functions: 40,
      lines: 40
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
