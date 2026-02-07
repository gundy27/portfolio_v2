import type { Metadata } from 'next'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { FeaturedWorkCard } from '@/components/ui/FeaturedWorkCard'
import { CounterCard } from '@/components/ui/CounterCard'
import { EndorsementCard } from '@/components/ui/EndorsementCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TwoColumnSection } from '@/components/ui/TwoColumnSection'
import { ContentCardSection } from '@/components/ui/ContentCardSection'
import { FullWidthSection } from '@/components/ui/FullWidthSection'
import { HighlightSection } from '@/components/ui/HighlightSection'
import { BulletList } from '@/components/ui/BulletList'
import { ChecklistItem } from '@/components/ui/ChecklistItem'
import { Header } from '@/components/layout/Header'
import type { Endorsement } from '@/lib/content/types'

export const metadata: Metadata = {
  title: 'Design System | Dan Gunderson',
  description: 'Design system and component library for Dan Gunderson\'s portfolio',
}

function BlockHeader({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Label className="text-secondary">{children}</Label>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}

function ColorRow({
  name,
  value,
  color,
}: {
  name: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-8 w-8 rounded border border-gray-200"
        style={{ backgroundColor: color }}
      />
      <div className="leading-tight">
        <p className="text-sm text-primary">{name}</p>
        <p className="text-xs text-secondary">{value}</p>
      </div>
    </div>
  )
}

function SpacingRow({ label, widthClass }: { label: string; widthClass: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-secondary">{label}</p>
      <div className="flex items-center justify-end gap-3">
        <div className="h-2 w-2 rounded border border-gray-300" />
        <div className={`h-px bg-gray-300 ${widthClass}`} />
      </div>
    </div>
  )
}

function DemoInput({
  label,
  placeholder,
  state = 'default',
  helper,
}: {
  label: string
  placeholder?: string
  state?: 'default' | 'focus' | 'error'
  helper?: string
}) {
  const base =
    'w-full rounded-md border bg-white px-3 py-2 text-sm text-primary placeholder:text-secondary/60 outline-none transition-colors'
  const stateClasses =
    state === 'focus'
      ? 'border-accent ring-1 ring-accent'
      : state === 'error'
        ? 'border-red-300 ring-1 ring-red-200'
        : 'border-gray-200'

  return (
    <div className="space-y-1">
      <Label className="block">{label}</Label>
      <input className={`${base} ${stateClasses}`} placeholder={placeholder} />
      {helper ? (
        <p className={state === 'error' ? 'text-xs text-red-600' : 'text-xs text-secondary'}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}

function Tag({
  children,
  active,
}: {
  children: string
  active?: boolean
}) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center rounded-full border border-accent bg-accent/10 px-3 py-1 font-label text-xs text-accent'
          : 'inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-label text-xs text-secondary'
      }
    >
      {children}
    </span>
  )
}

export default function DesignSystemPage() {
  const sampleEndorsement: Endorsement = {
    id: 'design-system-endorsement',
    name: 'Sample Name',
    role: 'Role, Company',
    quote: 'A short endorsement quote to preview typography, spacing, and layout.',
    pills: ['UX Design', 'Product Strategy', 'Execution'],
    linkedinUrl: '',
    avatarUrl: '',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container-wide pt-24 pb-16">
          {/* Page Header */}
          <div className="mb-16 max-w-3xl">
            <Label variant="accent" className="mb-4">
              DESIGN SYSTEM
            </Label>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-primary mb-6">
              Component Library
            </h1>
            <p className="text-secondary text-lg">
              A visual reference for typography, colors, spacing, and key UI patterns — built with
              the site&apos;s real tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Typography */}
          <section className="lg:col-span-1">
            <BlockHeader>TYPOGRAPHY</BlockHeader>
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-primary leading-tight">
                  Headline 1
                </h2>
                <p className="text-xs text-secondary">H1 — Space Grotesk 600</p>
              </div>
              <div>
                <h3 className="font-heading text-2xl font-normal text-primary leading-tight">
                  Headline 2
                </h3>
                <p className="text-xs text-secondary">H2 — Space Grotesk 600</p>
              </div>
              <div>
                <h4 className="font-heading text-xl font-medium text-primary leading-tight">
                  Headline 3
                </h4>
                <p className="text-xs text-secondary">H3 — Space Grotesk 500</p>
              </div>
              <div>
                <p className="font-heading text-lg font-medium text-primary leading-tight">
                  Headline 4
                </p>
                <p className="text-xs text-secondary">H4 — Space Grotesk 500</p>
              </div>
              <div>
                <p className="font-body text-base font-medium text-primary leading-tight">
                  Headline 5
                </p>
                <p className="text-xs text-secondary">H5 — Poppins 500</p>
              </div>
              <div className="pt-2">
                <p className="text-sm text-primary">
                  Body text uses Poppins for high readability across long-form case studies.
                </p>
                <p className="text-xs text-secondary">Body — Poppins 400 (16–17px, 150–165%)</p>
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="lg:col-span-1">
            <BlockHeader>COLOR</BlockHeader>
            <div className="space-y-4">
              <ColorRow name="Primary" value="#111111" color="#111111" />
              <ColorRow name="Body" value="#2C2C2C" color="#2C2C2C" />
              <ColorRow name="Secondary" value="#6A6A6A" color="#6A6A6A" />
              <ColorRow name="Accent" value="#598392" color="#598392" />
              <ColorRow name="Accent (dark)" value="#3c5862" color="#3c5862" />
              <ColorRow name="Background" value="#FAFAFA" color="#FAFAFA" />
              <ColorRow name="White" value="#FFFFFF" color="#FFFFFF" />
            </div>
          </section>

          {/* Spacing */}
          <section className="lg:col-span-1">
            <BlockHeader>SPACING</BlockHeader>
            <div className="space-y-4">
              <SpacingRow label="2x – 4x" widthClass="w-10" />
              <SpacingRow label="4x – 6x" widthClass="w-14" />
              <SpacingRow label="16px – 9" widthClass="w-20" />
              <SpacingRow label="24px – 16" widthClass="w-24" />
              <SpacingRow label="36px – 16x" widthClass="w-32" />
              <SpacingRow label="48px – 24x" widthClass="w-40" />
              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-secondary font-medium mb-2">Special tokens</p>
                <SpacingRow label="4px – subtitle-gap" widthClass="w-4" />
              </div>
              <div className="pt-3">
                <p className="text-xs text-secondary">
                  Major sections: 64–80px. Subsections: 40–56px. Text blocks: 620–720px max.
                </p>
              </div>
            </div>
          </section>

          {/* Sign Up mock panel (spans rows on desktop) */}
          <aside className="lg:col-span-1 lg:row-span-2">
            <div className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div className="mx-auto max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-heading text-xl font-normal text-primary">Sign Up</h3>
                </div>

                <form className="space-y-4">
                  <DemoInput label="Full Name" placeholder="Jane Doe" />
                  <DemoInput label="Email" placeholder="jane@company.com" />
                  <DemoInput label="Create Password" placeholder="••••••••" state="focus" />

                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <p className="text-xs text-secondary leading-relaxed">
                      I agree to the terms and privacy policy.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="primary" className="w-full">
                      Sign Up
                    </Button>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </aside>

          {/* Buttons */}
          <section className="lg:col-span-1">
            <BlockHeader>BUTTONS</BlockHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Button variant="primary" className="min-w-[140px]">
                  Primary
                </Button>
                <p className="text-xs text-secondary">Default</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Button variant="primary" className="min-w-[140px] opacity-90">
                  Primary
                </Button>
                <p className="text-xs text-secondary">Hover</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Button variant="primary" className="min-w-[140px] opacity-50" disabled>
                  Primary
                </Button>
                <p className="text-xs text-secondary">Disabled</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" className="min-w-[140px]">
                  Outline
                </Button>
                <p className="text-xs text-secondary">Default</p>
              </div>
            </div>
          </section>

          {/* Forms */}
          <section className="lg:col-span-1">
            <BlockHeader>FORMS</BlockHeader>
            <div className="space-y-5">
              <DemoInput label="Label" placeholder="Input value" />
              <DemoInput label="Label" placeholder="Focused input" state="focus" />
              <DemoInput label="Label" placeholder="Invalid input" state="error" helper="This field is required." />

              <div className="space-y-2">
                <Label className="block">Dropdown</Label>
                <select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-primary outline-none">
                  <option>Option one</option>
                  <option>Option two</option>
                  <option>Option three</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <p className="text-sm text-secondary">Checkbox</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="radio-demo"
                    className="h-4 w-4"
                    style={{ accentColor: 'var(--color-accent)' }}
                    defaultChecked
                  />
                  <p className="text-sm text-secondary">Radio</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="lg:col-span-1">
            <BlockHeader>TAGS</BlockHeader>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Tag active>Tab One</Tag>
                <Tag>Tab Two</Tag>
                <Tag>Tab Three</Tag>
              </div>

              <div className="space-y-2">
                <Label className="block">Horizontal tags</Label>
                <div className="flex flex-wrap gap-2">
                  <Tag>Strategy</Tag>
                  <Tag>Analytics</Tag>
                  <Tag active>Product</Tag>
                  <Tag>Design</Tag>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block">Vertical labels</Label>
                <div className="flex flex-col gap-2">
                  <Tag active>Top One</Tag>
                  <Tag>Top Two</Tag>
                  <Tag>Top Three</Tag>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="section-spacing-large">
          <BlockHeader>CARDS</BlockHeader>
          <div className="floating-section">
            <div className="floating-section__content">
              <div className="space-y-10">
                <BlockHeader>LAYOUT PRIMITIVES</BlockHeader>

                <div className="space-y-6">
                  <BlockHeader>TWO COLUMN SECTION</BlockHeader>
                  <TwoColumnSection
                    image="/assets/projects/placeholder.svg"
                    imageAlt="Placeholder"
                    imagePosition="left"
                    contentClassName="text-block"
                  >
                    <div className="space-y-6">
                      <SectionHeader label="BUSINESS" heading="Impact Up Front" />
                      <BulletList
                        items={[
                          'A bullet list that fits a two-column layout',
                          'Use imagePosition to swap left/right',
                          'Optimized for responsive stacking on mobile',
                        ]}
                      />
                    </div>
                  </TwoColumnSection>
                </div>

                <div className="space-y-6">
                  <BlockHeader>CONTENT CARD SECTION</BlockHeader>
                  <ContentCardSection image="/assets/projects/placeholder.svg" imageAlt="Placeholder" imagePosition="left">
                    <div className="space-y-6">
                      <SectionHeader label="PRODUCT" heading="Content-only Card" />
                      <p className="text-body">
                        Use this pattern when the media should float on the page background, while the text sits in a
                        solid white card for readability.
                      </p>
                      <BulletList
                        items={[
                          'Text content is wrapped in a white card',
                          'Media gets a drop shadow for depth',
                          'Transparent section background (no full-width card)',
                        ]}
                      />
                    </div>
                  </ContentCardSection>
                </div>

                <div className="space-y-6">
                  <BlockHeader>FULL WIDTH SECTION</BlockHeader>
                  <FullWidthSection width="wide">
                    <div className="space-y-6">
                      <SectionHeader label="THE" heading="Approach" />
                      <p className="text-body">
                        A centered, readable text block wrapper for long-form content. Use it for sections where the
                        content should not compete with imagery.
                      </p>
                    </div>
                  </FullWidthSection>
                </div>

                <div className="space-y-6">
                  <BlockHeader>HIGHLIGHT SECTION</BlockHeader>
                  <HighlightSection
                    bottomLine={
                      <p className="m-0">
                        Summarize the single most important outcome in one sentence, so the reader remembers the
                        impact.
                      </p>
                    }
                  >
                    <div className="space-y-6">
                      <SectionHeader
                        label="RESULTS"
                        heading="Insights"
                        headingLevel="h1"
                        className="text-white"
                        labelClassName="text-accent-light"
                        headingClassName="text-white"
                      />
                      <div className="space-y-3">
                        <ChecklistItem iconClassName="text-white">Achieved XYZ</ChecklistItem>
                        <ChecklistItem iconClassName="text-white">Improved ABC</ChecklistItem>
                        <ChecklistItem iconClassName="text-white">Reduced time-to-value</ChecklistItem>
                      </div>
                    </div>
                  </HighlightSection>
                </div>

                <div className="space-y-6">
                  <BlockHeader>FLOATING SECTION VARIANTS</BlockHeader>
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-3">
                      <Label className="block">Default</Label>
                      <div className="floating-section">
                        <div className="floating-section__content">
                          <p className="m-0 text-sm text-secondary">
                            White-ish background + drop shadow
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="block">Transparent</Label>
                      <div className="floating-section floating-section--transparent">
                        <div className="floating-section__content">
                          <p className="m-0 text-sm text-secondary">
                            No background, no shadow (content sits on page)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="block">Gray Tint</Label>
                      <div className="floating-section floating-section--gray">
                        <div className="floating-section__content">
                          <p className="m-0 text-sm text-secondary">
                            Subtle gray tint + drop shadow
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <BlockHeader>WORK ITEM CARD</BlockHeader>
                <FeaturedWorkCard
                  label="GROWTH & ONBOARDING"
                  title="Self Service Trial"
                  description="Re-imagined self-service experience to drive 3X boost in product-led sales conversions."
                  skills={[
                    'Sign Up Flow UI/UX',
                    'Authentication',
                    'Provisioning',
                    'Experimentation',
                    'Feature Access',
                  ]}
                />

                <div className="pt-2">
                  <BlockHeader>COUNTER CARD</BlockHeader>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <CounterCard start={0} stop={99} label="REVENUE IMPACTED" />
                    <CounterCard start={0} stop={12} label="FEATURES DELIVERED" />
                    <CounterCard start={0} stop={48} label="EXPERIMENTS RUN" />
                  </div>
                </div>

                <div className="pt-2">
                  <BlockHeader>COUNTER CARD (dark-accent variant)</BlockHeader>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <CounterCard variant="dark-accent" start={0} stop={99} label="REVENUE IMPACTED" />
                    <CounterCard variant="dark-accent" start={0} stop={12} label="FEATURES DELIVERED" />
                    <CounterCard variant="dark-accent" start={0} stop={48} label="EXPERIMENTS RUN" />
                  </div>
                </div>

                <div className="pt-2">
                  <BlockHeader>TESTIMONIAL CARD</BlockHeader>
                  <EndorsementCard endorsement={sampleEndorsement} />
                </div>

                <div className="pt-2">
                  <BlockHeader>TESTIMONIAL MARQUEE CONTAINER</BlockHeader>
                  <section
                    className="overflow-x-auto select-none touch-pan-y scrollbar-hide"
                    style={{
                      scrollbarWidth: 'none', /* Firefox */
                      msOverflowStyle: 'none', /* IE/Edge */
                    }}
                    aria-label="Endorsements carousel container (placeholder)"
                  >
                    <div className="flex w-max gap-6">
                      <EndorsementCard endorsement={sampleEndorsement} />
                      <EndorsementCard
                        endorsement={{
                          ...sampleEndorsement,
                          id: 'design-system-endorsement-2',
                          name: 'Second Sample',
                          pills: ['Communication', 'Collaboration'],
                        }}
                      />
                      <EndorsementCard
                        endorsement={{
                          ...sampleEndorsement,
                          id: 'design-system-endorsement-3',
                          name: 'Third Sample',
                          pills: ['Leadership', 'Systems Thinking'],
                        }}
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>
    </div>
  )
}
