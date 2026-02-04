'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from '@/components/ui/Label'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [opacity, setOpacity] = useState(1)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  const onResumeClick = () => {
    try {
      const payload = JSON.stringify({ event: 'resume_download_click', ts: Date.now() })
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        // Fire-and-forget client breadcrumb (server-side audit logging happens on /resume).
        navigator.sendBeacon('/api/audit', payload)
      } else {
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Fade navbar as user scrolls down
          // Start fading after 200px, fully faded by 600px
          const fadeStart = 200
          const fadeEnd = 600
          
          if (currentScrollY < fadeStart) {
            setOpacity(1)
          } else if (currentScrollY > fadeEnd) {
            setOpacity(0) // Completely hidden
          } else {
            // Linear fade between fadeStart and fadeEnd
            const fadeRange = fadeEnd - fadeStart
            const scrollProgress = currentScrollY - fadeStart
            const newOpacity = 1 - (scrollProgress / fadeRange) // Fade from 1 to 0
            setOpacity(newOpacity)
          }
          
          ticking = false
        })
        
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      style={{ opacity, pointerEvents: opacity === 0 ? 'none' : 'auto' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 navbar-gradient border-b border-gray-200/50"
    >
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-heading text-xl font-semibold text-primary">
            gundy.io
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/resume" onClick={onResumeClick} className="inline-flex items-center">
              <Label>RESUME</Label>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="md:hidden p-2 -mr-2 text-primary hover:text-accent transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Menu icon</title>
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-200"
            >
              <div className="flex flex-col py-4 gap-4">
                <a
                  href="/resume"
                  onClick={() => {
                    onResumeClick()
                    closeMenu()
                  }}
                  className="px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Label>RESUME</Label>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

