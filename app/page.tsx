import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import { UnderConstructionBanner } from '@/components/layout/UnderConstructionBanner'
import { Hero } from '@/components/home/Hero'
import { Strengths } from '@/components/home/Strengths'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { Counters } from '@/components/home/Counters'
import { Approach } from '@/components/home/Approach'
import { Testimonials } from '@/components/home/Testimonials'
import { getEndorsements, getProfile } from '@/lib/content/loader.server'

export default async function HomePage() {
  const profile = getProfile()
  const endorsements = getEndorsements()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="pt-16">
        <UnderConstructionBanner />
      </div>
      
      <main className="flex-1">
        <Hero name={profile.name} />
        <Strengths />
        <FeaturedWork />
        <Counters />
        <Approach />
        <Testimonials endorsements={endorsements} />
      </main>
      
      <GetInTouch />
      <Footer />
    </div>
  )
}
