'use client'

import { ResourceRow } from './ResourceRow'
import type { Resource } from '@/lib/content/types'

interface ResourcesTableProps {
  resources: Resource[]
  onRatingChange: (id: string, delta: number) => void
  onRowSelect?: (id: string) => void
  selectedId?: string | null
}

export function ResourcesTable({
  resources,
  onRatingChange,
  onRowSelect,
  selectedId,
}: ResourcesTableProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-16 text-secondary">
        <p>No resources yet. Add resources to the content directory.</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            onRatingChange={onRatingChange}
            onSelect={onRowSelect}
            isSelected={selectedId === resource.id}
          />
        ))}
      </div>
    </div>
  )
}

