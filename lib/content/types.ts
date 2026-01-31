// TypeScript interfaces for all content types

export interface Profile {
  name: string
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

