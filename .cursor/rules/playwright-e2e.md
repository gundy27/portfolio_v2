## Playwright E2E (screenshot-first) verification

When a UI change is requested and we need confidence it matches the live rendered page, we must use a Playwright E2E check that:

- starts the Next.js dev server automatically
- navigates to the relevant route
- takes a full-page screenshot
- asserts the key UI expectations

### Commands

- Install Playwright browsers (once):
  - `npm run test:e2e:install`

- Run the chatbot project page check:
  - `CI= PW_FORCE_WEB_SERVER=1 PW_PORT=3010 PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=mac-x64 npm run test:e2e -- e2e/chatbot-project.spec.ts`

### Output artifacts

- Always reference the screenshot emitted by the test (attached to the Playwright report and stored under `test-results/`).
- Use that screenshot to diagnose mismatches (stale server, wrong route, or unexpected component rendering).

### Notes (Cursor environment)

- Cursor sets `CI=1`, which can disable `reuseExistingServer`. The command above forces a fresh server and avoids that pitfall.
- If Playwright complains about missing Chromium executables on Apple Silicon, the `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=mac-x64` workaround makes the runner use the downloaded x64 browser build in this environment.

