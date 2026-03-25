import { expect, test } from '@playwright/test'

test('chatbot project page hides hero and starts with chat', async ({ page }, testInfo) => {
  await page.goto('/projects/chatbot', { waitUntil: 'networkidle' })

  // Evidence first: always capture a screenshot to debug mismatches.
  const screenshotPath = testInfo.outputPath('projects-chatbot.png')
  await page.screenshot({ path: screenshotPath, fullPage: true })
  await testInfo.attach('projects-chatbot.png', { path: screenshotPath, contentType: 'image/png' })

  // Chat UI should be present.
  await expect(page.getByPlaceholder('Ask a question about my work experience')).toBeVisible()

  // Hero should be absent (these are specific to `ProjectHero`).
  await expect(page.locator('img[alt="Chat With My Work"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: '← Back to Home' })).toHaveCount(0)
})

