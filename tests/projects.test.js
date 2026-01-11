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
});
