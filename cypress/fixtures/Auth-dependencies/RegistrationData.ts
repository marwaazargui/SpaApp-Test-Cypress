import { Faker, en } from "@faker-js/faker";

// Default faker for names, email, phone, business info
const defaultFaker = new Faker({ locale: [en] });

// List of Canadian provinces
const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];

// Generate realistic Canadian postal code
function canadianPostalCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  return `${letters[Math.floor(Math.random() * 26)]}${
    digits[Math.floor(Math.random() * 10)]
  }${letters[Math.floor(Math.random() * 26)]} ${
    digits[Math.floor(Math.random() * 10)]
  }${letters[Math.floor(Math.random() * 26)]}${
    digits[Math.floor(Math.random() * 10)]
  }`;
}

// Generate a Canadian address object
function fakeCanadianAddress() {
  return {
    street: `${
      Math.floor(Math.random() * 9999) + 1
    } ${defaultFaker.location.street()}`, // fallback street
    suite:
      Math.random() > 0.5 ? `Suite ${Math.floor(Math.random() * 999) + 1}` : "",
    city: defaultFaker.location.city(),
    province: provinces[Math.floor(Math.random() * provinces.length)],
    postalCode: canadianPostalCode(),
    country: "Canada",
    timeZone: "Pacific Time",
  };
}

export const registrationInfo = {
  email: `marwaazargui+${Math.floor(Math.random() * 10000)}S@example.com`,
  firstName: defaultFaker.person.firstName(),
  lastName: defaultFaker.person.lastName(),
  phone: `416${defaultFaker.string.numeric(7)}`, // 7 random digits after 416
  Longphone: `416${defaultFaker.string.numeric(15)}`, // 7 random digits after 416

  password: "P@ssw0rd!",
  businessName: defaultFaker.company.name(),
  businessWebsite: defaultFaker.internet.url(),
  address: fakeCanadianAddress(),
};
