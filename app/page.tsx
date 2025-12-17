import { PageLayout } from '@/components/layout/PageLayout'
import { Hero } from '@/components/home/Hero'
import { AboutMe } from '@/components/home/AboutMe'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { getProfile, getFeaturedProjects } from '@/lib/content/loader.server'

export default async function HomePage() {
  const profile = getProfile()
  const featuredProjects = getFeaturedProjects()
  
  return (
    <PageLayout profile={profile}>
      <div>
        <Hero name={profile.name} headline={profile.headline} />
        <AboutMe tagline={profile.tagline} rotatingText={profile.rotatingText} />
        <FeaturedProjects projects={featuredProjects} />
      </div>
    </PageLayout>
  )
}
