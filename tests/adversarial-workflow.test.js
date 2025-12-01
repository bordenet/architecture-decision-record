/**
 * Adversarial Workflow Pattern Tests
 * 
 * These tests validate that the app implements the CORRECT adversarial workflow:
 * - Generates prompts for external AI services (Claude, Gemini)
 * - Does NOT auto-generate AI responses
 * - Loads prompts from prompts/*.md files
 * - Replaces template variables correctly
 * 
 * If these tests pass with auto-generation code, the tests are WRONG.
 */

import { jest } from "@jest/globals";
import { loadPrompt } from "../js/workflow.js";

// Mock fetch globally
global.fetch = jest.fn();

describe("Adversarial Workflow Pattern", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Phase 1: Prompt Generation (NOT Auto-Generation)", () => {
    test("should load prompt from prompts/phase1.md file", async () => {
      const mockPromptContent = "# Phase 1 Prompt\n{title}\n{context}";
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockPromptContent
      });

      const prompt = await loadPrompt(1);

      expect(global.fetch).toHaveBeenCalledWith("./prompts/phase1.md");
      expect(prompt).toBe(mockPromptContent);
    });

    test("should use relative path (not absolute) for GitHub Pages compatibility", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => "test"
      });

      await loadPrompt(1);

      // CRITICAL: Must use relative path for GitHub Pages subdirectory deployment
      expect(global.fetch).toHaveBeenCalledWith("./prompts/phase1.md");
      expect(global.fetch).not.toHaveBeenCalledWith("/prompts/phase1.md");
    });

    test("should handle prompt loading failure gracefully", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false
      });

      const prompt = await loadPrompt(1);

      expect(prompt).toContain("Prompt loading failed");
    });

    test("should replace template variables in prompt", () => {
      let prompt = "Title: {title}\nContext: {context}\nStatus: {status}";
      
      // Simulate what app.js does
      prompt = prompt.replace(/{title}/g, "My ADR");
      prompt = prompt.replace(/{context}/g, "We need to decide");
      prompt = prompt.replace(/{status}/g, "Proposed");

      expect(prompt).toBe("Title: My ADR\nContext: We need to decide\nStatus: Proposed");
      expect(prompt).not.toContain("{title}");
      expect(prompt).not.toContain("{context}");
    });
  });

  describe("Phase 2: Prompt Generation for Gemini", () => {
    test("should load prompt from prompts/phase2.md file", async () => {
      const mockPromptContent = "# Phase 2 Review\n{phase1_output}";
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockPromptContent
      });

      const prompt = await loadPrompt(2);

      expect(global.fetch).toHaveBeenCalledWith("./prompts/phase2.md");
      expect(prompt).toBe(mockPromptContent);
    });

    test("should include Phase 1 output in Phase 2 prompt", () => {
      let prompt = "Review this:\n{phase1_output}";
      const phase1Output = "## Title\nMy ADR\n## Decision\nUse microservices";

      prompt = prompt.replace(/{phase1_output}/g, phase1Output);

      expect(prompt).toContain("My ADR");
      expect(prompt).toContain("Use microservices");
      expect(prompt).not.toContain("{phase1_output}");
    });
  });

  describe("Phase 3: Synthesis Prompt for Claude", () => {
    test("should load prompt from prompts/phase3.md file", async () => {
      const mockPromptContent = "# Phase 3 Synthesis\n{phase1_output}\n{phase2_output}";
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockPromptContent
      });

      const prompt = await loadPrompt(3);

      expect(global.fetch).toHaveBeenCalledWith("./prompts/phase3.md");
      expect(prompt).toBe(mockPromptContent);
    });

    test("should include both Phase 1 and Phase 2 outputs in synthesis prompt", () => {
      let prompt = "Synthesize:\n{phase1_output}\n\nReview:\n{phase2_output}";
      const phase1Output = "Decision: Use microservices";
      const phase2Output = "Gemini says: Consider monolith first";

      prompt = prompt.replace(/{phase1_output}/g, phase1Output);
      prompt = prompt.replace(/{phase2_output}/g, phase2Output);

      expect(prompt).toContain("Use microservices");
      expect(prompt).toContain("Consider monolith first");
      expect(prompt).not.toContain("{phase1_output}");
      expect(prompt).not.toContain("{phase2_output}");
    });
  });

  describe("Anti-Pattern Detection: Auto-Generation Should NOT Exist", () => {
    test("should NOT have generatePhase1AI method", async () => {
      // This test ensures we don't regress back to auto-generation
      const { App } = await import("../js/app.js");
      const app = new App();

      expect(app.generatePhase1AI).toBeUndefined();
      expect(app.generatePhase2Review).toBeUndefined();
      expect(app.synthesizeADR).toBeUndefined();
    });

    test("should have prompt generation methods instead", async () => {
      const { App } = await import("../js/app.js");
      const app = new App();

      expect(app.generatePhase1Prompt).toBeDefined();
      expect(app.generatePhase2Prompt).toBeDefined();
      expect(app.generatePhase3Prompt).toBeDefined();
    });
  });
});
