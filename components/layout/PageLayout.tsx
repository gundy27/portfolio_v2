import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Profile } from '@/lib/content/types'
import { cn } from '@/lib/utils/cn'

interface PageLayoutProps {
  profile: Profile
  children: ReactNode
  mainClassName?: string
  footerWrapperClassName?: string
}

export function PageLayout({
  profile,
  children,
  mainClassName,
  footerWrapperClassName,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className={cn('flex-1', mainClassName)}>{children}</main>

      {footerWrapperClassName ? (
        <div className={footerWrapperClassName}>
          <Footer profile={profile} />
        </div>
      ) : (
        <Footer profile={profile} />
      )}
    </div>
  )
}

