'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Edit this to change the Hero title text on the homepage.
export const HERO_ROLE = 'Ship Business Outcomes,\nNot Features'

export function Header() {
  const [opacity, setOpacity] = useState(1)

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
        </div>
      </nav>
    </motion.header>
  )
}

