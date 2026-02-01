'use client'

import type { ProjectMetric } from '@/lib/content/types'
import { CounterCard } from '@/components/ui/CounterCard'
import { cn } from '@/lib/utils/cn'

export interface MetricsRowProps {
  metrics: ProjectMetric[]
  className?: string
}

function formatMetricValue(value: number, format?: string) {
  const number = Number.isFinite(value) ? value : 0
  const formattedNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number)
  if (!format) return formattedNumber
  return format.replaceAll('{}', formattedNumber)
}

export function MetricsRow({ metrics, className }: MetricsRowProps) {
  if (!metrics.length) return null

  return (
    <div className={cn('grid gap-6 sm:grid-cols-3', className)}>
      {metrics.slice(0, 3).map((metric, idx) => {
        return (
          <CounterCard
            key={`${idx}-${metric.label}`}
            start={0}
            stop={metric.value}
            label={metric.label}
            format={(v) => formatMetricValue(v, metric.format)}
          />
        )
      })}
    </div>
  )
}

