/// <reference types="cypress" />
import { registrationInfo } from "../fixtures/Auth-dependencies/RegistrationData";
import 'cypress-file-upload';

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>; // remove optional ?
      logout(): Chainable<void>;
      registerUser(user?: typeof registrationInfo): Chainable<void>;
      completeBusinessInfo(user?: typeof registrationInfo): Chainable<void>;
      selectCategories(): Chainable<void>;
      setTeamSize(): Chainable<void>;
      setLocationAddress(address?: typeof registrationInfo.address): Chainable<void>;
      setRecommendation(): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add("login", (username: string, password: string) => {
  cy.get('input[name="username"]').clear().type(username);
  cy.contains("button", "Continue").click();
  cy.get('input[name="password"]').should("be.visible").clear().type(password);
  cy.get('button[type="submit"]').click();
  
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.get(".ml-1 > .relative > .flex").click();
  cy.contains("Sign out").click();
});
// Step 1: Register user
Cypress.Commands.add(
  "registerUser",
  (user: typeof registrationInfo = registrationInfo) => {
    cy.get('input[name="username"]').type(user.email);
    cy.contains("button", "Continue").click();
    cy.contains("button", "Create Account").should("be.visible").click();
    cy.get('input[name="firstName"]').type(user.firstName);
    cy.get('input[name="lastName"]').type(user.lastName);
    cy.get('[name="phoneNumber"]').type(user.phone);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();
  }
);

// Step 2: Business info
Cypress.Commands.add(
  "completeBusinessInfo",
  (user: typeof registrationInfo = registrationInfo) => {
    cy.get('input[name="businessName"]').type(user.businessName);
    cy.get('input[name="website"]').type(user.businessWebsite);
    cy.contains("button", "Continue").click();
  }
);

// Step 3: Service categories
Cypress.Commands.add("selectCategories", () => {
  cy.contains("span", "Nails").click();
  cy.contains("span", "Hair salon").click();
  cy.contains("span", "Massage").click();
  cy.contains("button", "Continue").click();
});

// Step 4: Team size
Cypress.Commands.add("setTeamSize", () => {
  cy.contains("div", "6-10 people").click();
  cy.contains("button", "Continue").click();
});

// Step 5: Location address
Cypress.Commands.add(
  "setLocationAddress",
  (address: typeof registrationInfo.address = registrationInfo.address) => {
    cy.get("button#no-address").click();
    cy.contains("button", "Continue").should("not.be.disabled");
    cy.get("button#no-address").click();
    cy.get('input[placeholder="Street address"]').type(address.street);
    cy.get('input[placeholder="Apt, suite, etc. (optional)"]').type("floor 5");
    cy.get('input[placeholder="City"]').type(address.city);
    cy.get('input[placeholder="State / Province / Region"]').type(
      address.province
    );
    cy.get('input[placeholder="Postal code"]').type(address.postalCode);

    cy.get('button[role="combobox"]')
      .contains("Select your time zone")
      .click({ force: true });
    cy.contains(address.timeZone).click({ force: true });
    cy.contains("button", "Continue").should("not.be.disabled").click();
  }
);

// Step 6: Recommendation
Cypress.Commands.add("setRecommendation", () => {
  cy.get(
    'input[type="radio"][name="recommendation-source"][value="social-media"]'
  ).check({ force: true });
  cy.contains("button", "Done").click();
});

export {}; // Ensure this file is treated as a module
