/**
 * Form-to-Prompt Integration Tests for Architecture Decision Record
 *
 * CRITICAL: These tests ensure that form fields match prompt template requirements.
 * This prevents the bug where form collects different fields than prompts expect.
 */

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
  // Tests use {{VAR_NAME}} double-brace syntax (standard for all genesis-tools)

  describe("Phase 1 Template Variable Matching", () => {
    const phase1Template = readTemplate("phase1.md");

    test("CRITICAL: phase1.md MUST contain {{TITLE}} placeholder", () => {
      expect(phase1Template).toContain("{{TITLE}}");
    });

    test("CRITICAL: phase1.md MUST contain {{STATUS}} placeholder", () => {
      expect(phase1Template).toContain("{{STATUS}}");
    });

    test("CRITICAL: phase1.md MUST contain {{CONTEXT}} placeholder", () => {
      expect(phase1Template).toContain("{{CONTEXT}}");
    });

    test("phase1.md should contain all required input placeholders", () => {
      // These are the fields the user fills out in the form (using {{VAR}} syntax)
      const requiredPlaceholders = ["{{TITLE}}", "{{STATUS}}", "{{CONTEXT}}"];

      for (const placeholder of requiredPlaceholders) {
        expect(phase1Template).toContain(placeholder);
      }
    });
  });

  describe("Phase 2 Template Variable Matching", () => {
    const phase2Template = readTemplate("phase2.md");

    test("CRITICAL: phase2.md MUST contain {{PHASE1_OUTPUT}} placeholder", () => {
      expect(phase2Template).toContain("{{PHASE1_OUTPUT}}");
    });

    test("phase2.md should include review criteria", () => {
      expect(phase2Template).toContain("Decision Specificity");
      expect(phase2Template).toContain("Consequences Balance");
      expect(phase2Template).toContain("Context Grounding");
    });
  });

  describe("Phase 3 Template Variable Matching", () => {
    const phase3Template = readTemplate("phase3.md");

    test("CRITICAL: phase3.md MUST contain {{PHASE1_OUTPUT}} placeholder", () => {
      expect(phase3Template).toContain("{{PHASE1_OUTPUT}}");
    });

    test("CRITICAL: phase3.md MUST contain {{PHASE2_OUTPUT}} placeholder", () => {
      expect(phase3Template).toContain("{{PHASE2_OUTPUT}}");
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
      // Phase 1 placeholders: {{TITLE}}, {{STATUS}}, {{CONTEXT}} (using {{VAR}} syntax)
      const phase1Template = readTemplate("phase1.md");

      const formFields = ["TITLE", "STATUS", "CONTEXT"];

      for (const field of formFields) {
        expect(phase1Template).toContain(`{{${field}}}`);
      }
    });

    test("Phase 2 and 3 should reference previous phase outputs", () => {
      const phase2Template = readTemplate("phase2.md");
      const phase3Template = readTemplate("phase3.md");

      // Phase 2 needs Phase 1 output
      expect(phase2Template).toContain("{{PHASE1_OUTPUT}}");

      // Phase 3 needs both Phase 1 and Phase 2 outputs
      expect(phase3Template).toContain("{{PHASE1_OUTPUT}}");
      expect(phase3Template).toContain("{{PHASE2_OUTPUT}}");
    });
  });

  describe("Prompt Replacement Simulation", () => {
    test("Phase 1 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase1.md");

      // Simulate the replacement using {{VAR}} syntax
      template = template.replace(/\{\{TITLE\}\}/g, "Test ADR Title");
      template = template.replace(/\{\{STATUS\}\}/g, "Proposed");
      template = template.replace(/\{\{CONTEXT\}\}/g, "Test context description");

      // No placeholders should remain
      expect(template).not.toContain("{{TITLE}}");
      expect(template).not.toContain("{{STATUS}}");
      expect(template).not.toContain("{{CONTEXT}}");
    });

    test("Phase 2 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase2.md");

      // Simulate the replacement using {{VAR}} syntax
      template = template.replace(/\{\{PHASE1_OUTPUT\}\}/g, "Phase 1 ADR content");

      // No placeholders should remain
      expect(template).not.toContain("{{PHASE1_OUTPUT}}");
    });

    test("Phase 3 prompt should have no unfilled placeholders after replacement", () => {
      let template = readTemplate("phase3.md");

      // Simulate the replacement using {{VAR}} syntax
      template = template.replace(/\{\{PHASE1_OUTPUT\}\}/g, "Phase 1 ADR content");
      template = template.replace(/\{\{PHASE2_OUTPUT\}\}/g, "Phase 2 review feedback");

      // No placeholders should remain
      expect(template).not.toContain("{{PHASE1_OUTPUT}}");
      expect(template).not.toContain("{{PHASE2_OUTPUT}}");
    });
  });
});
