import { generatePhase2Review } from "../js/phase2-review.js";

describe("Phase 2 Review Module", () => {
  test("should generate phase 2 review", async () => {
    const review = await generatePhase2Review(
      "Test Decision",
      "Test context",
      "Test decision"
    );

    expect(review).toContain("ADVERSARIAL CRITIQUE");
    expect(review).toContain("CRITICAL FEEDBACK");
    expect(review).toContain("KEY CONCERNS");
  });

  test("should include specific critique sections", async () => {
    const review = await generatePhase2Review(
      "Use microservices",
      "Current monolithic architecture",
      "Split into microservices"
    );

    expect(review).toContain("Risk assessment");
    expect(review).toContain("Alternative evaluation");
    expect(review).toContain("Success Criteria");
  });

  test("should handle different model types", async () => {
    const review1 = await generatePhase2Review(
      "Test",
      "Context",
      "Decision",
      "Claude"
    );
    const review2 = await generatePhase2Review(
      "Test",
      "Context",
      "Decision",
      "Gemini"
    );

    expect(review1).toBeTruthy();
    expect(review2).toBeTruthy();
  });
});
