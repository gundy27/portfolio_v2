'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'

export function TimelineHeader() {
  const scrollToBottom = () => {
    const el = document.getElementById('timeline-bottom')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="section-spacing-large relative py-12 sm:py-16 lg:py-20">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-before-h1 max-w-2xl"
          >
            <SectionHeader label="CAREER" heading="Timeline" headingLevel="h1" />

            <p className="mt-4 text-base sm:text-lg text-[var(--color-text-body)] max-w-xl">
              Scroll through to see Dan&apos;s career arc highlighting key accomplishments and phases. Scroll down to
              see recent experience, or start from the bottom and work your way up.
            </p>

            <div className="mt-8">
              <Button variant="outline" size="md" onClick={scrollToBottom}>
                <ChevronDown className="mr-2 h-4 w-4" aria-hidden="true" />
                Start at bottom
              </Button>
            </div>
          </motion.div>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
            <Image
              src="/assets/mountain-placeholder.svg"
              alt="Mountain illustration"
              fill
              className="object-contain p-8 sm:p-10"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

