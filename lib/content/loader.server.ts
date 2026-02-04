import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Endorsement, Profile, Project } from './types'

const contentDirectory = path.join(process.cwd(), 'content')

// Default profile for fallback
const defaultProfile: Profile = {
  name: '',
  role: '',
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

export function getEndorsements(): Endorsement[] {
  try {
    const filePath = path.join(contentDirectory, 'endorsements.json')
    if (!fs.existsSync(filePath)) return []
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const parsed: unknown = JSON.parse(fileContents)
    if (!Array.isArray(parsed)) return []
    return parsed as Endorsement[]
  } catch (error) {
    console.error('[content] Error loading endorsements:', error)
    return []
  }
}

// Load all projects
export function getProjects(): Project[] {
  try {
    const projectsDirectory = path.join(contentDirectory, 'projects')
    const dirExists = fs.existsSync(projectsDirectory)
    const files = dirExists ? fs.readdirSync(projectsDirectory) : []
    const jsonFiles = files.filter((file) => file.endsWith('.json') && !file.includes('template'))
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

// Get featured projects (top 6)
export function getFeaturedProjects(): Project[] {
  const projects = getProjects()
  return projects.filter((p) => p.featured).slice(0, 6)
}
