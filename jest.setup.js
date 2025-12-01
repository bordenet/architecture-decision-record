import "fake-indexeddb/auto";
import { jest } from '@jest/globals';

// Polyfill structuredClone for fake-indexeddb
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock fetch for tests
global.fetch = jest.fn();

// Reset fetch mock before each test
beforeEach(() => {
  global.fetch.mockClear();
});

// Mock console methods to reduce test output noise
global.console.log = jest.fn();
global.console.debug = jest.fn();
