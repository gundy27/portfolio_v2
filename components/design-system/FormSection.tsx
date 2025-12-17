import { SectionHeader } from '@/components/ui/SectionHeader'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Radio } from '@/components/ui/Radio'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-label text-[color:var(--color-text-secondary)]">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function FormSection() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Forms"
        heading="Inputs & selection"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
            Text inputs
          </div>

          <div className="mt-4 space-y-5">
            <Field label="Default">
              <Input placeholder="Placeholder" />
            </Field>

            <Field label="Focused">
              <Input placeholder="Placeholder" className="border-accent" />
            </Field>

            <Field label="Error">
              <Input placeholder="Placeholder" error="Something went wrong" />
            </Field>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-heading text-sm text-[color:var(--color-text-primary)]">
            Checkbox & radio
          </div>

          <div className="mt-4 space-y-6">
            <div>
              <div className="font-label text-[color:var(--color-text-secondary)]">Checkbox</div>
              <div className="mt-3 space-y-2">
                <Checkbox name="cb-default" label="I agree to the terms" defaultChecked />
                <Checkbox name="cb-unchecked" label="Send me updates" />
                <Checkbox name="cb-disabled" label="Disabled option" disabled />
              </div>
            </div>

            <div>
              <div className="font-label text-[color:var(--color-text-secondary)]">Radio buttons</div>
              <div className="mt-3 space-y-2">
                <Radio name="radio-example" value="one" label="Option one" defaultChecked />
                <Radio name="radio-example" value="two" label="Option two" />
                <Radio name="radio-example" value="three" label="Disabled option" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

