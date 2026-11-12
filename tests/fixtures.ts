import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// A single page shared by all tests in the same worker, so the whole flow
// (registration + assessment) runs in one browser window.
export const test = base.extend<{}, { sharedPage: Page }>({
  sharedPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ viewport: null });
      const page = await context.newPage();
      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],
});

export { expect };
