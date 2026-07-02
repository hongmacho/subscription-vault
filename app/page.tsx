import { SubscriptionRepository } from '@/db/repositories/subscription-repository'
import { formatKRW, calculateMonthlyForecast } from '@/lib/utils'

async function getDashboardData() {
  try {
    const repo = new SubscriptionRepository()
    const subscriptions = await repo.findAll()
    return subscriptions
  } catch (error) {
    console.error('Failed to load:', error)
    return []
  }
}

export default async function Dashboard() {
  const subscriptions = await getDashboardData()
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const totalSubscriptions = subscriptions.length
  const monthlyAverage =
    activeSubscriptions.length > 0
      ? Math.round(
          activeSubscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0) /
            activeSubscriptions.length
        )
      : 0
  const thisMonthCost = activeSubscriptions.reduce(
    (sum, s) => sum + s.monthlyPrice,
    0
  )
  const forecast = calculateMonthlyForecast(activeSubscriptions, 3)
  const nextMonthCost =
    forecast.length > 1 ? forecast[1].totalCost : thisMonthCost
  const monthlyChange = nextMonthCost - thisMonthCost

  const recentSubscriptions = subscriptions.slice(0, 5)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">대시보드</h1>

      {totalSubscriptions === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-2">아직 등록된 구독이 없습니다</h2>
          <p className="text-gray-500 mb-8">첫 구독을 추가하여 시작하세요</p>
          <a
            href="/subscriptions"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + 구독 추가하기
          </a>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                전체 구독
              </p>
              <p className="text-3xl font-bold mt-2">{totalSubscriptions}</p>
              <p className="text-xs text-gray-500 mt-2">
                활성: {activeSubscriptions.length}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                월간 평균
              </p>
              <p className="text-3xl font-bold mt-2">{formatKRW(monthlyAverage)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                이번 달 예상
              </p>
              <p className="text-3xl font-bold mt-2">{formatKRW(thisMonthCost)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                지난 달 대비
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  monthlyChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {monthlyChange > 0 ? '+' : ''}
                {formatKRW(monthlyChange)}
              </p>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4">최근 구독</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      서비스명
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      금액
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      결제일
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                      <td className="py-3 px-4 font-medium">{sub.name}</td>
                      <td className="py-3 px-4">{formatKRW(sub.monthlyPrice)}</td>
                      <td className="py-3 px-4">매월 {sub.billingDayOfMonth}일</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            sub.isActive ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {sub.isActive ? '활성' : '비활성'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="/subscriptions"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                전체 구독 보기 →
              </a>
              <a
                href="/subscriptions"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition ml-auto"
              >
                + 구독 추가
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
