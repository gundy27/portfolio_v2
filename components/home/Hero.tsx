'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils/cn'
import { HERO_ROLE } from '@/components/layout/Header'

const defaultBio =
  'I build and scale product systems that turn ambiguous problems into simple, intuitive experiences that drive business growth.'

/* Intrinsic size for hero collage (4:3) to avoid layout shift */
const HERO_IMAGE_WIDTH = 800
const HERO_IMAGE_HEIGHT = 600

export function Hero() {
  return (
    <section className="section-spacing-large relative">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="mt-8 sm:mt-10 lg:mt-0 min-w-0 flex-1 max-w-2xl">
              <Label className="text-accent section-label">PRODUCT & GROWTH LEADER</Label>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-1 whitespace-pre-line"
              >
                {HERO_ROLE}
              </motion.h1>
              
              <div className="mt-2 border-t border-gray-200/80 pt-3">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                  <div className="min-w-0">
                    <div className="font-heading text-base sm:text-lg font-semibold leading-none text-[var(--color-text-primary)]">
                      7 Years
                    </div>
                    <div className="mt-1 font-label text-[10px] sm:text-xs uppercase tracking-[0.08em] text-secondary/70">
                      EXPERIENCE
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-heading text-base sm:text-lg font-semibold leading-none text-[var(--color-text-primary)]">
                      $27M+
                    </div>
                    <div className="mt-1 font-label text-[10px] sm:text-xs uppercase tracking-[0.08em] text-secondary/70">
                      REVENUE IMPACTED
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-heading text-base sm:text-lg font-semibold leading-none text-[var(--color-text-primary)]">
                      3X
                    </div>
                    <div className="mt-1 font-label text-[10px] sm:text-xs uppercase tracking-[0.08em] text-secondary/70">
                      CONVERSION RATE BOOST
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-heading text-base sm:text-lg font-semibold leading-none text-[var(--color-text-primary)]">
                      90%
                    </div>
                    <div className="mt-1 font-label text-[10px] sm:text-xs uppercase tracking-[0.08em] text-secondary/70">
                      TRIAL ACTIVATION
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-base sm:text-lg text-[var(--color-text-body)]">{defaultBio}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=dan@gundy.io&su=Intro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-dark)] px-6 py-3 text-sm font-label font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:text-gray-300'
                  )}
                >
                  <Send className="h-4 w-4" aria-hidden />
                  GET IN TOUCH
                </a>

                <a
                  href="/resume"
                  className={cn(
                    'inline-flex items-center justify-center rounded-md px-6 py-3 text-xs transition-colors',
                    'font-label font-semibold uppercase tracking-[0.08em]',
                    'text-secondary hover:text-accent'
                  )}
                >
                  DOWNLOAD RESUME
                </a>
              </div>
            </div>
            <div
              className="relative w-full flex-shrink-0 overflow-visible lg:w-[min(640px,48%)]"
              style={{ aspectRatio: `${HERO_IMAGE_WIDTH} / ${HERO_IMAGE_HEIGHT}` }}
            >
              <Image
                src="/assets/hero-image-v4.png"
                alt=""
                width={HERO_IMAGE_WIDTH}
                height={HERO_IMAGE_HEIGHT}
                sizes="(max-width: 1023px) 100vw, min(640px, 48vw)"
                className="size-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

