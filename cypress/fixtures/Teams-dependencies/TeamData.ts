import { Faker, en } from '@faker-js/faker';
const defaultFaker = new Faker({ locale: [en] });

export const TeamInfo = {
  email: `marwaazargui+${Math.floor(Math.random() * 10000)}T@example.com`,
  firstName: defaultFaker.person.firstName(),
  lastName: defaultFaker.person.lastName(),
  phone: `416${defaultFaker.string.numeric(7)}`, // 7 random digits after 416
  Longphone: `416${defaultFaker.string.numeric(15)}`, // 7 random digits after 416
  jobtittle: defaultFaker.person.jobTitle(),

};