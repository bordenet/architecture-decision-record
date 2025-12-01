/**
 * IndexedDB Storage Module
 * Handles all client-side data persistence
 */

const DB_NAME = "adr-assistant";
const DB_VERSION = 1;
const STORE_NAME = "projects";

class Storage {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async init() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          // eslint-disable-next-line no-console
          console.error("IndexedDB open error:", request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;
          // eslint-disable-next-line no-console
          console.log("IndexedDB initialized successfully");
          resolve();
        };

        request.onupgradeneeded = (event) => {
          // eslint-disable-next-line no-console
          console.log("IndexedDB upgrade needed");
          const db = event.target.result;

          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const projectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
            projectStore.createIndex("updatedAt", "updatedAt", { unique: false });
            projectStore.createIndex("title", "title", { unique: false });
          }

          if (!db.objectStoreNames.contains("prompts")) {
            db.createObjectStore("prompts", { keyPath: "phase" });
          }

          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "key" });
          }
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("IndexedDB init error:", error);
        reject(error);
      }
    });
  }

  /**
   * Save a project
   */
  async saveProject(project) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        ...project,
        updatedAt: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get all projects
   */
  async getAllProjects() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get project by ID
   */
  async getProject(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete project
   */
  async deleteProject(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get storage size
   */
  async getStorageSize() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 };
    }
    return navigator.storage.estimate();
  }
}

const storage = new Storage();

module.exports = { storage };
