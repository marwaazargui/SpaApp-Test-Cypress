import { TeamInfo } from "../../fixtures/Teams-dependencies/TeamData";

const openFirstStaffProfile = () => {
cy.get("table tbody tr")
  .first()
  .find('button[aria-haspopup="menu"]')
  .click({ force: true });

// First grab the role=menu
cy.get('div[role="menu"]', { timeout: 8000 })
  .should("be.visible")
  .within(() => {
    cy.contains("Delete").click();
  });
};
describe("Frontend Registration Tests", () => {
  const apiUrl = Cypress.env("API_URL");
  beforeEach(function () {
    // Load fixture for auth data
    cy.fixture("Auth-dependencies/AuthData").as("auth");

    cy.visit("auth/login");

    // Login with fixture data
    cy.get<{ validUser: { email: string; password: string } }>("@auth").then(
      (auth) => {
        cy.login(auth.validUser.email, auth.validUser.password);
        cy.url().should("include", "/dashboard");
        cy.contains("Dashboard").should("be.visible");
      }
    );
    cy.intercept("GET", `${apiUrl}/Staff*`).as("getStaff");
    cy.visit("team");
    cy.url().should("include", "/team");
    cy.contains("Team members").should("be.visible");
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it("delete Team member", () => {
    cy.wait(5000)
    openFirstStaffProfile();
    cy.contains("Cancel").click();
    cy.get(".swal2-popup").should("not.exist");
    cy.contains("button", "Actions").click();
    cy.contains('div[role="menuitem"]', "Delete").click();
    cy.intercept("DELETE", `${apiUrl}/Staff/*`).as("deleteStaff");
    cy.contains("Yes, delete it").click();
    cy.wait("@deleteStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body.message).to.eq(
        "Staff member deleted successfully"
      );
    });
    cy.get(".swal2-popup").should("not.exist");
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });
});
