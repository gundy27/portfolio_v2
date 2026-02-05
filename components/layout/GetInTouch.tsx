import Link from 'next/link'
import { SectionHeader } from '@/components/ui/SectionHeader'
import MagnetLines from '@/components/ui/MagnetLines'

// Schedule Icon Component (Lucide calendar-plus)
function ScheduleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-calendar-plus shrink-0"
      aria-label="Schedule"
    >
      <title>Schedule</title>
      <path d="M16 19h6" />
      <path d="M16 2v4" />
      <path d="M19 16v6" />
      <path d="M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
    </svg>
  )
}

// Email Icon Component (Lucide-style envelope)
function EmailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Email"
    >
      <title>Email</title>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

// LinkedIn Icon Component
function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LinkedIn"
      className="shrink-0"
    >
      <title>LinkedIn</title>
      <rect width="24" height="24" rx="4" fill="#0077B5" />
      <path
        d="M8.5 18H6V9.5H8.5V18ZM7.25 8.5C6.56 8.5 6 7.94 6 7.25C6 6.56 6.56 6 7.25 6C7.94 6 8.5 6.56 8.5 7.25C8.5 7.94 7.94 8.5 7.25 8.5ZM18 18H15.5V13.5C15.5 12.4 15.5 11 14 11C12.5 11 12.5 12.3 12.5 13.5V18H10V9.5H12.4V10.7C12.8 10 13.5 9.2 15 9.2C18 9.2 18.5 11.5 18.5 13.5V18H18Z"
        fill="white"
      />
    </svg>
  )
}

// GitHub Icon Component
function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GitHub"
      className="shrink-0"
    >
      <title>GitHub</title>
      <circle cx="12" cy="12" r="12" fill="#24292E" />
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.16 21.5C19.14 20.16 22 16.42 22 12C22 6.48 17.52 2 12 2Z"
        fill="white"
      />
    </svg>
  )
}


export function GetInTouch() {
  return (
    <section className="bg-gray-50 border-t border-gray-200">
      <div className="container-wide py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-8 lg:gap-12">
          {/* Content */}
          <div className="space-y-6 max-w-xl">
          <SectionHeader
            label="NEXT STEPS"
            heading="Let's Work Together"
            headingLevel="h2"
            headingClassName="text-3xl sm:text-4xl lg:text-5xl"
          />
          <p className="text-body text-lg text-primary max-w-lg">
          I’m currently open to senior product or growth roles, and I take on a small number of consulting engagements where I can have meaningful impact.
          </p>
          
          {/* Action Items */}
          <div className="flex flex-col items-start gap-4 pt-4">
            {/* Primary CTA */}
            <Link
              href="https://calendar.app.google/ABvWohuTUmiqFG8f9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-dark)] px-6 py-3 text-sm font-label font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:text-gray-300 sm:w-auto"
            >
              <ScheduleIcon />
              BOOK A CONVERSATION
            </Link>

            {/* Secondary links */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Email */}
              <Link
                href="https://mail.google.com/mail/?view=cm&fs=1&to=dan@gundy.io&su=Intro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-transparent p-3 text-accent transition-colors hover:bg-accent/10"
                aria-label="Email"
              >
                <EmailIcon />
              </Link>

              {/* LinkedIn */}
              <Link
                href="https://www.linkedin.com/in/dangunderson27"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-transparent p-3 text-accent transition-colors hover:bg-accent/10"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </Link>

              {/* GitHub */}
              <Link
                href="https://www.github.com/gundy27"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-transparent p-3 text-accent transition-colors hover:bg-accent/10"
                aria-label="GitHub"
              >
                <GitHubIcon />
              </Link>
            </div>
          </div>
        </div>

          {/* Right Side - Magnet Lines Graphic */}
          <div className="hidden lg:block w-[400px] h-[300px] flex-shrink-0 rounded-lg overflow-hidden">
            <MagnetLines
              variant="square"
              rows={12}
              columns={12}
              containerWidth="100%"
              containerHeight="100%"
              lineColor="#598392"
              lineWidth="2px"
              lineHeight="24px"
              baseAngle={-10}
              className="h-full w-full"
              style={{ backgroundColor: '#FAFAFA' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
