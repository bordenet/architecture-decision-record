/**
 * Tests for ai-mock-ui.js module
 *
 * Tests the AI mock UI rendering functions.
 */

import { showMockAIResponse, renderAIPanel } from '../js/ai-mock-ui.js';

describe('AI Mock UI Module', () => {
  describe('showMockAIResponse', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log response to console', () => {
      showMockAIResponse('Test response');
      expect(consoleSpy).toHaveBeenCalledWith('Mock AI Response:', 'Test response');
    });

    test('should handle empty response', () => {
      showMockAIResponse('');
      expect(consoleSpy).toHaveBeenCalledWith('Mock AI Response:', '');
    });

    test('should handle long response', () => {
      const longResponse = 'a'.repeat(1000);
      showMockAIResponse(longResponse);
      expect(consoleSpy).toHaveBeenCalledWith('Mock AI Response:', longResponse);
    });
  });

  describe('renderAIPanel', () => {
    test('should return HTML string', () => {
      const html = renderAIPanel();
      expect(typeof html).toBe('string');
    });

    test('should contain ai-panel class', () => {
      const html = renderAIPanel();
      expect(html).toContain('ai-panel');
    });

    test('should contain AI Assistant heading', () => {
      const html = renderAIPanel();
      expect(html).toContain('AI Assistant');
    });

    test('should contain mock mode text', () => {
      const html = renderAIPanel();
      expect(html).toContain('Mock mode enabled');
    });

    test('should have proper HTML structure', () => {
      const html = renderAIPanel();
      expect(html).toContain('<div');
      expect(html).toContain('<h3>');
      expect(html).toContain('<p>');
      expect(html).toContain('</div>');
    });
  });
});
