import Image from 'next/image'
import { SectionHeader } from '@/components/ui/SectionHeader'

const SUPERPOWERS_IMAGE_WIDTH = 1536
const SUPERPOWERS_IMAGE_HEIGHT = 1024

export function Strengths() {
  return (
    <section className="section-spacing-large">
      <div className="floating-section">
        <div className="floating-section__content">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div
              className="relative w-full"
              style={{ aspectRatio: `${SUPERPOWERS_IMAGE_WIDTH} / ${SUPERPOWERS_IMAGE_HEIGHT}` }}
            >
              <Image
                src="/assets/superpowers.png"
                alt=""
                width={SUPERPOWERS_IMAGE_WIDTH}
                height={SUPERPOWERS_IMAGE_HEIGHT}
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="size-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <SectionHeader label="PRODUCT MANAGER" heading="Superpowers" headingLevel="h2" />
              <p className="text-base sm:text-lg text-[var(--color-text-body)]">
                Dan excels at working with engineering-heavy, technical teams to translate customer signal
                into focused roadmaps. His systems-first approach drives him to think of the long game. He
                prefers to run small experiments, conduct discovery, and ensure that the team is focused on
                the right thing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

