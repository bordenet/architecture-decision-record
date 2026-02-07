import { storage } from "../../shared/js/storage.js";

describe("Storage Module", () => {
  beforeEach(async () => {
    await storage.init();
  });

  test("should initialize database", async () => {
    expect(storage.db).toBeDefined();
  });

  test("should save and retrieve a project", async () => {
    const project = {
      id: "test-1",
      title: "Test Project",
      context: "Test context",
      decision: "Test decision",
      consequences: "Test consequences",
      rationale: "Test rationale",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveProject(project);
    const retrieved = await storage.getProject("test-1");

    expect(retrieved).toBeDefined();
    expect(retrieved.title).toBe("Test Project");
  });

  test("should get all projects", async () => {
    const projects = await storage.getAllProjects();
    expect(Array.isArray(projects)).toBe(true);
  });

  test("should delete a project", async () => {
    const project = {
      id: "test-delete",
      title: "To Delete",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveProject(project);
    await storage.deleteProject("test-delete");
    const retrieved = await storage.getProject("test-delete");

    expect(retrieved).toBeUndefined();
  });

  describe("exportAll and importAll", () => {
    test("exportAll should export all projects", async () => {
      // Clear any existing projects first
      const existing = await storage.getAllProjects();
      for (const p of existing) {
        await storage.deleteProject(p.id);
      }

      const project1 = {
        id: "export-1",
        title: "Export Test 1",
        context: "Context 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const project2 = {
        id: "export-2",
        title: "Export Test 2",
        context: "Context 2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await storage.saveProject(project1);
      await storage.saveProject(project2);

      const backup = await storage.exportAll();

      expect(backup.version).toBeDefined();
      expect(backup.exportDate).toBeDefined();
      expect(backup.projectCount).toBe(2);
      expect(backup.projects).toHaveLength(2);
    });

    test("importAll should import all projects from export data", async () => {
      const importData = {
        version: 1,
        exportDate: new Date().toISOString(),
        projectCount: 2,
        projects: [
          { id: "import-1", title: "Import Test 1", context: "Context 1" },
          { id: "import-2", title: "Import Test 2", context: "Context 2" }
        ]
      };

      const count = await storage.importAll(importData);

      expect(count).toBe(2);
      const project1 = await storage.getProject("import-1");
      const project2 = await storage.getProject("import-2");
      expect(project1.title).toBe("Import Test 1");
      expect(project2.title).toBe("Import Test 2");
    });

    test("importAll should throw on invalid import data", async () => {
      await expect(storage.importAll({})).rejects.toThrow("Invalid import data");
      await expect(storage.importAll({ projects: "not-array" })).rejects.toThrow("Invalid import data");
    });

    test("exportAll should export empty backup when no projects", async () => {
      // Clear any existing projects first
      const existing = await storage.getAllProjects();
      for (const p of existing) {
        await storage.deleteProject(p.id);
      }

      const backup = await storage.exportAll();

      expect(backup.version).toBeDefined();
      expect(backup.exportDate).toBeDefined();
      expect(backup.projectCount).toBe(0);
      expect(backup.projects).toHaveLength(0);
    });
  });
});
