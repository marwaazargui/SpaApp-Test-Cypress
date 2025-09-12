import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://ai-voice-agents.adelphalabs.com/", // 🔹 your company’s deployed frontend
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false
  }
});


