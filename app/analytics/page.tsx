import { SubscriptionRepository } from '@/db/repositories/subscription-repository'
import { formatKRW, calculateMonthlyForecast, getCategoryLabel } from '@/lib/utils'

async function getAnalyticsData() {
  try {
    const repo = new SubscriptionRepository()
    const subscriptions = await repo.findAll()
    return subscriptions.filter((s) => s.isActive)
  } catch (error) {
    console.error('Failed to load:', error)
    return []
  }
}

export default async function AnalyticsPage() {
  const subscriptions = await getAnalyticsData()

  const forecast = calculateMonthlyForecast(subscriptions, 12)
  const categoryTotals: Record<string, number> = {}
  subscriptions.forEach((sub) => {
    categoryTotals[sub.category] =
      (categoryTotals[sub.category] || 0) + sub.monthlyPrice
  })

  const maxMonthCost = Math.max(...forecast.map((m) => m.totalCost), 0)
  const minMonthCost = Math.min(...forecast.map((m) => m.totalCost), 0)
  const avgMonthCost = Math.round(
    forecast.reduce((sum, m) => sum + m.totalCost, 0) / (forecast.length || 1)
  )

  const totalCost = subscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">통계 & 리포트</h1>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">구독 데이터가 없습니다</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">총 구독</p>
              <p className="text-3xl font-bold mt-2">{subscriptions.length}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">월간 평균</p>
              <p className="text-3xl font-bold mt-2">{formatKRW(avgMonthCost)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">최고 비용월</p>
              <p className="text-3xl font-bold mt-2">{formatKRW(maxMonthCost)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">최저 비용월</p>
              <p className="text-3xl font-bold mt-2">{formatKRW(minMonthCost)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-8">
            <h2 className="text-lg font-bold mb-4">월별 예상 비용</h2>
            <div className="space-y-2">
              {forecast.map((item, idx) => {
                const barWidth = (item.totalCost / maxMonthCost) * 100
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-20 text-sm font-medium">{item.month}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden h-8">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                        style={{ width: `${Math.max(barWidth, 5)}%` }}
                      >
                        {barWidth > 20 && formatKRW(item.totalCost)}
                      </div>
                    </div>
                    <span className="w-24 text-right text-sm">
                      {formatKRW(item.totalCost)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-8">
            <h2 className="text-lg font-bold mb-4">카테고리별 분포</h2>
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, cost]) => {
                  const percentage = (cost / totalCost) * 100
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {getCategoryLabel(category)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-600 h-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
