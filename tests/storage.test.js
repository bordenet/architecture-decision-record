const { storage } = require("../js/storage.js");

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
});
