import { LogoCarousel } from './LogoCarousel'
import { ScrollToTopButton } from './ScrollToTopButton'

interface FooterProps {
  logos?: Array<{ name: string; image: string; url?: string }>
}

export function Footer({ logos = [] }: FooterProps = {}) {
  return (
    <footer className="border-t border-gray-200">
      {logos.length > 0 && (
        <div className="border-b border-gray-200 bg-white">
          <LogoCarousel logos={logos} />
        </div>
      )}
      
      <div className="container-wide py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary text-center sm:text-left">
            © 2026 Dan Gunderson. Made from scratch with ❤️. All rights reserved.
          </p>
          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  )
}
