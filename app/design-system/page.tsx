import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DesignSystemShowcase } from '@/components/design-system/DesignSystemShowcase'
import { getProfile } from '@/lib/content/loader.server'

export default async function DesignSystemPage() {
  const profile = getProfile()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <DesignSystemShowcase />
      </main>

      <Footer profile={profile} />
    </div>
  )
}

