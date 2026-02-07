'use client'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { ContentCardSection } from '@/components/ui/ContentCardSection'

const approachParagraph =
  'I rely on a simple, repeatable way of working to move from ambiguity to action. It creates clarity, aligns teams, and accelerates decision-making.'

const steps = [
  {
    title: 'Decompose the problem',
    subtitle: 'Ground on the user, question assumptions, ask why',
  },
  {
    title: 'Make it visible',
    subtitle: 'Write it down, sketch it out, share early',
  },
  {
    title: 'Form a hypothesis',
    subtitle: 'Frame clear bets and define success',
  },
  {
    title: 'Test → learn → repeat',
    subtitle: 'Iterate on experiments to maximize learning speed',
  },
  {
    title: 'Share insights',
    subtitle: 'Synthesize data and share simple narratives',
  },
  {
    title: 'Align and execute',
    subtitle: 'Drive decision-making and scale what works',
  },
] as const

export function Approach() {
  return (
    <ContentCardSection
      imagePosition="right"
      media={
        <div className="min-w-0">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-4 -translate-x-1/2 top-1 bottom-1 w-px bg-gray-200" aria-hidden="true" />

            <ol className="space-y-7 sm:space-y-8">
              {steps.map((step) => (
                <li key={step.title} className="relative pl-12">
                  {/* Step marker */}
                  <span
                    className="absolute left-4 top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white"
                    style={{ borderColor: '#598392' }}
                    aria-hidden="true"
                  />

                  <h3 className="font-heading text-base sm:text-lg font-normal leading-tight text-[var(--color-text-primary)] mb-0">
                    {step.title}
                  </h3>
                  <p
                    className="subtitle-gap text-sm sm:text-base leading-snug text-[var(--color-text-secondary)] mb-0"
                    style={{ marginTop: 4 }}
                  >
                    {step.subtitle}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      }
    >
      <div className="min-w-0 max-w-2xl space-y-4">
        <SectionHeader label="SYSTEMATIC" heading="Approach To Building Products" headingLevel="h2" />
        <p className="text-base sm:text-lg text-[var(--color-text-body)]">{approachParagraph}</p>
      </div>
    </ContentCardSection>
  )
}

