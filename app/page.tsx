import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import { Hero } from '@/components/home/Hero'
import { Strengths } from '@/components/home/Strengths'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { Counters } from '@/components/home/Counters'
import { Approach } from '@/components/home/Approach'
import { Testimonials } from '@/components/home/Testimonials'
import { getEndorsements, getProfile, getProjects } from '@/lib/content/loader.server'

export default async function HomePage() {
  const profile = getProfile()
  const endorsements = getEndorsements()
  const projects = getProjects()

  const featuredWorkProjects = projects.filter((p) =>
    p.id === 'self-serve-trial' || p.id === 'entitlements-management' || p.id === 'sts-launch'
  )
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero role={profile.role} />
        <Strengths />
        <FeaturedWork projects={featuredWorkProjects} />
        <Counters />
        <Approach />
        <Testimonials endorsements={endorsements} />
      </main>
      
      <GetInTouch />
      <Footer />
    </div>
  )
}
