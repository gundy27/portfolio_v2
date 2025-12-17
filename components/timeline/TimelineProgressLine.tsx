'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { TimelineEvent } from '@/lib/content/types'

interface TimelineProgressLineProps {
  events: TimelineEvent[]
  activeIndex: number
  containerRef: React.RefObject<HTMLDivElement | null>
  isDesktopSnap?: boolean
}

export function TimelineProgressLine({
  events,
  activeIndex,
  containerRef,
}: TimelineProgressLineProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [leftOffsetPx, setLeftOffsetPx] = useState<number>(0)

  const { scrollYProgress } = useScroll({
    container: containerRef,
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const activeColor = useMemo(() => {
    const fallback = '#4A67FF'
    if (!events.length) return fallback
    return events[Math.max(0, Math.min(activeIndex, events.length - 1))]?.color ?? fallback
  }, [events, activeIndex])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const compute = () => {
      const w = window.innerWidth

      const padding =
        w >= 1536 ? 96 :
        w >= 1280 ? 64 :
        w >= 1024 ? 48 :
        w >= 640 ? 24 :
        16

      const containerMax = 1600
      const gutter = Math.max(0, (w - containerMax) / 2)
      setLeftOffsetPx(gutter + padding)
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [isMounted])

  if (!isMounted || events.length === 0) return null

  return (
    <>
      {/* Desktop: Left-side progress line + labels */}
      <div
        className="hidden lg:block fixed top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: leftOffsetPx }}
      >
        <div className="relative h-full">
          {/* Background dotted line */}
          <div
            className="absolute top-24 bottom-24 w-[2px] opacity-70"
            style={{
              left: 0,
              backgroundImage:
                'linear-gradient(to bottom, #D1D5DB 0, #D1D5DB 50%, transparent 50%, transparent 100%)',
              backgroundSize: '2px 12px',
              backgroundRepeat: 'repeat-y',
            }}
          />

          {/* Progress line */}
          <motion.div
            className="absolute top-24 w-[2px] origin-top"
            style={{ left: 0, height: lineHeight, backgroundColor: activeColor }}
          />

          {/* Current position dot (at end of filled line) */}
          <motion.div
            className="absolute w-3 h-3 rounded-full border-2 shadow-sm"
            style={{
              left: 0,
              top: lineHeight,
              backgroundColor: activeColor,
              borderColor: activeColor,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Event dots + year labels */}
          <div className="absolute top-24 bottom-24 flex flex-col justify-between" style={{ left: 0 }}>
            {events.map((event, index) => {
              const isCompleted = index < activeIndex
              const isActive = index === activeIndex
              const eventColor = event.color ?? '#4A67FF'

              return (
                <motion.div
                  key={event.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex items-center"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted || isActive ? eventColor : '#FFFFFF',
                      borderColor: isCompleted || isActive ? eventColor : '#9CA3AF',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-3.5 h-3.5 rounded-full border-2 -translate-x-1/2"
                  />

                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2"
                      style={{ backgroundColor: eventColor }}
                    />
                  )}

                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className="ml-4 whitespace-nowrap text-xs font-label uppercase tracking-wider"
                    style={{ color: isActive ? eventColor : '#6A6A6A' }}
                  >
                    {event.startDate.split('-')[0]}
                  </motion.span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Left-side progress line */}
      <div className="lg:hidden fixed left-4 sm:left-6 top-24 bottom-24 z-20 pointer-events-none">
        <div className="relative h-full">
          <div
            className="absolute top-0 bottom-0 w-[2px] opacity-70"
            style={{
              left: 0,
              backgroundImage:
                'linear-gradient(to bottom, #D1D5DB 0, #D1D5DB 50%, transparent 50%, transparent 100%)',
              backgroundSize: '2px 12px',
              backgroundRepeat: 'repeat-y',
            }}
          />

          <motion.div
            className="absolute top-0 w-[2px] origin-top"
            style={{ left: 0, height: lineHeight, backgroundColor: activeColor }}
          />

          <motion.div
            className="absolute w-3 h-3 rounded-full border-2 shadow-sm"
            style={{
              left: 0,
              top: lineHeight,
              backgroundColor: activeColor,
              borderColor: activeColor,
              transform: 'translate(-50%, -50%)',
            }}
          />

          <div className="absolute top-0 bottom-0 flex flex-col justify-between" style={{ left: 0 }}>
            {events.map((event, index) => {
              const isCompleted = index < activeIndex
              const isActive = index === activeIndex
              const eventColor = event.color ?? '#4A67FF'

              return (
                <motion.div
                  key={event.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex items-center"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted || isActive ? eventColor : '#FFFFFF',
                      borderColor: isCompleted || isActive ? eventColor : '#9CA3AF',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-3 h-3 rounded-full border-2 -translate-x-1/2"
                  />

                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 w-3 h-3 rounded-full -translate-x-1/2"
                      style={{ backgroundColor: eventColor }}
                    />
                  )}

                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.08 }}
                    className="ml-3 whitespace-nowrap text-[10px] font-label uppercase tracking-wider"
                    style={{ color: isActive ? eventColor : '#6A6A6A' }}
                  >
                    {event.startDate.split('-')[0]}
                  </motion.span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

