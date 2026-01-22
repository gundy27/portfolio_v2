import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Profile, Project, TimelineEvent, TimelineYear } from './types'

const contentDirectory = path.join(process.cwd(), 'content')

// Default profile for fallback
const defaultProfile: Profile = {
  name: '',
  headline: '',
  tagline: '',
  bio: '',
  email: '',
  links: {},
}

// Load profile data
export function getProfile(): Profile {
  try {
    const filePath = path.join(contentDirectory, 'profile.json')
    const fileExists = fs.existsSync(filePath)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf0f521d-5cb7-4c07-aed8-e5295c19b5a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/content/loader.server.ts:getProfile',message:'Profile file check',data:{filePath,fileExists},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!fileExists) {
      console.warn('[content] profile.json not found')
      return defaultProfile
    }
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error('[content] Error loading profile:', error)
    return defaultProfile
  }
}

// Load all projects
export function getProjects(): Project[] {
  try {
    const projectsDirectory = path.join(contentDirectory, 'projects')
    const dirExists = fs.existsSync(projectsDirectory)
    const files = dirExists ? fs.readdirSync(projectsDirectory) : []
    const jsonFiles = files.filter((file) => file.endsWith('.json') && !file.includes('template'))
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf0f521d-5cb7-4c07-aed8-e5295c19b5a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/content/loader.server.ts:getProjects',message:'Projects directory scan',data:{projectsDirectory,dirExists,fileCount:files.length,jsonFileCount:jsonFiles.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (!dirExists) {
      return []
    }

    const projects = jsonFiles
      .map((file) => {
        try {
          const filePath = path.join(projectsDirectory, file)
          const fileContents = fs.readFileSync(filePath, 'utf8')
          return JSON.parse(fileContents) as Project
        } catch (error) {
          console.error(`[content] Error loading project ${file}:`, error)
          return null
        }
      })
      .filter((p): p is Project => p !== null)

    // Sort by year (newest first), then by featured
    return projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return b.year - a.year
    })
  } catch (error) {
    console.error('[content] Error loading projects:', error)
    return []
  }
}

// Load single project by slug
export function getProject(slug: string): Project | null {
  try {
    const filePath = path.join(contentDirectory, 'projects', `${slug}.json`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents) as Project
  } catch (error) {
    console.error(`[content] Error loading project ${slug}:`, error)
    return null
  }
}

// Load project content (markdown) if available
export function getProjectContent(slug: string): string | null {
  try {
    const project = getProject(slug)
    if (!project || !project.contentFile) {
      return null
    }

    const filePath = path.join(contentDirectory, 'projects', project.contentFile)

    const fileExists = fs.existsSync(filePath)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf0f521d-5cb7-4c07-aed8-e5295c19b5a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/content/loader.server.ts:getProjectContent',message:'Project content file check',data:{slug,contentFile:project.contentFile,filePath,fileExists},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    if (!fileExists) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { content } = matter(fileContents)
    return content
  } catch (error) {
    console.error(`[content] Error loading project content for ${slug}:`, error)
    return null
  }
}

// Get the next project in the sorted list
export function getNextProject(slug: string): Project | null {
  const projects = getProjects()
  const currentIndex = projects.findIndex((p) => p.id === slug)
  if (currentIndex === -1) return null
  return projects[currentIndex + 1] ?? null
}

// Get the previous project in the sorted list
export function getPreviousProject(slug: string): Project | null {
  const projects = getProjects()
  const currentIndex = projects.findIndex((p) => p.id === slug)
  if (currentIndex === -1) return null
  return projects[currentIndex - 1] ?? null
}

// Load timeline events
export function getTimelineEvents(): TimelineEvent[] {
  try {
    const filePath = path.join(contentDirectory, 'timeline', 'events.json')
    const fileExists = fs.existsSync(filePath)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf0f521d-5cb7-4c07-aed8-e5295c19b5a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/content/loader.server.ts:getTimelineEvents',message:'Timeline events file check',data:{filePath,fileExists},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    if (!fileExists) {
      return []
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const parsed: unknown = JSON.parse(fileContents)

    const looksLikeTimelineYear = (value: unknown): value is { year: unknown } =>
      typeof value === 'object' && value !== null && 'year' in value

    // Back-compat guard: if the file has been migrated to year-based structure,
    // don't attempt to treat it as TimelineEvent[] (would crash on sort).
    if (Array.isArray(parsed) && looksLikeTimelineYear(parsed[0])) {
      console.warn('[content] timeline/events.json is year-based; getTimelineEvents() is deprecated')
      return []
    }

    const events = parsed as TimelineEvent[]

    // Sort by start date (newest first)
    return events.sort((a, b) => {
      return b.startDate.localeCompare(a.startDate)
    })
  } catch (error) {
    console.error('[content] Error loading timeline events:', error)
    return []
  }
}

// Load timeline years (year-based anchors)
export function getTimelineYears(): TimelineYear[] {
  try {
    const filePath = path.join(contentDirectory, 'timeline', 'events.json')
    if (!fs.existsSync(filePath)) {
      return []
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const years = JSON.parse(fileContents) as TimelineYear[]

    // Sort newest-first so 2026 renders at top and 2013 at bottom.
    return years.sort((a, b) => b.year - a.year)
  } catch (error) {
    console.error('[content] Error loading timeline years:', error)
    return []
  }
}

// Get featured projects (top 6)
export function getFeaturedProjects(): Project[] {
  const projects = getProjects()
  return projects.filter((p) => p.featured).slice(0, 6)
}
