import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'

type ButtonVariant = 'primary' | 'secondary' | 'outline'

const VARIANTS: { variant: ButtonVariant; label: string }[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'outline', label: 'Alternative' },
]

function ButtonStateRow({
  stateLabel,
  children,
}: {
  stateLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-3">
      <div className="font-label text-[color:var(--color-text-secondary)]">
        {stateLabel}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function ButtonSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Buttons"
        heading="Variants & states"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {VARIANTS.map(({ variant, label }) => (
          <div key={variant} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
              {label}
            </div>

            <div className="mt-4 space-y-3">
              <ButtonStateRow stateLabel="Default">
                <Button variant={variant}>Button</Button>
              </ButtonStateRow>

              <ButtonStateRow stateLabel="Hover">
                <Button
                  variant={variant}
                  className={
                    variant === 'primary'
                      ? 'opacity-90'
                      : 'bg-[color:var(--color-accent)]/10'
                  }
                >
                  Button
                </Button>
              </ButtonStateRow>

              <ButtonStateRow stateLabel="Disabled">
                <Button variant={variant} disabled className="opacity-50 cursor-not-allowed">
                  Button
                </Button>
              </ButtonStateRow>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

