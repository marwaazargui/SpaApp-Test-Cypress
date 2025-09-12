describe("Frontend Login Tests", () => {
  let auth: any;
  const apiUrl = Cypress.env("API_URL"); // loads API URL from .env

  beforeEach(() => {
    // Load fixture data into `auth` variable
    cy.fixture("AuthData").then((data) => {
      auth = data;
    });
  });

  describe("Login Flow", () => {
    beforeEach(() => {
      cy.visit("auth/login");
    });

    //🔹 Login with valid credentials
    it("Login with valid credentials", () => {
      // Then perform login
      cy.get('input[name="username"]').type(auth.validUser.email);
      cy.contains("button", "Continue").click();
      cy.wait(500); // short wait (ms) for session/cookie initialization

      cy.request({
        method: "POST", // or GET if frontend uses GET
        url: `${apiUrl}/account/checkUsername?username=${encodeURIComponent(
          auth.validUser.email
        )}`,
        failOnStatusCode: false, // avoid Cypress failing automatically
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
      cy.get('input[name="password"]', { timeout: 5000 })
        .should("be.visible")
        .type(auth.validUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/dashboard");
    });

    // 🔹 Email required validation
    it("Email is required", () => {
      cy.contains("button", "Continue").click();
      cy.contains("Email is required").should("be.visible");
    });

    // // 🔹 Password required validation
    it("Password is required", () => {
      cy.get('input[name="username"]').type(auth.validUser.email);
      cy.contains("button", "Continue").click();
      cy.get('input[name="password"]', { timeout: 5000 }).should("be.visible");
      cy.get('button[type="submit"]').click();
      cy.contains("Password is required").should("be.visible");
    });

    // 🔹 Invalid password validation
    it("Login with invalid password", () => {
      cy.get('input[name="username"]').type(auth.validUser.email);
      cy.contains("button", "Continue").click();
      cy.get('input[name="password"]', { timeout: 5000 }).should("be.visible");
      cy.get('input[name="password"]').type(auth.invalidUser.password);
      cy.get('button[type="submit"]').click();
      cy.contains("Login or password is incorrect").should("be.visible");
    });
    it("Login with invalid email format", () => {
      cy.get('input[name="username"]').type(auth.WrongEmailformat.email);
      cy.contains("button", "Continue").click();
      cy.contains("Please enter a valid email address").should("be.visible");
    });

    it("Shows 'Create a professional account' when username doesn't exist", () => {
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
  });
});
