module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js",
  ],
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  verbose: true,
  // Suppress console warnings during tests
  silent: false,
  // Global setup to suppress specific MongoDB warnings
  globalSetup: undefined,
  globalTeardown: undefined,
};
