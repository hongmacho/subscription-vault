export enum SubscriptionCategory {
  STREAMING = 'streaming',
  PRODUCTIVITY_SW = 'productivity_sw',
  DEV_SW = 'dev_sw',
  CLOUD_STORAGE = 'cloud_storage',
  EMAIL_COLLAB = 'email_collab',
  LEARNING = 'learning',
  GAMING = 'gaming',
  MUSIC_PODCAST = 'music_podcast',
  HEALTH_FITNESS = 'health_fitness',
  VPN_SECURITY = 'vpn_security',
  PAYMENT_FINANCE = 'payment_finance',
  OTHER = 'other',
}

export enum ContractType {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time',
}

export interface Subscription {
  id: number
  name: string
  category: string
  monthlyPrice: number
  billingDayOfMonth: number
  contractStartDate: string
  contractType: string
  isActive: boolean
  notes?: string | null
  createdAt: number
  updatedAt: number
}

export interface PriceHistory {
  id: number
  subscriptionId: number
  previousPrice: number
  newPrice: number
  changeDate: string
  changeReason?: string | null
  createdAt: number
}

export interface AlternativeService {
  id: number
  subscriptionId: number
  serviceName: string
  monthlyPrice: number
  notes?: string | null
  createdAt: number
}

export interface CreateSubscriptionInput {
  name: string
  category: string
  monthlyPrice: number
  billingDayOfMonth: number
  contractStartDate: string
  contractType: string
  isActive?: boolean
  notes?: string
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {}

export const CATEGORY_COLORS: Record<string, string> = {
  [SubscriptionCategory.STREAMING]: '#ef4444',
  [SubscriptionCategory.PRODUCTIVITY_SW]: '#3b82f6',
  [SubscriptionCategory.DEV_SW]: '#a855f7',
  [SubscriptionCategory.CLOUD_STORAGE]: '#06b6d4',
  [SubscriptionCategory.EMAIL_COLLAB]: '#10b981',
  [SubscriptionCategory.LEARNING]: '#f97316',
  [SubscriptionCategory.GAMING]: '#ec4899',
  [SubscriptionCategory.MUSIC_PODCAST]: '#eab308',
  [SubscriptionCategory.HEALTH_FITNESS]: '#84cc16',
  [SubscriptionCategory.VPN_SECURITY]: '#64748b',
  [SubscriptionCategory.PAYMENT_FINANCE]: '#06b6d4',
  [SubscriptionCategory.OTHER]: '#9ca3af',
}

export const CATEGORY_LABELS: Record<string, string> = {
  [SubscriptionCategory.STREAMING]: '스트리밍',
  [SubscriptionCategory.PRODUCTIVITY_SW]: '소프트웨어 - 생산성',
  [SubscriptionCategory.DEV_SW]: '소프트웨어 - 개발',
  [SubscriptionCategory.CLOUD_STORAGE]: '클라우드 스토리지',
  [SubscriptionCategory.EMAIL_COLLAB]: '이메일 & 협업',
  [SubscriptionCategory.LEARNING]: '구독형 학습',
  [SubscriptionCategory.GAMING]: '게이밍',
  [SubscriptionCategory.MUSIC_PODCAST]: '뮤직 & 팟캐스트',
  [SubscriptionCategory.HEALTH_FITNESS]: '건강 & 피트니스',
  [SubscriptionCategory.VPN_SECURITY]: 'VPN & 보안',
  [SubscriptionCategory.PAYMENT_FINANCE]: '결제 & 금융',
  [SubscriptionCategory.OTHER]: '기타',
}
