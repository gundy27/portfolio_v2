import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { verifyAdminSessionToken } from '@/lib/admin/session'
import { AdminTabs } from './AdminTabs'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = (await cookies()).get('admin_session')?.value
  const session = verifyAdminSessionToken(token)

  if (!session) {
    redirect('/admin/login?next=/admin')
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-gray-200 bg-white">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-heading text-lg font-semibold text-primary">Admin</div>
              <div className="text-xs text-secondary mt-1">Signed in as {session.username}</div>
            </div>

            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-gray-50"
              >
                Log out
              </button>
            </form>
          </div>

          <div className="mt-4">
            <AdminTabs />
          </div>
        </div>
      </div>

      <div className="container-wide py-8">{children}</div>
    </div>
  )
}

