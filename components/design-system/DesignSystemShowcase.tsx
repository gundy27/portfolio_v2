'use client'

import { TypographySection } from './TypographySection'
import { ColorSection } from './ColorSection'
import { SpacingSection } from './SpacingSection'
import { ButtonSection } from './ButtonSection'
import { FormSection } from './FormSection'
import { TabSection } from './TabSection'
import { SignUpFormExample } from './SignUpFormExample'

export function DesignSystemShowcase() {
  return (
    <div className="container-wide py-8 sm:py-12 lg:py-16">
      <div className="text-center">
        <div className="font-label text-[color:var(--color-accent)]">Design System</div>
        <h1 className="!mb-3">Portfolio UI Kit</h1>
        <p className="text-block !mb-0 text-[color:var(--color-text-secondary)]">
          A living reference of typography, color, spacing, and core components used across the
          site.
        </p>
      </div>

      <div className="mt-10 sm:mt-12 lg:mt-16 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_480px] gap-6 sm:gap-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <TypographySection />
            <ColorSection />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <SpacingSection />
            <ButtonSection />
          </div>

          <FormSection />
          <TabSection />
        </div>

        <div className="xl:sticky xl:top-24 self-start">
          <SignUpFormExample />
        </div>
      </div>
    </div>
  )
}

