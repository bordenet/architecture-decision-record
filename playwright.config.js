export default {
  testDir: "./e2e",
  webServer: {
    command: "npm run serve",
    port: 8000
  },
  use: {
    baseURL: "http://localhost:8000",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
};
