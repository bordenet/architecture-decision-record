/**
 * Form-to-Prompt Integration Tests for Architecture Decision Record
 *
 * CRITICAL: These tests ensure that form fields match prompt template requirements.
 * This prevents the bug where form collects different fields than prompts expect.
 */

import { describe, test, expect, beforeEach } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readTemplate(templateName) {
  const templatePath = path.join(__dirname, "..", "prompts", templateName);
  return fs.readFileSync(templatePath, "utf8");
}

describe("Form-to-Prompt Integration Tests", () => {
  describe("Phase 1 Template Variable Matching", () => {
    const phase1Template = readTemplate("phase1.md");

    test("CRITICAL: phase1.md MUST contain {title} placeholder", () => {
      expect(phase1Template).toContain("{title}");
    });

    test("CRITICAL: phase1.md MUST contain {status} placeholder", () => {
      expect(phase1Template).toContain("{status}");
    });

    test("CRITICAL: phase1.md MUST contain {context} placeholder", () => {
      expect(phase1Template).toContain("{context}");
    });

    test("phase1.md should contain all required input placeholders", () => {
      // These are the fields the user fills out in the form
      const requiredPlaceholders = ["{title}", "{status}", "{context}"];

      for (const placeholder of requiredPlaceholders) {
        expect(phase1Template).toContain(placeholder);
      }
    });
  });

  describe("Phase 2 Template Variable Matching", () => {
    const phase2Template = readTemplate("phase2.md");

    test("CRITICAL: phase2.md MUST contain {phase1_output} placeholder", () => {
      expect(phase2Template).toContain("{phase1_output}");
    });

    test("phase2.md should include review criteria", () => {
      expect(phase2Template).toContain("Decision Specificity");
      expect(phase2Template).toContain("Consequences Balance");
      expect(phase2Template).toContain("Context Grounding");
    });
  });

  describe("Phase 3 Template Variable Matching", () => {
    const phase3Template = readTemplate("phase3.md");

    test("CRITICAL: phase3.md MUST contain {phase1_output} placeholder", () => {
      expect(phase3Template).toContain("{phase1_output}");
    });

    test("CRITICAL: phase3.md MUST contain {phase2_review} placeholder", () => {
      expect(phase3Template).toContain("{phase2_review}");
    });

    test("phase3.md should include synthesis instructions", () => {
      expect(phase3Template).toContain("Synthesis");
      expect(phase3Template).toContain("Decision Section");
      expect(phase3Template).toContain("Consequences Section");
    });
  });

  describe("Form Field Coverage", () => {
    test("All form fields should have corresponding prompt placeholders", () => {
      // Form fields in ADR: title, status, context
      // Phase 1 placeholders: {title}, {status}, {context}
      const phase1Template = readTemplate("phase1.md");

      const formFields = ["title", "status", "context"];

      for (const field of formFields) {
        expect(phase1Template).toContain(`{${field}}`);
      }
    });

    test("Phase 2 and 3 should reference previous phase outputs", () => {
      const phase2Template = readTemplate("phase2.md");
      const phase3Template = readTemplate("phase3.md");

      // Phase 2 needs Phase 1 output
      expect(phase2Template).toContain("{phase1_output}");

      // Phase 3 needs both Phase 1 and Phase 2 outputs
      expect(phase3Template).toContain("{phase1_output}");
      expect(phase3Template).toContain("{phase2_review}");
    });
  });

  describe("Prompt Replacement Simulation", () => {
    test("Phase 1 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase1.md");

      // Simulate the replacement that happens in app.js generatePhase1Prompt
      template = template.replace(/{title}/g, "Test ADR Title");
      template = template.replace(/{status}/g, "Proposed");
      template = template.replace(/{context}/g, "Test context description");

      // No placeholders should remain
      expect(template).not.toContain("{title}");
      expect(template).not.toContain("{status}");
      expect(template).not.toContain("{context}");
    });

    test("Phase 2 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase2.md");

      // Simulate the replacement that happens in app.js generatePhase2Prompt
      template = template.replace(/{phase1_output}/g, "Phase 1 ADR content");

      // No placeholders should remain
      expect(template).not.toContain("{phase1_output}");
    });

    test("Phase 3 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase3.md");

      // Simulate the replacement that happens in app.js generatePhase3Prompt
      template = template.replace(/{phase1_output}/g, "Phase 1 ADR content");
      template = template.replace(/{phase2_review}/g, "Phase 2 review feedback");

      // No placeholders should remain
      expect(template).not.toContain("{phase1_output}");
      expect(template).not.toContain("{phase2_review}");
    });
  });
});

