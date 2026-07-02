import { SubscriptionRepository } from '@/db/repositories/subscription-repository'
import { PriceHistoryRepository } from '@/db/repositories/price-history-repository'
import { formatKRW, formatDate, getCategoryLabel, calculateCancellationDate } from '@/lib/utils'

async function getSubscriptionData(id: number) {
  try {
    const subRepo = new SubscriptionRepository()
    const subscription = await subRepo.findById(id)

    if (!subscription) return null

    const priceRepo = new PriceHistoryRepository()
    const priceHistory = await priceRepo.findBySubscriptionId(id)

    return { subscription, priceHistory }
  } catch (error) {
    console.error('Failed to load subscription:', error)
    return null
  }
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getSubscriptionData(parseInt(id))

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-4">구독을 찾을 수 없습니다</h1>
        <a href="/subscriptions" className="text-blue-600 hover:text-blue-700">
          구독 목록으로 돌아가기
        </a>
      </div>
    )
  }

  const { subscription, priceHistory } = data
  const cancellation = calculateCancellationDate(
    subscription.contractStartDate,
    subscription.contractType
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold">{subscription.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {getCategoryLabel(subscription.category)}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/subscriptions?edit=${subscription.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            수정
          </a>
          <button
            onClick={() => {
              if (confirm('이 구독을 삭제하시겠습니까?')) {
                fetch(`/api/subscriptions/${subscription.id}`, {
                  method: 'DELETE',
                }).then(() => {
                  window.location.href = '/subscriptions'
                })
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
        <h2 className="text-lg font-bold mb-4">기본 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">월간 비용</p>
            <p className="text-2xl font-bold">{formatKRW(subscription.monthlyPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">결제일</p>
            <p className="text-xl font-medium">매월 {subscription.billingDayOfMonth}일</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">계약 유형</p>
            <p className="text-xl font-medium">
              {subscription.contractType === 'monthly'
                ? '월간'
                : subscription.contractType === 'annual'
                  ? '연간'
                  : '일회'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">계약 시작일</p>
            <p className="text-lg font-medium">{formatDate(subscription.contractStartDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">상태</p>
            <p className={`text-lg font-medium ${subscription.isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {subscription.isActive ? '활성' : '비활성'}
            </p>
          </div>
        </div>
        {subscription.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">메모</p>
            <p className="text-lg">{subscription.notes}</p>
          </div>
        )}
      </div>

      {/* Cancellation Info */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
        <h2 className="text-lg font-bold mb-4">취소 정보</h2>
        {subscription.contractType === 'one_time' ? (
          <p className="text-gray-600 dark:text-gray-400">일회 계약이므로 취소 정보가 없습니다</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">다음 취소 가능 일자:</span>{' '}
              {cancellation.nextCancellationDate ? formatDate(cancellation.nextCancellationDate) : '계산 불가'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">상태:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  cancellation.status === 'available'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {cancellation.status === 'available' ? '취소 가능' : '대기 중'}
                {cancellation.daysRemaining && ` (${cancellation.daysRemaining}일 남음)`}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Price History Timeline */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
        <h2 className="text-lg font-bold mb-6">가격 인상 이력</h2>

        {priceHistory.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            가격 변경 이력이 없습니다
          </p>
        ) : (
          <div className="space-y-4">
            {priceHistory.map((history) => (
              <div key={history.id} className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">
                      {formatDate(history.changeDate)}
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {formatKRW(history.previousPrice)} → {formatKRW(history.newPrice)}
                    </p>
                    {history.changeReason && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        이유: {history.changeReason}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    history.newPrice > history.previousPrice
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {history.newPrice > history.previousPrice ? '+' : ''}{formatKRW(history.newPrice - history.previousPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
          <a
            href={`/subscriptions?addPrice=${subscription.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + 가격 변경 기록 추가
          </a>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <a href="/subscriptions" className="text-blue-600 hover:text-blue-700 font-medium">
          ← 구독 목록으로 돌아가기
        </a>
      </div>
    </div>
  )
}
