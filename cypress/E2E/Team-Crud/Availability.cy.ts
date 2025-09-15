import { TeamInfo } from "../../fixtures/Teams-dependencies/TeamData";

interface AuthData {
  validUser: { email: string; password: string };
  invalidUser: { email: string; password: string };
  newUser: { email: string; password: string };
  WrongEmailformat: { email: string };
}

describe("Frontend Availability Tests (requires login)", () => {
  const apiUrl = Cypress.env("API_URL");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let auth: AuthData;

  // Helper: Get today's section
  const getTodaySection = () => {
    const today = new Date();
    const todayName = days[today.getDay()];
    return cy.contains("h3", todayName)
      .parents(".bg-white.rounded-xl")
      .as("todaySection");
  };

  // Helper: Add a time slot
  const addTimeSlot = (startTime: string, endTime: string) => {
    cy.get("@todaySection").contains("button", "Add Time Slot").click({ force: true });

    cy.get("@todaySection")
      .find('button[role="combobox"]')
      .filter((_, el) => el.innerText.includes("Select start time"))
      .last()
      .click({ force: true });
    cy.get('[role="option"]').contains(startTime).click({ force: true });

    cy.get("@todaySection")
      .find('button[role="combobox"]')
      .filter((_, el) => el.innerText.includes("Select end time"))
      .last()
      .click({ force: true });
    cy.get('[role="option"]').contains(endTime).click({ force: true });

    cy.get("@todaySection")
      .contains("span", "Remove time slot")
      .parent("button")
      .should("exist")
      .should("be.visible");
  };

  // Helper: Remove all slots
  const removeAllSlots = () => {
    cy.get("@todaySection")
      .find("span")
      .filter(":contains('Remove time slot')")
      .parent("button")
      .each(($btn) => cy.wrap($btn).click({ force: true }));
  };

  beforeEach(() => {
    cy.fixture<AuthData>("Auth-dependencies/AuthData").then((data) => {
      auth = data;

      // Login before running any test
      cy.visit("auth/login");
      cy.login(auth.validUser.email, auth.validUser.password);

      cy.url().should("include", "/dashboard");
      cy.contains("Dashboard").should("be.visible");

      cy.intercept("GET", `${apiUrl}/Staff*`).as("getStaff");
      cy.visit("team");

      cy.url().should("include", "/team");
      cy.contains("Team members").should("be.visible");
      cy.wait("@getStaff").its("response.statusCode").should("eq", 200);

      cy.contains("button", "Add").click({ force: true });
      cy.url().should("include", "/team/add");
    });
  });

  it("Add a single Time slot", () => {
    cy.contains("Availability time").click({ force: true });
    getTodaySection();
    addTimeSlot("9:00AM", "4:00PM");

    cy.get("@todaySection")
      .contains("label", "Start Time")
      .parent()
      .find('button[role="combobox"]')
      .should("contain.text", "9:00AM");

    cy.get("@todaySection")
      .contains("label", "End Time")
      .parent()
      .find('button[role="combobox"]')
      .should("contain.text", "4:00PM");
  });

  it("Add multiple Time slots", () => {
    cy.contains("Availability time").click({ force: true });
    getTodaySection();

    const slots = [
      { start: "8:00AM", end: "12:00PM" },
      { start: "1:00PM", end: "4:00PM" },
      { start: "6:00PM", end: "8:00PM" },
    ];

    slots.forEach((slot) => addTimeSlot(slot.start, slot.end));
  });

  it("Add two time slots, remove them, and check 'No working hours set'", () => {
    cy.contains("Availability time").click({ force: true });
    getTodaySection();

    addTimeSlot("8:00AM", "12:00PM");
    addTimeSlot("1:00PM", "4:00PM");

    removeAllSlots();

    cy.get("@todaySection").contains("No working hours set").should("exist");
  });

  it("Availability Validation message", () => {
    cy.contains("Availability time").click({ force: true });
    cy.contains("h3", "Sunday")
      .parents(".bg-white.rounded-xl")
      .find('button:contains("Add Time Slot")')
      .click();
    cy.contains("button", "Add").click();
    cy.contains("Add working hours").should("be.visible");
  });
});
