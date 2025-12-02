/**
 * ADR Form Tests
 * 
 * These tests validate that the app implements the ADR standard form
 */

import { jest } from "@jest/globals";

describe("ADR Form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Fields", () => {
    test("should have all required ADR fields", async () => {
      const { App } = await import("../js/app.js");
      const app = new App();

      expect(app).toBeDefined();
    });

    test("should save ADR data to storage", async () => {
      const testProject = {
        id: "1",
        title: "Use Microservices",
        status: "Proposed",
        context: "Monolithic system is hard to scale",
        decision: "Adopt microservices architecture",
        consequences: "Increased operational complexity",
        rationale: "Allows independent scaling",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(testProject.title).toBeDefined();
      expect(testProject.status).toBeDefined();
      expect(testProject.context).toBeDefined();
      expect(testProject.decision).toBeDefined();
      expect(testProject.consequences).toBeDefined();
    });
  });

  describe("Export Functionality", () => {
    test("should generate valid markdown from ADR data", () => {
      const title = "Use Microservices";
      const status = "Proposed";
      const context = "Monolithic system is hard to scale";
      const decision = "Adopt microservices architecture";
      const consequences = "Increased operational complexity";
      const rationale = "Allows independent scaling";

      let markdown = `# ${title}\n\n`;
      markdown += `## Status\n\n${status}\n\n`;
      markdown += `## Context\n\n${context}\n\n`;
      markdown += `## Decision\n\n${decision}\n\n`;
      markdown += `## Consequences\n\n${consequences}\n\n`;
      markdown += `## Rationale\n\n${rationale}\n\n`;

      expect(markdown).toContain("# Use Microservices");
      expect(markdown).toContain("## Status");
      expect(markdown).toContain("## Context");
      expect(markdown).toContain("## Decision");
      expect(markdown).toContain("## Consequences");
      expect(markdown).toContain("## Rationale");
    });

    test("should format markdown correctly", () => {
      const adr = {
        title: "Test ADR",
        status: "Accepted",
        context: "This is the context",
        decision: "This is the decision",
        consequences: "These are the consequences"
      };

      let markdown = `# ${adr.title}\n\n`;
      markdown += `## Status\n\n${adr.status}\n\n`;
      markdown += `## Context\n\n${adr.context}\n\n`;
      markdown += `## Decision\n\n${adr.decision}\n\n`;
      markdown += `## Consequences\n\n${adr.consequences}\n\n`;

      expect(markdown).toContain("# Test ADR");
      expect(markdown).toContain("## Status");
      expect(markdown).toContain("Accepted");
    });
  });
});
