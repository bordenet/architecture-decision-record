/**
 * Router Module
 * Handles client-side routing
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    if (this.routes[path]) {
      this.currentRoute = path;
      this.routes[path]();
    }
  }
}

module.exports = { Router };
