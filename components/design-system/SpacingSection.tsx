import { SectionHeader } from '@/components/ui/SectionHeader'

type SpacingToken = {
  label: string
  px: number
}

const SPACING: SpacingToken[] = [
  { label: 'Space XS', px: 6 },
  { label: 'Space S', px: 8 },
  { label: 'Space M', px: 16 },
  { label: 'Space L', px: 24 },
  { label: 'Space XL', px: 40 },
  { label: 'Space 2XL', px: 60 },
]

function SpacingCard({ token }: { token: SpacingToken }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-label text-[color:var(--color-text-secondary)]">
          {token.label}
        </div>
        <div className="font-mono text-xs text-gray-500">{token.px}px</div>
      </div>

      <div className="mt-3" aria-hidden="true">
        <div className="h-2 w-full rounded bg-gray-200" />
        <div style={{ height: token.px }} />
        <div className="h-2 w-full rounded bg-gray-200" />
      </div>
    </div>
  )
}

export function SpacingSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Spacing"
        heading="Scale"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {SPACING.map((token) => (
          <SpacingCard key={token.label} token={token} />
        ))}
      </div>
    </section>
  )
}

