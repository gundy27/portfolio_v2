import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Profile, Project, Resource, TimelineEvent } from './types'
import { isProfile, isProject, isResource, isTimelineEvent } from './validate'

function resolveContentDirectory(): string {
  // Allow deployments to override the content directory location.
  const fromEnv = process.env.CONTENT_DIR
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim()

  // Default: repo root `content/` directory.
  return path.join(process.cwd(), 'content')
}

const contentDirectory = resolveContentDirectory()

function logContentError(context: string, error: unknown) {
  // Avoid throwing during rendering; emit a helpful log for debugging.
  console.error(`[content] ${context}`, error)
}

function safeReadFileUtf8(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    logContentError(`Failed to read file: ${filePath}`, error)
    return null
  }
}

function safeReadJson(filePath: string): unknown | null {
  const raw = safeReadFileUtf8(filePath)
  if (raw == null) return null

  try {
    return JSON.parse(raw) as unknown
  } catch (error) {
    logContentError(`Failed to parse JSON: ${filePath}`, error)
    return null
  }
}

function safeReadJsonValidated<T>(
  filePath: string,
  isValid: (value: unknown) => value is T,
  label: string
): T | null {
  const parsed = safeReadJson(filePath)
  if (parsed == null) return null

  if (!isValid(parsed)) {
    logContentError(`Invalid ${label} JSON schema: ${filePath}`, parsed)
    return null
  }

  return parsed
}

function safeReadDir(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return []
    return fs.readdirSync(dirPath)
  } catch (error) {
    logContentError(`Failed to read directory: ${dirPath}`, error)
    return []
  }
}

function fallbackProfile(): Profile {
  return {
    name: '',
    headline: '',
    tagline: '',
    bio: '',
    email: '',
    links: {},
    rotatingText: [],
  }
}

// Load profile data
export function getProfile(): Profile {
  const filePath = path.join(contentDirectory, 'profile.json')
  const profile = safeReadJsonValidated<Profile>(filePath, isProfile, 'profile')
  return profile ?? fallbackProfile()
}

// Load all projects
export function getProjects(): Project[] {
  const projectsDirectory = path.join(contentDirectory, 'projects')
  const files = safeReadDir(projectsDirectory)

  const projects = files
    .filter((file) => file.endsWith('.json') && !file.includes('template'))
    .map((file) => {
      const filePath = path.join(projectsDirectory, file)
      return safeReadJsonValidated<Project>(filePath, isProject, 'project')
    })
    .filter((p): p is Project => p != null)
  
  // Sort by year (newest first), then by featured
  return projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return b.year - a.year
  })
}

// Load single project by slug
export function getProject(slug: string): Project | null {
  const filePath = path.join(contentDirectory, 'projects', `${slug}.json`)
  return safeReadJsonValidated<Project>(filePath, isProject, 'project')
}

// Load project content (markdown) if available
export function getProjectContent(slug: string): string | null {
  const project = getProject(slug)
  if (!project || !project.contentFile) {
    return null
  }
  
  const filePath = path.join(contentDirectory, 'projects', project.contentFile)

  const fileContents = safeReadFileUtf8(filePath)
  if (fileContents == null) return null

  try {
    const { content } = matter(fileContents)
    return content
  } catch (error) {
    logContentError(`Failed to parse markdown frontmatter: ${filePath}`, error)
    return null
  }
}

// Load all resources
export function getResources(): Resource[] {
  const resourcesDirectory = path.join(contentDirectory, 'resources')
  const files = safeReadDir(resourcesDirectory)

  const resources = files
    .filter((file) => file.endsWith('.json') && !file.includes('template'))
    .map((file) => {
      const filePath = path.join(resourcesDirectory, file)
      return safeReadJsonValidated<Resource>(filePath, isResource, 'resource')
    })
    .filter((r): r is Resource => r != null)
  
  return resources.sort((a, b) => b.rating - a.rating)
}

// Load timeline events
export function getTimelineEvents(): TimelineEvent[] {
  const filePath = path.join(contentDirectory, 'timeline', 'events.json')
  const parsed = safeReadJson(filePath)
  const events = Array.isArray(parsed) ? parsed.filter(isTimelineEvent) : []
  
  // Sort by start date (newest first)
  return events.sort((a, b) => {
    return b.startDate.localeCompare(a.startDate)
  })
}

// Get featured projects (top 6)
export function getFeaturedProjects(): Project[] {
  const projects = getProjects()
  return projects.filter((p) => p.featured).slice(0, 6)
}

