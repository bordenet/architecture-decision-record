const { ProjectView } = require("../js/project-view.js");

describe("ProjectView Module", () => {
  const testProject = {
    title: "Test Project",
    context: "Test context"
  };

  test("should render project view", () => {
    const view = new ProjectView(testProject);
    const result = view.render();
    expect(result).toContain("Test Project");
    expect(result).toContain("Test context");
  });

  test("should render project editor", () => {
    const view = new ProjectView(testProject);
    const result = view.renderEditor();
    expect(result).toContain("Test Project");
    expect(result).toContain("Test context");
  });

  test("should render untitled project", () => {
    const view = new ProjectView({});
    const result = view.render();
    expect(result).toContain("Untitled Project");
  });
});
