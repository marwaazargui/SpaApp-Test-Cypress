import { TeamInfo } from "../../fixtures/Teams-dependencies/TeamData";

describe("Frontend Registration Tests", () => {
  const apiUrl = Cypress.env("API_URL");

  beforeEach(function () {
    cy.fixture("Auth-dependencies/AuthData").as("auth");
    cy.visit("auth/login");

    cy.get<{ validUser: { email: string; password: string } }>("@auth").then(
      (auth) => {
        cy.login(auth.validUser.email, auth.validUser.password);
        cy.url().should("include", "/dashboard");
        cy.contains("Dashboard").should("be.visible");
      }
    );
    cy.intercept(
      "GET",
      `${apiUrl}/Appointments/DisplayAppointmentsByTeamMemberV2*`
    ).as("getCalendar");
    cy.visit("calendar");
    cy.url().should("include", "/calendar");
  });
  it("Loads calendar appointments when opening the page", () => {
    cy.wait(2000);
    cy.wait("@getCalendar", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);

      const staffArray = interception.response?.body.data;
      expect(staffArray).to.exist;
      expect(staffArray).to.be.an("array");

      // flatten all appointments from each staff
      const allAppointments = staffArray.flatMap(
        (staff: any) => staff.appointments || []
      );

      if (allAppointments.length > 0) {
        cy.get(".rbc-event").should("exist");
      } else {
        cy.get(".rbc-event").should("not.exist");
      }
    });
  });

  it("should show validation error when saving without selecting a service", () => {
    cy.get(".rbc-day-slot .rbc-time-slot", { timeout: 2000 })
      .eq(4)
      .click("center", { force: true });
    cy.contains("Add appointment").click();
    cy.contains("Save",{timeout:2000}).should("not.be.visible");
  });

  it("Clicks in the 1:00 AM slot cell and saves appointment", () => {
    cy.intercept("POST", `${apiUrl}/Appointments/AddMultipleAppointments`).as(
      "addAppointment"
    );
    cy.get(".rbc-day-slot .rbc-time-slot", { timeout: 2000 })
      .eq(4)
      .click("center", { force: true });
    cy.contains("Add appointment").click();
    cy.contains("Nails").click();
    cy.contains("Add client").click();
    cy.contains("div", "Irene Stanford").click();
    cy.contains("Save").click();
    cy.wait("@addAppointment").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200); // or 201 depending on API
    });
    cy.wait("@getCalendar", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body.data).to.exist;
    });
  });

  it("Prevents double booking in the same slot", () => {
    cy.wait(2000);
    cy.get(".rbc-day-slot .rbc-time-slot")
      .eq(4)
      .click("center", { force: true });
    // “Add appointment” button should NOT appear
    cy.contains("Add appointment").should("not.exist");
  });

  it("Change status to cancelled and wait for API response", () => {
    cy.intercept(
      "GET",
      "/api/Appointments/DisplayAppointmentsByTeamMemberV2*"
    ).as("getAppointments");
    cy.wait(2000);
    cy.get(".rbc-event").click("center", { force: true });
    cy.contains("button", "Confirmed").click({ force: true });
    cy.contains("span", "Cancelled").click({ force: true });
    cy.contains("button", "Save").click();
    cy.wait("@getAppointments").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });
  });
  // Performance
  it("Loads calendar appointments within 3 seconds", () => {
    const startTime = Date.now();

    cy.intercept(
      "GET",
      `${apiUrl}/Appointments/DisplayAppointmentsByTeamMemberV2*`
    ).as("getCalendar");

    cy.visit("calendar");

    cy.wait("@getCalendar", { timeout: 10000 }).then((interception) => {
      const duration = Date.now() - startTime;
      expect(interception.response?.statusCode).to.eq(200);
      expect(duration).to.be.lessThan(3000); // performance check
      const staffArray = interception.response?.body.data;
      expect(staffArray).to.exist;
      expect(staffArray).to.be.an("array");

      // flatten all appointments from each staff
      const allAppointments = staffArray.flatMap(
        (staff: any) => staff.appointments || []
      );

      if (allAppointments.length > 0) {
        cy.get(".rbc-event").should("exist");
      } else {
        cy.get(".rbc-event").should("not.exist");
      }
    });
  });
});
