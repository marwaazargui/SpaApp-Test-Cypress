import { registrationInfo } from "../../fixtures/RegistrationData";

function generateRandomEmail() {
  const timestamp = Date.now();
  return `marwaazargui+${timestamp}@example.com`;
}
describe("Frontend Registration Tests", () => {
  let auth: any;
  const apiUrl = Cypress.env("API_URL");

  beforeEach(() => {
    // Load fixture for auth data
    cy.fixture("AuthData").then((data) => {
      auth = data;
    });

    // Visit login page before each test
    cy.visit("auth/login");
  });

  it("Redirects to registration when username doesn't exist", () => {
    const username = auth.invalidUser.email;
    cy.get('input[name="username"]').type(username);
    cy.contains("button", "Continue").click();

    cy.request({
      method: "POST",
      url: `${apiUrl}/account/checkUsername?username=${encodeURIComponent(
        username
      )}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.exists === false) {
        cy.log("Username does not exist: showing create account page");
        cy.contains("Create a professional account").should("be.visible");
      }
    });
  });

  it("Validates required fields during registration", () => {
    const username = auth.newUser.email;
    cy.get('input[name="username"]').type(username);
    cy.contains("button", "Continue").click();
    cy.contains("button", "Create Account").should("be.visible").click();

    // Required fields validation
    cy.contains("First name is required").should("be.visible");
    cy.contains("Last name is required").should("be.visible");
    cy.contains("Password must be at least 8 characters long").should(
      "be.visible"
    );
  });

  it("Shows error for weak passwords", () => {
    const { email, firstName, lastName, phone } = registrationInfo;
    cy.registerUser({
      ...registrationInfo,
      password: "Passwo",
    });

    cy.contains("Password must be at least 8 characters long").should(
      "be.visible"
    );

    cy.get('input[name="password"]').clear().type("Password12");
    cy.contains("Password should contain at least 1 special character").should(
      "be.visible"
    );
  });

  it("Country code dropdown works correctly", () => {
    const { email } = registrationInfo;
    cy.registerUser(registrationInfo);

    // Default country
    cy.get('button[role="combobox"] span').should("have.text", "Canada");

    // Select US
    cy.get('button[role="combobox"]').click();
    cy.contains('[role="option"]', "United States").click();
    cy.get('button[role="combobox"] span').should("have.text", "United States");
  });

   it("Completes full registration successfully", () => {
    const email = generateRandomEmail(); // Use new email
    const user = { ...registrationInfo, email };

    cy.intercept("POST", `${apiUrl}/account/register`).as("register");
    cy.intercept("POST", `${apiUrl}/Account/token`).as("token");
    cy.intercept("GET", `${apiUrl}/Account/BusinessConfig`).as("businessConfig");
    cy.intercept("GET", `${apiUrl}/Location/GetViewModel`).as("getLocationViewModel");
    cy.intercept("POST", `${apiUrl}/Account/CompleteOnboarding`).as("completeOnboarding");

    cy.registerUser(user);
    cy.wait("@register").its("response.statusCode").should("eq", 200);
    cy.wait("@token").its("response.statusCode").should("eq", 200);
    cy.wait("@businessConfig").its("response.statusCode").should("eq", 200);

    cy.completeBusinessInfo(user);
    cy.selectCategories();
    cy.setTeamSize();
    cy.setLocationAddress(user.address);
    cy.setRecommendation();

    cy.wait("@completeOnboarding").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body.message).to.eq(
        "Business onboarding completed successfully"
      );
    });

    cy.url().should("include", "/dashboard");
    cy.contains("Dashboard").should("be.visible");
  });
});
