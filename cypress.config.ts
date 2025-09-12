import { defineConfig } from "cypress";
import dotenv from "cypress-dotenv";

export default defineConfig({
  e2e: {
    baseUrl: "https://ai-voice-agents.adelphalabs.com/", // your frontend
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    setupNodeEvents(on, config) {
      config = dotenv(config); // load .env
      return config;
    }
  }
});
