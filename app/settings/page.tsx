'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const subscriptions = await response.json()

      const data = {
        subscriptions,
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscriptions_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()

      setMessage('데이터가 내보내졌습니다')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setMessage('내보내기에 실패했습니다')
    }
  }

  const handleClearDatabase = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const subscriptions = await response.json()

      for (const sub of subscriptions) {
        await fetch(`/api/subscriptions/${sub.id}`, { method: 'DELETE' })
      }

      setMessage('모든 데이터가 삭제되었습니다')
      setShowClearConfirm(false)
      setTimeout(() => setMessage(''), 3000)
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Clear failed:', error)
      setMessage('데이터 삭제에 실패했습니다')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">설정</h1>

      {message && (
        <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
        <h2 className="text-lg font-bold mb-4">일반 설정</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">기본 통화</label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800">
              <option value="krw">KRW (한국 원)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">테마</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  defaultChecked
                  className="mr-2"
                />
                라이트
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="mr-2"
                />
                다크
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  className="mr-2"
                />
                시스템 설정
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
        <h2 className="text-lg font-bold mb-4">데이터 관리</h2>

        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <h3 className="font-medium mb-2">데이터 내보내기 (JSON)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              모든 구독 데이터를 백업 파일로 내보냅니다
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              내보내기
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <h3 className="font-medium mb-2">데이터 가져오기</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              이전에 내보낸 백업 파일에서 데이터를 불러옵니다
            </p>
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
            >
              가져오기 (준비 중)
            </button>
          </div>

          <div>
            <h3 className="font-medium mb-2">데이터 초기화</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ⚠️ 모든 구독 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>

            {showClearConfirm ? (
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg mb-4">
                <p className="text-sm font-medium mb-4">
                  정말로 모든 데이터를 삭제하시겠습니까?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearDatabase}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    확인 삭제
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-4">정보</h2>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">버전:</span> v1.0.0
          </p>
          <p>
            <span className="font-medium">라이선스:</span> MIT
          </p>
          <p>
            <span className="font-medium">기술 스택:</span> Next.js 16, SQLite,
            Drizzle ORM
          </p>
          <p>
            <span className="font-medium">저장소:</span>{' '}
            <a
              href="https://github.com/hongmacho/subscription-vault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
