import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'

// ── Constants ────────────────────────────────────────────────────────────────

const RAG_API_HEALTH_URL = 'http://localhost:8000/health'
const API_TIMEOUT_MS = 45_000

const QUESTIONS = [
  'What companies has Dan worked at, and what were his titles?',
  "What's a specific product decision Dan made that he's proud of?",
  'How has Dan approached cross-functional collaboration or working with engineering?',
  'What metrics or measurable outcomes has Dan driven?',
  'What would make Dan a good fit for a Head of Product role?',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

async function attachQA(
  testInfo: TestInfo,
  index: number,
  question: string,
  answer: string,
): Promise<void> {
  await testInfo.attach(`Q${index + 1}: ${question.slice(0, 60)}`, {
    body: `QUESTION:\n${question}\n\nANSWER:\n${answer}`,
    contentType: 'text/plain',
  })
}

// ── API availability guard ────────────────────────────────────────────────────

let apiAvailable = true

test.beforeAll(async () => {
  try {
    const res = await fetch(RAG_API_HEALTH_URL, {
      signal: AbortSignal.timeout(5_000),
    })
    apiAvailable = res.ok
    if (!res.ok) {
      console.warn(`RAG API health check returned ${res.status} — responses may be degraded.`)
    }
  } catch {
    apiAvailable = false
  }
})

// ── Eval test ─────────────────────────────────────────────────────────────────

test.describe('RAG chatbot eval', () => {
  test('recruiter eval: 5 questions, capture full responses', async ({ page }, testInfo) => {
    test.skip(!apiAvailable, 'RAG API is not running at localhost:8000. Start it with: cd services/rag-api && poetry run uvicorn app.main:app --reload')

    // 5 LLM calls × 45s each + 30s buffer
    test.setTimeout(5 * API_TIMEOUT_MS + 30_000)

    await page.goto('/projects/chatbot', { waitUntil: 'networkidle' })

    const input = page.getByPlaceholder('Ask a question about my work experience')
    const sendButton = page.getByRole('button', { name: 'Send message' })

    await expect(input).toBeVisible()

    // Scope assistant bubble selector to the chat section to avoid false matches
    const chatSection = page.locator('section.rounded-2xl').first()

    const allQA: Array<{ q: string; a: string }> = []

    for (let i = 0; i < QUESTIONS.length; i++) {
      const question = QUESTIONS[i]

      // Type and submit
      await input.fill(question)
      await expect(sendButton).toBeEnabled()
      await sendButton.click()

      // Confirm the input locked (isSending = true)
      await expect(input).toBeDisabled({ timeout: 3_000 })

      // Wait for streaming to finish: input re-enables when isSending flips to false
      await expect(input).toBeEnabled({ timeout: API_TIMEOUT_MS })

      // Grab the i-th assistant bubble (0-indexed) — left-aligned flex divs are assistant messages.
      // Strip the "SOURCES (N) TOGGLE SOURCES" suffix appended by the citations widget.
      const assistantBubbles = chatSection.locator('.flex.justify-start')
      const rawText = await assistantBubbles.nth(i).innerText()
      const responseText = rawText.replace(/\n?SOURCES\s*\(\d+\)[\s\S]*/i, '').trim()

      allQA.push({ q: question, a: responseText })

      // Attach Q&A text
      await attachQA(testInfo, i, question, responseText)

      // Attach screenshot of conversation state
      const screenshotPath = testInfo.outputPath(`eval-q${i + 1}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false })
      await testInfo.attach(`Screenshot after Q${i + 1}`, {
        path: screenshotPath,
        contentType: 'image/png',
      })
    }

    // Consolidated summary for easy scanning in the HTML report
    const summary = allQA
      .map(({ q, a }, i) => `Q${i + 1}: ${q}\n${'─'.repeat(60)}\n${a}`)
      .join('\n\n\n')
    await testInfo.attach('Full eval summary', {
      body: summary,
      contentType: 'text/plain',
    })

    // Sanity: every response must have substantive content
    for (const { q, a } of allQA) {
      expect(a.trim().length, `Response to "${q.slice(0, 40)}..." should not be empty`).toBeGreaterThan(20)
    }
  })
})
