'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Label } from '@/components/ui/Label'

interface HeroProps {
  role: string
}

const defaultBio =
  'I specialize in building scalable systems that turn complexity into acquisition, activation, retention, and revenue.'

/* Intrinsic size for hero collage (4:3) to avoid layout shift */
const HERO_IMAGE_WIDTH = 800
const HERO_IMAGE_HEIGHT = 600

export function Hero({ role }: HeroProps) {
  return (
    <section className="section-spacing-large relative">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="space-before-h1 min-w-0 flex-1 max-w-2xl">
              <Label className="text-accent section-label">ABOUT DAN GUNDERSON</Label>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-1"
              >
                {role}
              </motion.h1>
              <p className="text-base sm:text-lg text-[var(--color-text-body)]">{defaultBio}</p>
            </div>
            <div
              className="relative w-full flex-shrink-0 overflow-visible lg:w-[min(640px,48%)]"
              style={{ aspectRatio: `${HERO_IMAGE_WIDTH} / ${HERO_IMAGE_HEIGHT}` }}
            >
              <Image
                src="/assets/hero-collage.webp"
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

