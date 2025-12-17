'use client'

import { useMemo, useState } from 'react'
import { ResourcesHeader } from '@/components/resources/ResourcesHeader'
import { ResourcesTable } from '@/components/resources/ResourcesTable'
import { ResourcePreview } from '@/components/resources/ResourcePreview'
import type { Resource } from '@/lib/content/types'

interface ResourcesPageClientProps {
  initialResources: Resource[]
}

export function ResourcesPageClient({ initialResources }: ResourcesPageClientProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources)

  const initialSelectedId = initialResources[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)

  const selectedResource = useMemo(() => {
    if (!selectedId) return null
    return resources.find((r) => r.id === selectedId) ?? null
  }, [resources, selectedId])

  const handleRatingChange = (id: string, delta: number) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, rating: r.rating + delta } : r)))
  }

  const handleDownload = (id: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, downloads: r.downloads + 1 } : r)))

    const resource = resources.find((r) => r.id === id)
    if (resource) {
      const link = document.createElement('a')
      link.href = resource.file
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <ResourcesHeader />

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12 lg:mt-16">
        <div className="lg:col-span-2">
          <ResourcesTable
            resources={resources}
            onRatingChange={handleRatingChange}
            onRowSelect={(id) => setSelectedId(id)}
            selectedId={selectedId}
          />
        </div>

        <div className="mt-8 lg:mt-0">
          <ResourcePreview resource={selectedResource} onDownload={handleDownload} />
        </div>
      </div>
    </div>
  )
}

