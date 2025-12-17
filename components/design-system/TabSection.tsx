import { cn } from '@/lib/utils/cn'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Tabs } from '@/components/ui/Tabs'

const ITEMS = [
  { value: 'one', label: 'Tab One' },
  { value: 'two', label: 'Tab Two' },
  { value: 'three', label: 'Tab Three', disabled: true },
]

const PANELS: Record<string, React.ReactNode> = {
  one: 'This is panel content for Tab One.',
  two: 'This is panel content for Tab Two.',
  three: 'This tab is disabled.',
}

function StaticStateTabs() {
  const base = 'font-label rounded-md border px-4 py-2 transition-colors'
  const inactive = 'border-gray-200 hover:bg-gray-50'
  const active = 'border-accent text-[color:var(--color-accent)] bg-[color:var(--color-accent)]/10'
  const hoverSim = 'border-gray-200 bg-gray-50'

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={cn(base, inactive)} aria-label="Inactive tab">
        Inactive
      </button>
      <button type="button" className={cn(base, hoverSim)} aria-label="Hover tab">
        Hover
      </button>
      <button type="button" className={cn(base, active)} aria-label="Active tab">
        Active
      </button>
    </div>
  )
}

export function TabSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Tabs"
        heading="Horizontal & vertical"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
            Horizontal tabs
          </div>
          <div className="mt-4">
            <Tabs items={ITEMS} panels={PANELS} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
            Vertical tabs
          </div>
          <div className="mt-4">
            <Tabs items={ITEMS} orientation="vertical" panels={PANELS} />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
          States
        </div>
        <div className="mt-4">
          <StaticStateTabs />
        </div>
      </div>
    </section>
  )
}

