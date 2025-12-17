'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type TabsOrientation = 'horizontal' | 'vertical'

export interface TabItem {
  value: string
  label: string
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  orientation?: TabsOrientation
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  tabClassName?: string
  tabListClassName?: string
  panelClassName?: string
  panels?: Record<string, React.ReactNode>
}

export function Tabs({
  items,
  orientation = 'horizontal',
  value,
  defaultValue,
  onValueChange,
  className,
  tabClassName,
  tabListClassName,
  panelClassName,
  panels,
}: TabsProps) {
  const fallback = defaultValue ?? items[0]?.value ?? ''
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(fallback)
  const activeValue = value ?? uncontrolledValue

  const activeIndex = useMemo(
    () => Math.max(0, items.findIndex((t) => t.value === activeValue)),
    [items, activeValue]
  )

  const setActive = (next: string) => {
    onValueChange?.(next)
    if (value == null) setUncontrolledValue(next)
  }

  const isVertical = orientation === 'vertical'
  const activePanel = panels?.[items[activeIndex]?.value ?? activeValue]

  return (
    <div className={cn(isVertical ? 'flex gap-4' : 'block', className)}>
      <div
        role="tablist"
        aria-orientation={orientation}
        className={cn(
          isVertical ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2',
          tabListClassName
        )}
      >
        {items.map((tab) => {
          const isActive = tab.value === activeValue
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panels ? `panel-${tab.value}` : undefined}
              disabled={tab.disabled}
              onClick={() => setActive(tab.value)}
              className={cn(
                'font-label rounded-md border px-4 py-2 transition-colors',
                isActive
                  ? 'border-accent text-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
                  : 'border-gray-200 hover:bg-gray-50',
                tab.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : '',
                tabClassName
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {panels ? (
        <div
          id={`panel-${activeValue}`}
          role="tabpanel"
          className={cn(
            'rounded-md border border-gray-200 bg-white p-4 text-sm',
            panelClassName
          )}
        >
          {activePanel}
        </div>
      ) : null}
    </div>
  )
}

