const { Workflow, PHASES, PHASE_NAMES } = require("../js/workflow.js");

describe("Workflow Module", () => {
  test("should initialize with phase 1", () => {
    const project = { phase: 1 };
    const workflow = new Workflow(project);

    expect(workflow.getCurrentPhase()).toBe(1);
  });

  test("should get current phase name", () => {
    const project = { phase: 1 };
    const workflow = new Workflow(project);

    expect(workflow.getCurrentPhaseName()).toBe("Initial Draft");
  });

  test("should advance to next phase", () => {
    const project = { phase: 1 };
    const workflow = new Workflow(project);

    expect(workflow.canAdvanceToNextPhase()).toBe(true);
    workflow.advancePhase();
    expect(workflow.getCurrentPhase()).toBe(2);
  });

  test("should not advance past phase 3", () => {
    const project = { phase: 3 };
    const workflow = new Workflow(project);

    expect(workflow.canAdvanceToNextPhase()).toBe(false);
    const advanced = workflow.advancePhase();
    expect(advanced).toBe(false);
    expect(workflow.getCurrentPhase()).toBe(3);
  });

  test("should jump to specific phase", () => {
    const project = { phase: 1 };
    const workflow = new Workflow(project);

    workflow.goToPhase(3);
    expect(workflow.getCurrentPhase()).toBe(3);
  });

  test("should not jump to invalid phase", () => {
    const project = { phase: 1 };
    const workflow = new Workflow(project);

    const result = workflow.goToPhase(5);
    expect(result).toBe(false);
    expect(workflow.getCurrentPhase()).toBe(1);
  });
});
