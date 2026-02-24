"use client"

import { usePathname } from "next/navigation"

function Tab({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <a
      href={href}
      className={[
        "rounded-xl px-4 py-2 text-xs font-semibold border",
        active
          ? "border-[var(--color-accent)] bg-[rgba(89,131,146,0.08)] text-primary"
          : "border-gray-200 bg-white text-secondary hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </a>
  )
}

export function AdminTabs() {
  const pathname = usePathname()
  const isSettings = pathname?.startsWith("/admin/settings")

  return (
    <nav className="flex items-center gap-2">
      <Tab href="/admin" label="Chats" active={!isSettings} />
      <Tab href="/admin/settings" label="Settings" active={isSettings} />
    </nav>
  )
}

