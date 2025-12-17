import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { SectionHeader } from '@/components/ui/SectionHeader'

export function SignUpFormExample() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
      <SectionHeader
        label="Example"
        heading="Sign up form"
        headingLevel="h3"
        headingClassName="!mb-0"
      />

      <div className="mt-6 rounded-xl bg-gray-50 p-6 sm:p-8">
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="font-heading text-2xl text-[color:var(--color-text-primary)] !mb-2">
            Sign Up
          </div>
          <div className="text-sm text-[color:var(--color-text-secondary)]">
            Individual <span className="mx-2 text-gray-300">|</span> Agency
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <div className="font-label text-[color:var(--color-text-secondary)]">
                Full Name
              </div>
              <div className="mt-2">
                <Input placeholder="Your name" autoComplete="name" />
              </div>
            </div>

            <div>
              <div className="font-label text-[color:var(--color-text-secondary)]">Email</div>
              <div className="mt-2">
                <Input placeholder="name@domain.com" autoComplete="email" />
              </div>
            </div>

            <div>
              <div className="font-label text-[color:var(--color-text-secondary)]">
                Choose Password
              </div>
              <div className="mt-2">
                <Input placeholder="••••••••" type="password" autoComplete="new-password" />
              </div>
            </div>

            <div className="pt-1">
              <Checkbox
                name="tos"
                label={
                  <span>
                    I agree to the{' '}
                    <span className="text-[color:var(--color-accent)]">terms</span>
                  </span>
                }
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" variant="primary" className="flex-1 justify-center">
                Sign Up
              </Button>
              <Button type="button" variant="outline" className="flex-1 justify-center">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

