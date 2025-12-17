'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Resource } from '@/lib/content/types'
import { Button } from '@/components/ui/Button'

interface ResourceRowProps {
  resource: Resource
  onRatingChange: (id: string, delta: number) => void
  onSelect?: (id: string) => void
  isSelected?: boolean
}

export function ResourceRow({ resource, onRatingChange, onSelect, isSelected }: ResourceRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'border-b border-gray-200 py-4 px-4 sm:px-6 transition-colors',
        onSelect ? 'cursor-pointer hover:bg-gray-50' : '',
        isSelected ? 'bg-gray-50' : '',
      ].join(' ')}
      onClick={() => onSelect?.(resource.id)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onSelect) return
        if (e.key === 'Enter' || e.key === ' ') onSelect(resource.id)
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4">
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="font-heading text-base sm:text-lg font-semibold text-primary">
              {resource.title}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="self-start sm:self-auto"
            >
              {isExpanded ? 'COLLAPSE' : 'EXPAND'}
            </Button>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="text-body mb-4 text-sm sm:text-base">{resource.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isExpanded && (
            <p className="text-body text-sm line-clamp-2">{resource.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-4 sm:pt-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRatingChange(resource.id, -1)
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Decrease rating"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Decrease rating</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className="font-heading text-base sm:text-lg font-semibold text-primary min-w-[2.5rem] sm:min-w-[3rem] text-center">
              {resource.rating >= 0 ? '+' : ''}{resource.rating}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRatingChange(resource.id, 1)
              }}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Increase rating"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Increase rating</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

