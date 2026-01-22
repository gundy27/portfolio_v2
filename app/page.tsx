import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import { UnderConstructionBanner } from '@/components/layout/UnderConstructionBanner'
import { Hero } from '@/components/home/Hero'
import { PrimaryAttributes } from '@/components/home/PrimaryAttributes'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { getProfile, getFeaturedProjects } from '@/lib/content/loader.server'

export default async function HomePage() {
  const profile = getProfile()
  const featuredProjects = getFeaturedProjects()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="pt-16">
        <UnderConstructionBanner />
      </div>
      
      <main className="flex-1">
        <Hero name={profile.name} />
        <PrimaryAttributes />
        <FeaturedProjects projects={featuredProjects} />
      </main>
      
      <GetInTouch />
      <Footer />
    </div>
  )
}
