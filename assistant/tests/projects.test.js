import { jest } from "@jest/globals";
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
import { storage } from "../js/storage.js";

describe("Projects Module", () => {
  beforeEach(async () => {
    // Initialize storage
    await storage.init();
    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }
  });

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

  describe("importProjects", () => {
    test("should import a single project from JSON file", async () => {
      // Create a project to export
      const original = await createProject("Test ADR", "Test context for ADR");

      // Create a mock File object with the project JSON
      const jsonContent = JSON.stringify(original);
      const file = new File([jsonContent], "project.json", { type: "application/json" });

      // Delete the original
      await deleteProject(original.id);

      // Import from file
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(1);

      // Verify it was imported
      const retrieved = await getProject(original.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved.title).toBe("Test ADR");
      expect(retrieved.context).toBe("Test context for ADR");
    });

    test("should import multiple projects from backup file", async () => {
      // Create multiple projects
      const project1 = await createProject("ADR 1", "Context 1");
      const project2 = await createProject("ADR 2", "Context 2");
      const project3 = await createProject("ADR 3", "Context 3");

      // Create backup format
      const backup = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        projectCount: 3,
        projects: [project1, project2, project3]
      };

      const file = new File([JSON.stringify(backup)], "backup.json", { type: "application/json" });

      // Delete all projects
      await deleteProject(project1.id);
      await deleteProject(project2.id);
      await deleteProject(project3.id);

      // Import from backup
      const importedCount = await importProjects(file);

      expect(importedCount).toBe(3);

      // Verify all were imported
      const allProjects = await getAllProjects();
      expect(allProjects.length).toBe(3);
    });

    test("should reject invalid file format", async () => {
      const invalidContent = JSON.stringify({ foo: "bar" });
      const file = new File([invalidContent], "invalid.json", { type: "application/json" });

      await expect(importProjects(file)).rejects.toThrow("Invalid file format");
    });

    test("should reject non-JSON content", async () => {
      const file = new File(["not valid json"], "bad.json", { type: "application/json" });

      await expect(importProjects(file)).rejects.toThrow();
    });

    test("should handle empty backup file", async () => {
      const backup = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: []
      };

      const file = new File([JSON.stringify(backup)], "empty-backup.json", { type: "application/json" });

      const importedCount = await importProjects(file);
      expect(importedCount).toBe(0);
    });
  });

  describe("exportProject", () => {
    // Mock DOM APIs for export tests
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return "blob:mock-url";
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement to capture download filename
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, "createElement").mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === "a") {
          Object.defineProperty(element, "click", { value: mockClick });
          Object.defineProperty(element, "download", {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should export a single project as JSON", async () => {
      const project = await createProject("Export Test ADR", "Export context");

      await exportProject(project.id);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe("application/json");
    });

    test("should throw error for non-existent project", async () => {
      await expect(exportProject("non-existent-id")).rejects.toThrow("Project not found");
    });
  });

  describe("exportAllProjects", () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let mockClick;
    let capturedBlob;
    let capturedDownloadName;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      mockClick = jest.fn();

      mockCreateObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return "blob:mock-url";
      });
      mockRevokeObjectURL = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, "createElement").mockImplementation((tag) => {
        const element = originalCreateElement(tag);
        if (tag === "a") {
          Object.defineProperty(element, "click", { value: mockClick });
          Object.defineProperty(element, "download", {
            set: (value) => { capturedDownloadName = value; },
            get: () => capturedDownloadName
          });
        }
        return element;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should export all projects as backup JSON", async () => {
      await createProject("ADR 1", "Context 1");
      await createProject("ADR 2", "Context 2");

      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      expect(capturedBlob).toBeInstanceOf(Blob);
      expect(capturedBlob.type).toBe("application/json");

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.version).toBe("1.0");
      expect(backup.exportedAt).toBeTruthy();
      expect(backup.projectCount).toBe(2);
      expect(backup.projects).toHaveLength(2);
    });

    test("should export empty backup when no projects exist", async () => {
      await exportAllProjects();

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(capturedBlob).toBeInstanceOf(Blob);

      // Verify backup structure using FileReader
      const blobText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(capturedBlob);
      });
      const backup = JSON.parse(blobText);
      expect(backup.projectCount).toBe(0);
      expect(backup.projects).toHaveLength(0);
    });

    test("should include correct filename with date", async () => {
      await exportAllProjects();

      expect(capturedDownloadName).toMatch(/^adr-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });
});
