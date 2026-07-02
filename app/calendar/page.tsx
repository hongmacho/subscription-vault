import { SubscriptionRepository } from '@/db/repositories/subscription-repository'
import { formatKRW } from '@/lib/utils'
import Link from 'next/link'

async function getCalendarData() {
  try {
    const repo = new SubscriptionRepository()
    const subscriptions = await repo.findActive()
    return subscriptions
  } catch (error) {
    console.error('Failed to load subscriptions:', error)
    return []
  }
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const calendar: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    calendar.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push(day)
  }

  return calendar
}

interface CalendarProps {
  year: number
  month: number
  subscriptions: Awaited<ReturnType<typeof getCalendarData>>
}

function CalendarMonth({ year, month, subscriptions }: CalendarProps) {
  const calendar = getMonthCalendar(year, month)
  const monthName = new Date(year, month).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
      <h2 className="text-xl font-bold mb-4">{monthName}</h2>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center font-medium text-gray-600 dark:text-gray-400 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendar.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-32 p-2 border rounded-lg ${
              day === null
                ? 'bg-gray-50 dark:bg-slate-800'
                : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-700'
            }`}
          >
            {day && (
              <>
                <p className="font-bold mb-2">{day}</p>
                <div className="space-y-1">
                  {subscriptions
                    .filter((sub) => sub.billingDayOfMonth === day)
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded truncate"
                        title={`${sub.name}: ${formatKRW(sub.monthlyPrice)}`}
                      >
                        {sub.name}
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function CalendarPage() {
  const subscriptions = await getCalendarData()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Show current month and next 2 months
  const months = [0, 1, 2].map((offset) => {
    const date = new Date(currentYear, currentMonth + offset)
    return { year: date.getFullYear(), month: date.getMonth() }
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">결제 캘린더</h1>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 mb-8">등록된 구독이 없습니다</p>
          <Link href="/subscriptions"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            구독 추가하기
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {months.map((m) => (
              <CalendarMonth
                key={`${m.year}-${m.month}`}
                year={m.year}
                month={m.month}
                subscriptions={subscriptions}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-800">
            <h2 className="text-lg font-bold mb-4">구독 일정</h2>
            <div className="space-y-2">
              {[...subscriptions]
                .sort((a, b) => a.billingDayOfMonth - b.billingDayOfMonth)
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded"
                  >
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        매월 {sub.billingDayOfMonth}일
                      </p>
                    </div>
                    <p className="font-bold">{formatKRW(sub.monthlyPrice)}</p>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
