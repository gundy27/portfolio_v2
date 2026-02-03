// TypeScript interfaces for all content types

export interface Profile {
  name: string
  role: string
  headline: string
  tagline: string
  bio: string
  email: string
  location?: string
  links: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  rotatingText?: string[] // Custom list for rotating text
}

export interface Project {
  id: string
  label?: string
  title: string
  description: string
  year: number
  type: 'paid' | 'personal'
  tags: string[]
  featured: boolean
  thumbnail: string
  company?: string
  companyLogo?: string
  url?: string
  contentFile?: string // Optional markdown file
  meta?: ProjectMeta
  /** Top-level metrics shown below meta, before first section (up to 4 cards) */
  metrics?: ProjectMetric[]
  sections?: ProjectSection[]
}

export interface ProjectMeta {
  role?: string
  company?: string
  timeline?: string
  proudOf?: string
  learned?: string
}

export interface ProjectMetric {
  value: number
  label: string
  format?: string // e.g. "{}%", "${}M", "{} Weeks"
}

export type ProjectSectionType = 'two-column' | 'full-width' | 'highlight' | 'metrics'

export interface ProjectSection {
  id: string
  type: ProjectSectionType
  label?: string
  heading?: string
  content?: string // markdown-supported
  bullets?: string[]
  checklist?: string[]
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  metrics?: ProjectMetric[]
}

export interface TimelineEvent {
  id: string
  company: string
  role: string
  startDate: string // Format: "YYYY-MM"
  endDate: string | null // Format: "YYYY-MM" or null for current
  description: string
  tags: string[]
  image: string
  color?: string // Hex color used for active state and progress UI
  projectLinks?: string[] // Array of project IDs
}

export type TimelineAnchorType = 'milestone' | 'achievement' | 'project' | 'position' | 'work' | 'other'

export interface TimelineAnchor {
  id: string
  title: string
  description?: string
  imageUrl?: string
  imageDescription?: string
  projectLink?: string // project slug (optional)
  type?: TimelineAnchorType
}

export interface TimelineYear {
  year: number
  anchors: TimelineAnchor[]
}

export interface Endorsement {
  id: string
  name: string
  role: string
  quote: string
  pills: string[]
  linkedinUrl?: string
  avatarUrl?: string
}