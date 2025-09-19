import { TeamInfo } from "../../fixtures/Teams-dependencies/TeamData";

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
    cy.contains("Team members").should("be.visible", { timeout: 50000 });
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it("Check Table info is filled with API response", function () {
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);

      const staffData = interception.response?.body.data;
      expect(staffData.length).to.be.greaterThan(0);

      cy.get("table tbody tr")
        .first()
        .within(() => {
          const staff = staffData[0];

          cy.get("td").eq(0).should("contain", staff.firstName);
          cy.get("td").eq(0).should("contain", staff.lastName);

          if (staff.profilePicture) {
            cy.get("img").should("have.attr", "src", staff.profilePicture);
          }

          cy.get("td").eq(1).should("contain", staff.email);
          cy.get("td").eq(1).should("contain", staff.phoneNumber);

          cy.get("td")
            .eq(2)
            .should("contain", staff.availabilityCount.toString());
        });
    });
  });

  it("Should not allow selecting a future month in the current year", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");

    const today = new Date();
    const thisYear = today.getFullYear();
    const futureMonth = today.getMonth() + 1; // 0 = Jan, so +1 gives next month index

    if (futureMonth > 11) return;

    cy.get('button[role="combobox"]')
      .contains("Select a year")
      .click({ force: true });
    cy.get('[role="option"]').contains(thisYear.toString()).click();
    cy.get('button[aria-haspopup="dialog"]').click();
    cy.get('[aria-label="Go to next month"]').click();
    cy.contains("button", "14").click({ force: true });
    cy.contains("button", "Add").click({ force: true });
    cy.get("body").should("contain.text", "Birth date cannot be in the future");
  });

  it("Check validation personal info", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");
    cy.contains("button", "Add").click({ force: true });
    cy.contains("First name is required").should("be.visible");
    cy.contains("Last name is required").should("be.visible");
    cy.contains("Email is required").should("be.visible");
    cy.contains("Phone number is required").should("be.visible");
  });

  it("Check Phone number limitation", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");
    cy.contains("button", "Add").click();
    cy.get(".PhoneInputInput").type(TeamInfo.Longphone);
    cy.contains("Phone number is too long").should("be.visible");
  });

  it("User already exists", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");

    cy.get("#firstName").type(TeamInfo.firstName);
    cy.get("#lastName").type(TeamInfo.lastName);
    cy.get("#email").type("marwaazargui+JMA@gmail.com");
    cy.get(".PhoneInputInput").type(TeamInfo.phone);

    cy.get('button[role="combobox"]')
      .contains("Select a year")
      .click({ force: true });
    cy.get('[role="option"]').contains("1997").click({ force: true });
    cy.get('button[aria-haspopup="dialog"]').click();
    cy.contains("button", "14").click({ force: true });

    cy.get('button[style*="background-color: rgb(139, 92, 246)"]').click();
    cy.get('[name="jobTitle"]').type(TeamInfo.jobtittle);
    cy.intercept("POST", `${apiUrl}/Staff`).as("AddStaff");
    cy.contains("button", "Add").click({ force: true });
    cy.wait("@AddStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(400);
      expect(interception.response?.body.message).to.eq(
        "Email marwaazargui+JMA@gmail.com is already registered!"
      );
    });
  });

  it("Add New Team member", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");

    // Step 1 User info
    cy.get("#firstName").type(TeamInfo.firstName);
    cy.get("#lastName").type(TeamInfo.lastName);
    cy.get("#email").type(TeamInfo.email);
    cy.get(".PhoneInputInput").type(TeamInfo.phone);

    cy.get('button[role="combobox"]')
      .contains("Select a year")
      .click({ force: true });
    cy.get('[role="option"]').contains("1997").click({ force: true });
    cy.get('button[aria-haspopup="dialog"]').click();
    cy.contains("button", "14").click({ force: true });

    cy.get('button[style*="background-color: rgb(139, 92, 246)"]').click();
    cy.get('[name="jobTitle"]').type(TeamInfo.jobtittle);

    const profilePicturePath = "Images/TeamProfile.jpg";
    cy.get('input[type="file"]').attachFile(profilePicturePath);

    // Step 2 Services
    cy.contains("Services").click({ force: true });
    cy.get('button[role="checkbox"]', { timeout: 10000 })
      .should("be.visible")
      .first()
      .click();
    cy.get('button[role="checkbox"]', { timeout: 10000 })
      .should("be.visible")
      .eq(1)
      .click();

    // Step 3 Locations
    cy.contains("Locations").click({ force: true });
    cy.get('button[role="radio"]').first().click();

    // Last Step Working Hours
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayName = days[new Date().getDay()];
    const nextDay = days[(new Date().getDay() + 1) % 7];

    cy.contains("Availability time").click({ force: true });
    cy.contains("h3", todayName)
      .parents(".bg-white.rounded-xl")
      .find('button:contains("Add Time Slot")')
      .click();

    cy.contains("label", "Start Time")
      .parent()
      .find('button[role="combobox"]')
      .click();
    cy.get('[role="option"]').contains("9:00AM").click();

    cy.contains("label", "End Time")
      .parent()
      .find('button[role="combobox"]')
      .click();
    cy.get('[role="option"]').contains("4:00PM").click();

    cy.contains("label", "Start Time")
      .parent()
      .find('button[role="combobox"]')
      .should("contain.text", "9:00AM");
    cy.contains("label", "End Time")
      .parent()
      .find('button[role="combobox"]')
      .should("contain.text", "4:00PM");

    cy.intercept("POST", `${apiUrl}/Staff`).as("AddStaff");
    cy.contains("button", "Add").click({ force: true });
    cy.wait("@AddStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body.message).to.eq(
        "Staff member created successfully"
      );
    });

    cy.url().should("not.include", "/team/add");
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });

  it("close button close the page", () => {
    cy.contains("button", "Add").click({ force: true });
    cy.url().should("include", "/team/add");
    cy.contains("button", "Close").click({ force: true });
    cy.url().should("not.include", "/team/add");
  });
});
