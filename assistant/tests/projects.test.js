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

    test("should auto-advance to next phase when response is provided", async () => {
      const project = await createProject("Auto-advance ADR", "Context");
      expect(project.phase).toBe(1);

      // Update phase 1 without skipAutoAdvance
      const updated = await updatePhase(project.id, 1, "Prompt", "Response");
      expect(updated.phase).toBe(2);

      await deleteProject(project.id);
    });

    test("should extract title from H1 in phase 3 response", async () => {
      const project = await createProject("Original Title", "Context");

      // Update phase 3 with markdown containing an H1
      const markdown = "# New Extracted Title\n\nThis is the ADR content.";
      const updated = await updatePhase(project.id, 3, "P3 prompt", markdown);

      expect(updated.title).toBe("New Extracted Title");
      await deleteProject(project.id);
    });

    test("should handle PRESS RELEASE style headers", async () => {
      const project = await createProject("Original", "Context");

      const markdown = "# PRESS RELEASE\n**Actual Headline Title**\n\nContent here.";
      const updated = await updatePhase(project.id, 3, "Prompt", markdown);

      expect(updated.title).toBe("Actual Headline Title");
      await deleteProject(project.id);
    });

    test("should initialize phases object if missing", async () => {
      const project = await createProject("Test", "Context");

      // The phases object should exist after creation
      expect(project.phases).toBeDefined();
      expect(project.phases[1]).toBeDefined();
      expect(project.phases[2]).toBeDefined();
      expect(project.phases[3]).toBeDefined();

      await deleteProject(project.id);
    });
  });

  describe("updateProject", () => {
    test("should update project metadata", async () => {
      const project = await createProject("Original", "Context");

      const updated = await updateProject(project.id, { title: "Updated Title" });
      expect(updated.title).toBe("Updated Title");

      await deleteProject(project.id);
    });

    test("should throw error for non-existent project", async () => {
      await expect(updateProject("non-existent-id", { title: "Test" }))
        .rejects.toThrow("Project not found");
    });
  });

  describe("createProject", () => {
    test("should create project with default status", async () => {
      const project = await createProject("Test", "Context");
      expect(project.status).toBe("Proposed");
      await deleteProject(project.id);
    });

    test("should create project with custom status", async () => {
      const project = await createProject("Test", "Context", "Accepted");
      expect(project.status).toBe("Accepted");
      await deleteProject(project.id);
    });

    test("should trim title and context", async () => {
      const project = await createProject("  Title  ", "  Context  ");
      expect(project.title).toBe("Title");
      expect(project.context).toBe("Context");
      await deleteProject(project.id);
    });
  });

  describe("getAllProjects", () => {
    test("should return array of projects", async () => {
      const projects = await getAllProjects();
      expect(Array.isArray(projects)).toBe(true);
    });
  });

  describe("getProject", () => {
    test("should return project by id", async () => {
      const created = await createProject("Find Me", "Context");
      const found = await getProject(created.id);
      expect(found.title).toBe("Find Me");
      await deleteProject(created.id);
    });

    test("should return undefined for non-existent project", async () => {
      const found = await getProject("non-existent-id");
      expect(found).toBeUndefined();
    });
  });

  describe("exportProject", () => {
    test("should throw error for non-existent project", async () => {
      await expect(exportProject("non-existent-id"))
        .rejects.toThrow("Project not found");
    });
  });
});
