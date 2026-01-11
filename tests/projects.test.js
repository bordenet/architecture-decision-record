import { ProjectManager } from "../js/projects.js";

describe("Projects Module", () => {
  let mockStorage;
  let projectManager;

  beforeEach(() => {
    mockStorage = {
      saveProject: jest.fn(),
      getProject: jest.fn()
    };
    projectManager = new ProjectManager(mockStorage);
  });

  test("should create a new project", async () => {
    mockStorage.saveProject.mockResolvedValue("test-id");
    const data = { title: "Test Project", context: "Test context" };
    await projectManager.createProject(data);
    expect(mockStorage.saveProject).toHaveBeenCalled();
  });

  test("should update a project", async () => {
    const project = { id: "1", title: "Old Title" };
    mockStorage.getProject.mockResolvedValue(project);
    mockStorage.saveProject.mockResolvedValue("1");

    await projectManager.updateProject("1", { title: "New Title" });
    expect(mockStorage.saveProject).toHaveBeenCalled();
  });

  test("should not update non-existent project", async () => {
    mockStorage.getProject.mockResolvedValue(null);
    await projectManager.updateProject("999", { title: "New Title" });
    expect(mockStorage.saveProject).not.toHaveBeenCalled();
  });
});
