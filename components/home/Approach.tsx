'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ContentCardSection } from '@/components/ui/ContentCardSection'

const approachParagraph =
  'When I’m building a product or running an experiment, I default to a repeatable way of working. I start by grounding on the user and questioning assumptions until the real shape is clear. I make my thinking visible early by writing, sketching, and sharing in-progress work to sharpen ideas and invite feedback. From there, I frame clear bets, define what success looks like, and iterate quickly to learn what moves the needle. I gravitate toward simplicity and storytelling. By distilling complexity into clear narratives, metaphors, and visuals, I help teams makes decisions, build alignment, and scale what works.'

const steps = [
  {
    title: 'Decompose the problem',
    subtitle: 'Break it down, revisit assumptions, ask why',
  },
  {
    title: 'Make it visible',
    subtitle: 'Write it down, sketch it out, share early',
  },
  {
    title: 'Form a hypothesis',
    subtitle: 'Define success and what should be tested',
  },
  {
    title: 'Test → learn → repeat',
    subtitle: 'Run experiments to maximize learning speed',
  },
  {
    title: 'Decide',
    subtitle: 'Synthesize data and chart a path forward',
  },
  {
    title: 'Align and scale',
    subtitle: 'Build buy-in and scale the solution',
  },
] as const

export function Approach() {
  const shouldReduceMotion = useReducedMotion()

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: 1,
        staggerChildren: 2,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1 } },
  } as const

  return (
    <ContentCardSection
      imagePosition="right"
      media={
        <div className="min-w-0">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-4 -translate-x-1/2 top-1 bottom-1 w-px bg-gray-200" aria-hidden="true" />

            {shouldReduceMotion ? (
              <ol className="space-y-7 sm:space-y-8">
                {steps.map((step) => (
                  <li key={step.title} className="relative pl-12">
                    {/* Step marker */}
                    <span
                      className="absolute left-4 top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white"
                      style={{ borderColor: '#598392' }}
                      aria-hidden="true"
                    />

                    <h3 className="font-heading text-base sm:text-lg font-semibold leading-tight text-[var(--color-text-primary)] mb-0">
                      {step.title}
                    </h3>
                    <p className="subtitle-gap text-sm sm:text-base leading-snug text-[var(--color-text-secondary)] mb-0">
                      {step.subtitle}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <motion.ol
                className="space-y-7 sm:space-y-8"
                variants={listVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
              >
                {steps.map((step) => (
                  <motion.li key={step.title} className="relative pl-12" variants={itemVariants}>
                    {/* Step marker */}
                    <span
                      className="absolute left-4 top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white"
                      style={{ borderColor: '#598392' }}
                      aria-hidden="true"
                    />

                    <h3 className="font-heading text-base sm:text-lg font-semibold leading-tight text-[var(--color-text-primary)] mb-0">
                      {step.title}
                    </h3>
                    <p className="subtitle-gap text-sm sm:text-base leading-snug text-[var(--color-text-secondary)] mb-0">
                      {step.subtitle}
                    </p>
                  </motion.li>
                ))}
              </motion.ol>
            )}
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

