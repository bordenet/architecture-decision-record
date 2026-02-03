import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  updatePhase,
  deleteProject,
  exportProject,
  exportAllProjects,
  importProjects
} from "../js/projects.js";

describe("Projects Module", () => {
  test("should export createProject function", () => {
    expect(createProject).toBeInstanceOf(Function);
  });

  test("should export getAllProjects function", () => {
    expect(getAllProjects).toBeInstanceOf(Function);
  });

  test("should export getProject function", () => {
    expect(getProject).toBeInstanceOf(Function);
  });

  test("should export updateProject function", () => {
    expect(updateProject).toBeInstanceOf(Function);
  });

  test("should export updatePhase function", () => {
    expect(updatePhase).toBeInstanceOf(Function);
  });

  test("should export deleteProject function", () => {
    expect(deleteProject).toBeInstanceOf(Function);
  });

  test("should export exportProject function", () => {
    expect(exportProject).toBeInstanceOf(Function);
  });

  test("should export exportAllProjects function", () => {
    expect(exportAllProjects).toBeInstanceOf(Function);
  });

  test("should export importProjects function", () => {
    expect(importProjects).toBeInstanceOf(Function);
  });

  describe("updatePhase", () => {
    test("should save response to both nested and flat formats", async () => {
      // Create a project
      const project = await createProject("Test ADR", "Test context");
      expect(project.id).toBeDefined();

      // Update phase 1 with a response (signature: projectId, phase, prompt, response, options)
      const response = "This is the phase 1 output content";
      const updated = await updatePhase(project.id, 1, "Test prompt", response, { skipAutoAdvance: true });

      // Verify nested format is set
      expect(updated.phases[1].response).toBe(response);
      expect(updated.phases[1].completed).toBe(true);

      // Verify flat format is also set (critical for workflow.js getPhaseOutput)
      expect(updated.phase1_output).toBe(response);

      // Clean up
      await deleteProject(project.id);
    });

    test("should handle all three phases with flat format", async () => {
      const project = await createProject("Multi-phase ADR", "Multi-phase context");

      // Update all three phases (signature: projectId, phase, prompt, response, options)
      await updatePhase(project.id, 1, "P1 prompt", "Phase 1 content", { skipAutoAdvance: true });
      await updatePhase(project.id, 2, "P2 prompt", "Phase 2 content", { skipAutoAdvance: true });
      const final = await updatePhase(project.id, 3, "P3 prompt", "Phase 3 content", { skipAutoAdvance: true });

      // Verify all flat formats are set
      expect(final.phase1_output).toBe("Phase 1 content");
      expect(final.phase2_output).toBe("Phase 2 content");
      expect(final.phase3_output).toBe("Phase 3 content");

      // Clean up
      await deleteProject(project.id);
    });
  });
});
