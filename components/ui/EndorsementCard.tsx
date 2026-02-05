'use client'

import Image from 'next/image'
import type { Endorsement } from '@/lib/content/types'

export function EndorsementCard({ endorsement }: { endorsement: Endorsement }) {
  const pills = endorsement.pills ?? []
  const maxPills = 4
  const visiblePills = pills.slice(0, maxPills)
  const remainingPills = Math.max(0, pills.length - visiblePills.length)

  const LinkedInSquareIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#0288D1"
        d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
      />
      <path
        fill="#FFF"
        d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
      />
    </svg>
  )

  return (
    <article
      className="relative flex w-[min(480px,92vw)] flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
      aria-label={`Endorsement from ${endorsement.name}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white p-2"
          aria-hidden="true"
        >
          {endorsement.avatarUrl ? (
            <Image
              src={endorsement.avatarUrl}
              alt={`${endorsement.name} company logo`}
              width={56}
              height={56}
              className="h-auto w-full object-contain"
            />
          ) : null}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-medium text-[var(--color-text-primary)]">{endorsement.name}</div>
          <div className="font-label text-xs text-[var(--color-text-body)]">{endorsement.role}</div>
        </div>
      </div>

      <p className="text-sm sm:text-base text-[var(--color-text-body)] leading-relaxed">
        "{endorsement.quote}"
      </p>

      {pills.length || endorsement.linkedinUrl ? (
        <div className="mt-auto flex items-end justify-between gap-4">
          {pills.length ? (
            <div className="flex min-w-0 flex-wrap gap-2">
              {visiblePills.map((pill, idx) => (
                <span
                  key={`${endorsement.id}-${idx}`}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-label text-xs text-secondary"
                >
                  {pill}
                </span>
              ))}
              {remainingPills > 0 ? (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 font-label text-xs text-secondary">
                  +{remainingPills}
                </span>
              ) : null}
            </div>
          ) : (
            <div />
          )}

          {endorsement.linkedinUrl ? (
            <a
              href={endorsement.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-transparent shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03]"
              aria-label={`Open LinkedIn for ${endorsement.name}`}
            >
              <LinkedInSquareIcon className="h-full w-full" />
            </a>
          ) : (
            <span
              className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-transparent shadow-sm transition-transform duration-200 ease-out"
              aria-hidden="true"
            >
              <LinkedInSquareIcon className="h-full w-full" />
            </span>
          )}
        </div>
      ) : null}
    </article>
  )
}
