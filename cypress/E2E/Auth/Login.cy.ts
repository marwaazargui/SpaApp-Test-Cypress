describe("Frontend Login Tests", () => {
  let auth: any;

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

    it("Login with valid credentials", () => {
      cy.get('input[name="username"]').type(auth.validUser.email);
      cy.contains("button", "Continue").click();
      cy.get('input[name="password"]', { timeout: 5000 })
        .should("be.visible")
        .type(auth.validUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/dashboard");
    });

    it("Email is required", () => {
      cy.contains("button", "Continue").click();
      cy.contains("Email is required").should("be.visible");
    });

    it("Password is required", () => {
      cy.get('input[name="username"]').type(auth.validUser.email);
      cy.contains("button", "Continue").click();
      cy.get('input[name="password"]', { timeout: 5000 }).should("be.visible");
      cy.get('button[type="submit"]').click();
      cy.contains("Password is required").should("be.visible");
    });

    it("Login with invalid password", () => {
      cy.get('input[name="username"]').type(auth.validUser.email);
     cy.contains("button", "Continue").click();
      cy.get('input[name="password"]', { timeout: 5000 })
        .should("be.visible")
      cy.get('input[name="password"]').type(auth.invalidUser.password);
      cy.get('button[type="submit"]').click();
      cy.contains("Login or password is incorrect").should("be.visible");
    });
  });
});
