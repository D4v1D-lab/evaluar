import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AssessmentsPage } from '../pages/assessments.page';
import { QuestionPage } from '../pages/question.page';
import { RegistrationPage } from '../pages/registration.page';
import { SurveyPage } from '../pages/survey.page';

type PageObjectFixtures = {
  registrationPage: RegistrationPage;
  assessmentsPage: AssessmentsPage;
  questionPage: QuestionPage;
  surveyPage: SurveyPage;
};

// A single page shared by all tests in the same worker, so the whole flow
// (registration + assessment) runs in one browser window.
export const test = base.extend<PageObjectFixtures, { sharedPage: Page }>({
  sharedPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ viewport: null });
      const page = await context.newPage();
      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],

  registrationPage: async ({ sharedPage }, use) => {
    await use(new RegistrationPage(sharedPage));
  },
  assessmentsPage: async ({ sharedPage }, use) => {
    await use(new AssessmentsPage(sharedPage));
  },
  questionPage: async ({ sharedPage }, use) => {
    await use(new QuestionPage(sharedPage));
  },
  surveyPage: async ({ sharedPage }, use) => {
    await use(new SurveyPage(sharedPage));
  },
});

export { expect };
