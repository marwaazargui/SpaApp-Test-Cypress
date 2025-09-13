/// <reference types="cypress" />
import { registrationInfo } from "../../fixtures/RegistrationData";

describe("Frontend Login Tests", () => {
  let auth: any;
  const apiUrl = Cypress.env("API_URL");

  beforeEach(() => {
    cy.fixture("AuthData").then((data) => {
      auth = data;
    });
    cy.visit("auth/login");
  });

  it("Login with valid credentials", () => {
    cy.login(auth.validUser.email, auth.validUser.password);
    cy.url().should("include", "/dashboard");
    cy.contains("Dashboard").should("be.visible");
  });

  it("User stays logged in after page refresh", () => {
    cy.login(auth.validUser.email, auth.validUser.password);
    cy.url().should("include", "/dashboard");
    cy.reload();
    cy.url().should("include", "/dashboard");
  });

  it("Logs out successfully", () => {
    cy.login(auth.validUser.email, auth.validUser.password);
    cy.logout();
    cy.url().should("include", "/auth/login");
    cy.contains("button", "Continue").should("be.visible");
  });

  it("Shows error for invalid password", () => {
    cy.login(auth.validUser.email, auth.invalidUser.password);
    cy.contains("Login or password is incorrect").should("be.visible");
  });

  it("Password is required", () => {
    cy.get('input[name="username"]').type(auth.validUser.email);
    cy.contains("button", "Continue").click();
    cy.get('input[name="password"]', { timeout: 5000 }).should("be.visible");
    cy.get('button[type="submit"]').click();
    cy.contains("Password is required").should("be.visible");
  });

  it("Login is case-insensitive for email", () => {
    const mixedCaseEmail = auth.validUser.email.toUpperCase();
    cy.login(mixedCaseEmail, auth.validUser.password);
    cy.url().should("include", "/dashboard");
  });

  it("Shows error for invalid email format", () => {
    cy.get('input[name="username"]').type(auth.WrongEmailformat.email);
    cy.contains("button", "Continue").click();
    cy.contains("Please enter a valid email address").should("be.visible");
  });

  it("Redirects to registration when username doesn't exist", () => {
    const username = auth.invalidUser.email;
    cy.get('input[name="username"]').type(username);
    cy.contains("button", "Continue").click();

    cy.request({
      method: "POST",
      url: `${apiUrl}/account/checkUsername?username=${encodeURIComponent(username)}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.exists === false) {
        cy.contains("Create a professional account").should("be.visible");
      }
    });
  });
});
