import { SectionHeader } from '@/components/ui/SectionHeader'
import { ContentCardSection } from '@/components/ui/ContentCardSection'
import { SuperpowersOrbit } from '@/components/ui/SuperpowersOrbit'

export function Strengths() {
  return (
    <ContentCardSection
      imagePosition="left"
      media={
        <SuperpowersOrbit orbitRadius={185} orbitDurationSeconds={20} />
      }
    >
      <div className="space-y-4">
        <SectionHeader label="PRODUCT MANAGER" heading="Superpowers" headingLevel="h2" />
        <p className="text-base sm:text-lg text-[var(--color-text-body)]">
        My superpowers help me turn noisy, ambiguous customer signals into clear discovery experiments and focused roadmaps. I use influence and leadership to build alignment around the work, and I take pride in crafting simple, maintainable solutions that are easy to understand and a delight to use.
        </p>
      </div>
    </ContentCardSection>
  )
}

