import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubscriptionVault',
  description: '개인 구독료 추적·관리 웹앱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-r border-gray-200 dark:border-slate-800 hidden md:flex md:flex-col p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-blue-600">
                SubscriptionVault
              </h1>
              <p className="text-xs text-gray-500 mt-1">구독료 관리</p>
            </div>

            <nav className="space-y-2 flex-1">
              <a
                href="/"
                className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-slate-800 transition"
              >
                📊 대시보드
              </a>
              <a
                href="/subscriptions"
                className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-slate-800 transition"
              >
                📋 구독 목록
              </a>
              <a
                href="/analytics"
                className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-slate-800 transition"
              >
                📈 통계
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-slate-800 transition"
              >
                ⚙️ 설정
              </a>
            </nav>

            <div className="text-xs text-gray-500 border-t border-gray-200 dark:border-slate-800 pt-4">
              v1.0.0
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
