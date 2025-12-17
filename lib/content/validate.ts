import type { Profile, Project, Resource, TimelineEvent } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export function isProfile(value: unknown): value is Profile {
  if (!isRecord(value)) return false

  if (typeof value.name !== 'string') return false
  if (typeof value.headline !== 'string') return false
  if (typeof value.tagline !== 'string') return false
  if (typeof value.bio !== 'string') return false
  if (typeof value.email !== 'string') return false

  if (value.location != null && typeof value.location !== 'string') return false

  if (!isRecord(value.links)) return false
  if (value.links.github != null && typeof value.links.github !== 'string') return false
  if (value.links.linkedin != null && typeof value.links.linkedin !== 'string') return false
  if (value.links.twitter != null && typeof value.links.twitter !== 'string') return false
  if (value.links.website != null && typeof value.links.website !== 'string') return false

  if (value.rotatingText != null && !isStringArray(value.rotatingText)) return false

  return true
}

export function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false

  if (typeof value.id !== 'string') return false
  if (typeof value.title !== 'string') return false
  if (typeof value.description !== 'string') return false
  if (typeof value.year !== 'number') return false
  if (value.type !== 'paid' && value.type !== 'personal') return false
  if (!isStringArray(value.tags)) return false
  if (typeof value.featured !== 'boolean') return false
  if (typeof value.thumbnail !== 'string') return false

  if (value.company != null && typeof value.company !== 'string') return false
  if (value.companyLogo != null && typeof value.companyLogo !== 'string') return false
  if (value.url != null && typeof value.url !== 'string') return false
  if (value.contentFile != null && typeof value.contentFile !== 'string') return false

  return true
}

export function isResource(value: unknown): value is Resource {
  if (!isRecord(value)) return false

  if (typeof value.id !== 'string') return false
  if (typeof value.title !== 'string') return false
  if (typeof value.description !== 'string') return false
  if (typeof value.file !== 'string') return false
  if (typeof value.fileType !== 'string') return false
  if (typeof value.downloads !== 'number') return false
  if (typeof value.rating !== 'number') return false
  if (value.category !== 'template' && value.category !== 'document' && value.category !== 'code' && value.category !== 'other') {
    return false
  }

  return true
}

export function isTimelineEvent(value: unknown): value is TimelineEvent {
  if (!isRecord(value)) return false

  if (typeof value.id !== 'string') return false
  if (typeof value.company !== 'string') return false
  if (typeof value.role !== 'string') return false
  if (typeof value.startDate !== 'string') return false
  if (value.endDate !== null && typeof value.endDate !== 'string') return false
  if (typeof value.description !== 'string') return false
  if (!isStringArray(value.tags)) return false
  if (typeof value.image !== 'string') return false

  if (value.color != null && typeof value.color !== 'string') return false
  if (value.projectLinks != null && !isStringArray(value.projectLinks)) return false

  return true
}

