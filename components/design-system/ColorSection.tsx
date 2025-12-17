import { SectionHeader } from '@/components/ui/SectionHeader'

type ColorToken = {
  name: string
  cssVar: string
  hex: string
  usage: string
}

const COLORS: ColorToken[] = [
  {
    name: 'Text / Primary',
    cssVar: '--color-text-primary',
    hex: '#111111',
    usage: 'Headings',
  },
  {
    name: 'Text / Body',
    cssVar: '--color-text-body',
    hex: '#2C2C2C',
    usage: 'Body text',
  },
  {
    name: 'Text / Body Alt',
    cssVar: '--color-text-body-alt',
    hex: '#333333',
    usage: 'Alternate body',
  },
  {
    name: 'Text / Secondary',
    cssVar: '--color-text-secondary',
    hex: '#6A6A6A',
    usage: 'Labels, metadata',
  },
  {
    name: 'Background / Primary',
    cssVar: '--color-bg-primary',
    hex: '#FAFAFA',
    usage: 'Page background',
  },
  {
    name: 'Background / White',
    cssVar: '--color-bg-white',
    hex: '#FFFFFF',
    usage: 'Cards, surfaces',
  },
  {
    name: 'Accent',
    cssVar: '--color-accent',
    hex: '#4A67FF',
    usage: 'Buttons, section labels',
  },
]

function ColorSwatch({ token }: { token: ColorToken }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div
        className="h-10 w-full rounded-md border border-gray-200"
        style={{ backgroundColor: `var(${token.cssVar})` }}
        role="img"
        aria-label={`${token.name} swatch`}
      />
      <div className="mt-3">
        <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
          {token.name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="font-mono">{token.hex}</span>
          <span className="font-mono">{token.cssVar}</span>
        </div>
        <div className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          {token.usage}
        </div>
      </div>
    </div>
  )
}

export function ColorSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Color"
        heading="Palette"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {COLORS.map((token) => (
          <ColorSwatch key={token.cssVar} token={token} />
        ))}
      </div>
    </section>
  )
}

