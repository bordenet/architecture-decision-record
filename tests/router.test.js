const { Router } = require("../js/router.js");

describe("Router Module", () => {
  test("should register a route", () => {
    const router = new Router();
    const handler = jest.fn();
    router.register("/home", handler);
    expect(router.routes["/home"]).toBe(handler);
  });

  test("should navigate to a registered route", () => {
    const router = new Router();
    const handler = jest.fn();
    router.register("/home", handler);
    router.navigate("/home");
    expect(handler).toHaveBeenCalled();
    expect(router.currentRoute).toBe("/home");
  });

  test("should not navigate to unregistered route", () => {
    const router = new Router();
    router.navigate("/unknown");
    expect(router.currentRoute).toBeNull();
  });
});
