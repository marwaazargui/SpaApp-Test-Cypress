/// <reference types="cypress" />
import { registrationInfo } from "../../fixtures/Auth-dependencies/RegistrationData";

describe("Frontend Login Tests", () => {
  let auth: any;
  const apiUrl = Cypress.env("API_URL");

  beforeEach(() => {
    cy.fixture("Auth-dependencies/AuthData").then((data) => {
      auth = data;
    });
    cy.visit("auth/login");
  });

  it("Should excpect API to be successful when request resset password", () => {
    cy.intercept(
      "POST",
      `${apiUrl}/account/forgetPassword
`
    ).as("ForgetPassword");

    cy.get('input[name="username"]').type(auth.validUser.email);
    cy.contains("button", "Continue").click();
    cy.contains("Forgot your password?").should("be.visible").click();
    cy.contains("We'll send you a secure link to create a new password").should(
      "be.visible"
    );
    cy.contains("button", "Reset Password").click();
    cy.wait("@ForgetPassword").its("response.statusCode").should("eq", 200);
    cy.contains("button", "Back to Login").should("be.visible").click();
    cy.url().should("include", "/auth/login");
  });
});
