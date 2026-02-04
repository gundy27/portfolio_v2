'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Code2, FlaskConical, Paintbrush, PieChart, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type SuperpowerItemId =
  | 'curiosity'
  | 'technical-acumen'
  | 'data-driven'
  | 'leadership'
  | 'craftsmanship'

export interface SuperpowerItem {
  id: SuperpowerItemId
  label: string
  /** Angle offset in degrees: 0 = top, 90 = right, 180 = bottom, 270 = left. */
  angleOffset: number
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  description: string
}

export const SUPERPOWERS_ITEMS: SuperpowerItem[] = [
  {
    id: 'curiosity',
    label: 'Curiosity',
    angleOffset: 0,
    icon: FlaskConical,
    description:
      'Dan excels at working with engineering-heavy, technical teams to translate customer signal into focused roadmaps. His systems-first approach drives him to think of the long game. He prefers to run small experiments, conduct discovery, and ensure that the team is focused on the right thing.',
  },
  {
    id: 'technical-acumen',
    label: 'Technical Acumen',
    angleOffset: 72,
    icon: Code2,
    description:
      'Dan combines product strategy with hands-on technical depth. He understands system architecture, APIs, and implementation tradeoffs—enabling him to partner effectively with engineering and ship with confidence.',
  },
  {
    id: 'data-driven',
    label: 'Data',
    angleOffset: 144,
    icon: PieChart,
    description:
      'Dan pairs strong product instincts with clear measurement. He works backward from outcomes, instruments what matters, and uses data to validate bets—without getting stuck chasing vanity metrics.',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    angleOffset: 216,
    icon: UsersRound,
    description:
      'Dan creates clarity in ambiguous environments by aligning stakeholders, making tradeoffs explicit, and keeping teams focused on impact. He builds trust through crisp communication and reliable follow-through.',
  },
  {
    id: 'craftsmanship',
    label: 'Craftsmanship',
    angleOffset: 288,
    icon: Paintbrush,
    description:
      'Dan cares deeply about quality—from UX details to the operational footprint of what ships. He raises the bar with thoughtful docs, clean execution, and a bias toward simple, maintainable solutions.',
  },
]

export interface SuperpowersOrbitProps {
  /** Configurable orbit radius (px). Recommended range: 170–220. */
  orbitRadius?: number
  /** Seconds per full revolution. Recommended: ~18–24. */
  orbitDurationSeconds?: number
  className?: string
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function positionForAngle(radius: number, angleOffset: number) {
  // Spec: angleOffset 0/90/180/270 map to top/right/bottom/left; any angle in degrees is supported.
  // In standard polar coordinates 0deg points right, so we subtract 90deg to make 0deg point up.
  const theta = degToRad(angleOffset - 90)
  return { x: radius * Math.cos(theta), y: radius * Math.sin(theta) }
}

function ShieldMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.75l7 3v6.55c0 5.18-2.95 9.41-7 10.95-4.05-1.54-7-5.77-7-10.95V5.75l7-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 5.35l4.75 2.05v4.86c0 3.57-2.08 6.42-4.75 7.53-2.67-1.11-4.75-3.96-4.75-7.53V7.4L12 5.35z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M12 9.25l1.22 2.55 2.82.39-2.05 1.95.49 2.78L12 15.61l-2.48 1.31.49-2.78-2.05-1.95 2.82-.39L12 9.25z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  )
}

export function SuperpowersOrbit({
  orbitRadius = 190,
  orbitDurationSeconds = 20,
  className,
}: SuperpowersOrbitProps) {
  const shouldReduceMotion = useReducedMotion()

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = React.useState<number | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerSize(entry.contentRect.width)
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Ensure the orbit never causes horizontal scroll on small screens by shrinking the
  // effective radius to fit the available width.
  const fallbackSize = orbitRadius * 2 + 180
  const size = containerSize ?? fallbackSize
  const pillClearance = 88 // approx half-width of a pill + padding
  const effectiveRadius = Math.min(orbitRadius, Math.max(120, size / 2 - pillClearance))
  const orbitDiameter = Math.round(effectiveRadius * 2)

  const orbitTransition = shouldReduceMotion
    ? undefined
    : {
        rotate: {
          duration: orbitDurationSeconds,
          repeat: Infinity,
          // Linear bezier: keeps orbit speed constant.
          ease: [0, 0, 1, 1] as [number, number, number, number],
        },
      }

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={containerRef}
        className={cn(
          'relative mx-auto flex items-center justify-center',
          // Square stage that scales responsively.
          'aspect-square w-full max-w-[36rem] min-h-[22rem] sm:min-h-[26rem]'
        )}
      >
        {/* Optional subtle dotted / graph-paper feel */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(rgba(17,17,17,0.10) 0.5px, transparent 0.5px), radial-gradient(rgba(17,17,17,0.06) 0.5px, transparent 0.5px)',
            backgroundPosition: '0 0, 8px 8px',
            backgroundSize: '16px 16px',
            opacity: 0.35,
          }}
        />

        {/* Thin orbit path */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10"
          aria-hidden="true"
          style={{ width: orbitDiameter, height: orbitDiameter }}
        />

        {/* Center mark */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-[var(--color-accent)]"
          aria-hidden="true"
        >
          <ShieldMark className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
        </div>

        {/* 
          “Stay upright while orbiting” technique:
          - Rotate the entire orbit container continuously.
          - Position each pill at a fixed angle/radius inside that container.
          - Apply an equal and opposite (counter) rotation to each pill wrapper.
          This cancels the container rotation so the pill text stays upright/readable.
        */}
        <motion.div
          className="absolute inset-0"
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={orbitTransition}
        >
          {SUPERPOWERS_ITEMS.map((item) => {
            const { x, y } = positionForAngle(effectiveRadius, item.angleOffset)
            const Icon = item.icon

            return (
              <motion.div
                key={item.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ x, y }}
                animate={shouldReduceMotion ? undefined : { rotate: -360 }}
                transition={orbitTransition}
              >
                <div
                  className={cn(
                    'group inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium',
                    'bg-white/90 backdrop-blur-sm text-[var(--color-text-primary)] shadow-sm',
                    // Explicit: solid black border, no hover/focus animations.
                    'border-black'
                  )}
                >
                  <Icon className="h-4 w-4 text-black/70" aria-hidden={true} />
                  <span>{item.label}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

