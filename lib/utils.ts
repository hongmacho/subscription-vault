import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Subscription, ContractType } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return dateStr
  }
}

export function calculateMonthlyForecast(
  subscriptions: Subscription[],
  numMonths: number = 12
): Array<{ month: string; totalCost: number; count: number }> {
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  if (activeSubscriptions.length === 0) {
    return []
  }

  const forecast: Array<{ month: string; totalCost: number; count: number }> =
    []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  for (let i = 0; i < numMonths; i++) {
    const date = new Date(currentYear, currentMonth + i, 1)
    const monthStr = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
    })

    let totalCost = 0
    let count = 0

    activeSubscriptions.forEach((sub) => {
      // Check if subscription will be billed in this month
      const billingDay = sub.billingDayOfMonth
      const maxDayInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        .getDate()
      const actualBillingDay = Math.min(billingDay, maxDayInMonth)

      totalCost += sub.monthlyPrice
      count += 1
    })

    forecast.push({ month: monthStr, totalCost, count })
  }

  return forecast
}

export function calculateCancellationDate(
  contractStartDate: string,
  contractType: string,
  currentDate: Date = new Date()
): {
  nextCancellationDate: string | null
  canCancelNow: boolean
  daysRemaining: number | null
  status: 'available' | 'pending' | 'one_time'
} {
  if (contractType === ContractType.ONE_TIME) {
    return {
      nextCancellationDate: null,
      canCancelNow: false,
      daysRemaining: null,
      status: 'one_time',
    }
  }

  try {
    const startDate = new Date(contractStartDate + 'T00:00:00')
    let nextDate: Date

    if (contractType === ContractType.MONTHLY) {
      // Calculate next billing date (same day each month)
      nextDate = new Date(startDate)
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else if (contractType === ContractType.ANNUAL) {
      // Calculate next billing date (same day next year)
      nextDate = new Date(startDate)
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    } else {
      return {
        nextCancellationDate: null,
        canCancelNow: false,
        daysRemaining: null,
        status: 'pending',
      }
    }

    const nextCancellationDate = nextDate.toISOString().split('T')[0]
    const canCancelNow = currentDate >= startDate
    const daysRemaining = Math.ceil(
      (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      nextCancellationDate,
      canCancelNow,
      daysRemaining: canCancelNow ? daysRemaining : null,
      status: canCancelNow ? 'available' : 'pending',
    }
  } catch {
    return {
      nextCancellationDate: null,
      canCancelNow: false,
      daysRemaining: null,
      status: 'pending',
    }
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    streaming: '#ef4444',
    productivity_sw: '#3b82f6',
    dev_sw: '#a855f7',
    cloud_storage: '#06b6d4',
    email_collab: '#10b981',
    learning: '#f97316',
    gaming: '#ec4899',
    music_podcast: '#eab308',
    health_fitness: '#84cc16',
    vpn_security: '#64748b',
    payment_finance: '#06b6d4',
    other: '#9ca3af',
  }
  return colors[category] || '#9ca3af'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    streaming: '스트리밍',
    productivity_sw: '소프트웨어 - 생산성',
    dev_sw: '소프트웨어 - 개발',
    cloud_storage: '클라우드 스토리지',
    email_collab: '이메일 & 협업',
    learning: '구독형 학습',
    gaming: '게이밍',
    music_podcast: '뮤직 & 팟캐스트',
    health_fitness: '건강 & 피트니스',
    vpn_security: 'VPN & 보안',
    payment_finance: '결제 & 금융',
    other: '기타',
  }
  return labels[category] || category
}
