import { SectionHeader } from '@/components/ui/SectionHeader'

export function TypographySection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Typography"
        heading="Type scale"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 space-y-6">
        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Headline 1</div>
          <h1 className="!mb-0">Space Grotesk / 600</h1>
          <div className="text-sm text-gray-500">H1 32px → 40px → 48px</div>
        </div>

        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Headline 2</div>
          <h2 className="!mb-0">Space Grotesk / 600</h2>
          <div className="text-sm text-gray-500">H2 24px → 28px → 32px</div>
        </div>

        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Headline 3</div>
          <h3 className="!mb-0">Space Grotesk / 500</h3>
          <div className="text-sm text-gray-500">H3 20px → 22px → 24px</div>
        </div>

        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Headline 4</div>
          <h4 className="!mb-0">Space Grotesk / 500</h4>
          <div className="text-sm text-gray-500">H4 18px → 19px → 20px</div>
        </div>

        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Paragraph</div>
          <p className="!mb-2">
            Body text uses Poppins at 16–17px with a 150–165% line-height. Keep
            it extremely readable and airy.
          </p>
          <small className="text-small">
            Small body is 14px for captions, footnotes, and metadata.
          </small>
        </div>

        <div>
          <div className="font-label text-[color:var(--color-text-secondary)]">Labels / Buttons</div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label text-[color:var(--color-text-secondary)]">Default Label</span>
            <span className="font-label text-[color:var(--color-accent)]">Accent Label</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Lexend Exa / 600 / 12–13px / ALL CAPS / +6–10% letter-spacing
          </div>
        </div>
      </div>
    </section>
  )
}

