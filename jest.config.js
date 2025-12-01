export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/**/ai-mock-ui.js",
    "!js/**/ui.js",
    "!js/**/app.js"
  ],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 45,
      lines: 45,
      statements: 45
    }
  },
  transform: {}
};
