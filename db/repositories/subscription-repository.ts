import { eq, like, and, gte, lte } from 'drizzle-orm'
import { db } from '../db'
import { subscriptions } from '../schema'
import {
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '@/lib/types'

export class SubscriptionRepository {
  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    const result = await db
      .insert(subscriptions)
      .values({
        ...data,
        isActive: data.isActive ?? true,
      })
      .returning()

    return result[0] as unknown as Subscription
  }

  async findById(id: number): Promise<Subscription | null> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1)

    return (result[0] as unknown as Subscription) || null
  }

  async findAll(): Promise<Subscription[]> {
    const result = await db.select().from(subscriptions)
    return result as unknown as Subscription[]
  }

  async findActive(): Promise<Subscription[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isActive, true))

    return result as unknown as Subscription[]
  }

  async findByCategory(category: string): Promise<Subscription[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.category, category))

    return result as unknown as Subscription[]
  }

  async search(query: string): Promise<Subscription[]> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(like(subscriptions.name, `%${query}%`))

    return result as unknown as Subscription[]
  }

  async filter(params: {
    search?: string
    categories?: string[]
    minPrice?: number
    maxPrice?: number
    isActive?: boolean
  }): Promise<Subscription[]> {
    let allResults = await this.findAll()

    // Apply filters in JavaScript
    if (params.search) {
      allResults = allResults.filter((sub) =>
        sub.name.toLowerCase().includes(params.search!.toLowerCase())
      )
    }

    if (params.categories && params.categories.length > 0) {
      allResults = allResults.filter((sub) =>
        params.categories!.includes(sub.category)
      )
    }

    if (params.minPrice !== undefined) {
      allResults = allResults.filter((sub) => sub.monthlyPrice >= params.minPrice!)
    }

    if (params.maxPrice !== undefined) {
      allResults = allResults.filter((sub) => sub.monthlyPrice <= params.maxPrice!)
    }

    if (params.isActive !== undefined) {
      allResults = allResults.filter((sub) => sub.isActive === params.isActive)
    }

    return allResults
  }

  async update(
    id: number,
    data: UpdateSubscriptionInput
  ): Promise<Subscription | null> {
    const result = await db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: Date.now() as never,
      })
      .where(eq(subscriptions.id, id))
      .returning()

    return (result[0] as unknown as Subscription) || null
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))

    return result.changes > 0
  }

  async toggle(id: number): Promise<Subscription | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    return this.update(id, {
      isActive: !existing.isActive,
    })
  }
}
