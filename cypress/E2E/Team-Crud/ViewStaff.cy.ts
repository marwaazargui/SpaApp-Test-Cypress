import "cypress-real-events/support";

describe("Staff Profile Page Validation", () => {
  const apiUrl = Cypress.env("API_URL");
  let timezoneOffsetHours: number;
  let staffId: string;

const openFirstStaffProfile = () => {
cy.get("table tbody tr")
  .first()
  .find('button[aria-haspopup="menu"]')
  .click({ force: true });
cy.get("table tbody tr")
  .first()
  .find('button[aria-haspopup="menu"]')
  .click({ force: true , timeout: 5000 });
// First grab the role=menu
cy.get('div[role="menu"]', { timeout: 8000 })
  .should("be.visible")
  .within(() => {
    cy.contains("View").click();
  });
};


  beforeEach(() => {
    // Load fixture and visit login page
  cy.viewport(1280, 720); // force desktop size
    cy.fixture("Auth-dependencies/AuthData").as("auth");
    cy.visit("auth/login");

    // Login with fixture data
    cy.get<{ validUser: { email: string; password: string } }>("@auth").then(
      (auth) => {
        cy.login(auth.validUser.email, auth.validUser.password);
        cy.url().should("include", "/dashboard");
        cy.contains("Dashboard").should("be.visible");

        // Get timezone offset from localStorage
        cy.window()
          .its("localStorage")
          .invoke("getItem", "persist:auth")
          .then((authString: string | null) => {
            if (!authString)
              throw new Error("persist:auth not found in localStorage");

            const authData = JSON.parse(authString);
            const userData = JSON.parse(authData.user);

            timezoneOffsetHours = userData.timezoneOffsetHours;
            cy.log(`Timezone offset: ${timezoneOffsetHours}`);
          });
      }
    );

    // Visit team page and wait for staff API
    cy.intercept("GET", `${apiUrl}/Staff*`).as("getStaff");
    cy.visit("team");
    cy.url().should("include", "/team");
    cy.contains("Team members").should("be.visible");
    cy.wait("@getStaff").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      staffId = interception.response?.body?.data?.[0]?.id; // grab first staffId
      cy.log(`Testing staffId: ${staffId}`);
    });
  });

  it("should display the correct staff profile details from the API", () => {
    cy.intercept("GET", `${apiUrl}/Staff/*`).as("getSpecificStaff");

    openFirstStaffProfile(); // ✅ open drawer

    cy.wait("@getSpecificStaff").then((interception) => {
      if (!interception.response || !interception.response.body) {
        throw new Error(
          "API request failed or did not return a valid response."
        );
      }
      const staffData = interception.response.body;

      // --- Assertions (name, email, services, etc.) ---
      cy.get("h3").should(
        "contain.text",
        `${staffData.firstName} ${staffData.lastName}`
      );
      cy.contains("p", staffData.email).should("be.visible");
      cy.contains("p", staffData.phoneNumber).should("be.visible");
      cy.contains("p", staffData.locationName).should("be.visible");

      staffData.services.forEach((service: any) => {
        cy.contains("p.font-medium", service.name)
          .parent()
          .should(
            "contain.text",
            `${service.durationMinutes} min • $${service.price}`
          );
      });

      if (staffData.availability?.length > 0) {
        const availability = staffData.availability[0];
        const localFromTime =
          (availability.fromTime + timezoneOffsetHours + 24) % 24;
        const localToTime =
          (availability.toTime + timezoneOffsetHours + 24) % 24;

        const formatTime = (hour24: number) => {
          const hour = hour24 % 12 || 12;
          const ampm = hour24 >= 12 ? "PM" : "AM";
          return `${hour}:00${ampm}`;
        };
        const expectedText = `${formatTime(localFromTime)} - ${formatTime(
          localToTime
        )}`;
        cy.get("span.bg-green-100").should("contain.text", expectedText);
      }

      if (staffData.profilePicture) {
        cy.get(`img[src="${staffData.profilePicture}"]`).should(
          "have.attr",
          "alt",
          staffData.firstName
        );
      }

      const creationDate = new Date(staffData.created);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
        creationDate
      );

      cy.contains(
        "div.text-foreground",
        `Team member since ${formattedDate}`
      ).should("be.visible");
    });
  });

  it("should show vacations if they exist", () => {
    cy.intercept("GET", `${apiUrl}/Staff/${staffId}/Vacations`).as(
      "getVacations"
    );

    openFirstStaffProfile(); // ✅ use helper consistently

    // ✅ Check modal/drawer appears
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("h2", "Details").should("be.visible");

    cy.wait("@getVacations").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const vacations = interception.response?.body || [];

      if (vacations.length > 0) {
        vacations.forEach((vacation: any) => {
          const startDate = new Date(vacation.startDate);
          const endDate = new Date(vacation.endDate);
          const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
          };
          const formattedStart = new Intl.DateTimeFormat(
            "en-US",
            options
          ).format(startDate);
          const formattedEnd = new Intl.DateTimeFormat("en-US", options).format(
            endDate
          );
          const expectedText = `${formattedStart} - ${formattedEnd}`;

          // Check red box with the text
          cy.contains("div.font-medium.text-red-700", expectedText)
            .parents("div.bg-red-50")
            .should("exist");
        });
      } else {
        cy.log("No vacations found for this staff.");
      }
    });
  });
});
