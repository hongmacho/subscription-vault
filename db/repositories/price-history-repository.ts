import { eq } from 'drizzle-orm'
import { db } from '../db'
import { priceHistories } from '../schema'
import { PriceHistory } from '@/lib/types'

export interface CreatePriceHistoryInput {
  subscriptionId: number
  previousPrice: number
  newPrice: number
  changeDate: string
  changeReason?: string
}

export class PriceHistoryRepository {
  async create(data: CreatePriceHistoryInput): Promise<PriceHistory> {
    const result = await db
      .insert(priceHistories)
      .values(data)
      .returning()

    return result[0] as unknown as PriceHistory
  }

  async findById(id: number): Promise<PriceHistory | null> {
    const result = await db
      .select()
      .from(priceHistories)
      .where(eq(priceHistories.id, id))
      .limit(1)

    return (result[0] as unknown as PriceHistory) || null
  }

  async findBySubscriptionId(subscriptionId: number): Promise<PriceHistory[]> {
    const result = await db
      .select()
      .from(priceHistories)
      .where(eq(priceHistories.subscriptionId, subscriptionId))
      .orderBy(priceHistories.changeDate)

    return result as unknown as PriceHistory[]
  }

  async findAll(): Promise<PriceHistory[]> {
    const result = await db.select().from(priceHistories)
    return result as unknown as PriceHistory[]
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(priceHistories)
      .where(eq(priceHistories.id, id))

    return result.changes > 0
  }
}
