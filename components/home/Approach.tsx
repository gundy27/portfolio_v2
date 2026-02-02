'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'

const approachParagraph =
  'Dan approaches product by breaking complex problems down to their most atomic parts and challenging assumptions early. He starts by asking “why,” writing things down, and using visuals—flows, wireframes, and diagrams—to clarify thinking. He forms clear hypotheses and designs experiments to learn as quickly as possible with minimal waste. Data is collected and synthesized to inform strong opinions and practical recommendations. He collaborates closely with partners to shape a shared vision and align on a path forward. When stakes are high, he builds coalitions and uses simple metaphors that help others understand, champion, and sell the idea.'

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
    subtitle: 'Define success and why it should work',
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
    subtitle: 'Build buy-in by spreading the narrative',
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
    <section className="section-spacing-large">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div className="min-w-0 max-w-2xl">
              <SectionHeader label="WORKING STYLE" heading="Approach To Product" headingLevel="h2" />
              <p className="text-base sm:text-lg text-[var(--color-text-body)]">{approachParagraph}</p>
            </div>

            <div className="min-w-0">
              <div className="relative">
                {/* Vertical connector line */}
                <div
                  className="absolute left-4 -translate-x-1/2 top-1 bottom-1 w-px bg-gray-200"
                  aria-hidden="true"
                />

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

                        <h3 className="font-heading text-base sm:text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
                          {step.title}
                        </h3>
                        <p className="subtitle-gap text-sm sm:text-base leading-snug text-[var(--color-text-secondary)]">
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

                        <h3 className="font-heading text-base sm:text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
                          {step.title}
                        </h3>
                        <p className="subtitle-gap text-sm sm:text-base leading-snug text-[var(--color-text-secondary)]">
                          {step.subtitle}
                        </p>
                      </motion.li>
                    ))}
                  </motion.ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

