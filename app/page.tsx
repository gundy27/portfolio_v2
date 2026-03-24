import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GetInTouch } from '@/components/layout/GetInTouch'
import { Hero } from '@/components/home/Hero'
import { Strengths } from '@/components/home/Strengths'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { Approach } from '@/components/home/Approach'
import { Testimonials } from '@/components/home/Testimonials'
import { getEndorsements, getFeaturedProjects } from '@/lib/content/loader.server'

export default async function HomePage() {
  const endorsements = getEndorsements()
  const featuredWorkProjects = getFeaturedProjects()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <Hero />
        <FeaturedWork projects={featuredWorkProjects} />
        <Testimonials endorsements={endorsements} />
        <Approach />
        <Strengths />
      </main>
      
      <GetInTouch />
      <Footer />
    </div>
  )
}
