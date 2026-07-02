import { eq } from 'drizzle-orm'
import { db } from '../db'
import { alternativeServices } from '../schema'
import { AlternativeService } from '@/lib/types'

export interface CreateAlternativeServiceInput {
  subscriptionId: number
  serviceName: string
  monthlyPrice: number
  notes?: string
}

export class AlternativeServiceRepository {
  async create(
    data: CreateAlternativeServiceInput
  ): Promise<AlternativeService> {
    const result = await db
      .insert(alternativeServices)
      .values(data)
      .returning()

    return result[0] as unknown as AlternativeService
  }

  async findById(id: number): Promise<AlternativeService | null> {
    const result = await db
      .select()
      .from(alternativeServices)
      .where(eq(alternativeServices.id, id))
      .limit(1)

    return (result[0] as unknown as AlternativeService) || null
  }

  async findBySubscriptionId(
    subscriptionId: number
  ): Promise<AlternativeService[]> {
    const result = await db
      .select()
      .from(alternativeServices)
      .where(eq(alternativeServices.subscriptionId, subscriptionId))

    return result as unknown as AlternativeService[]
  }

  async findAll(): Promise<AlternativeService[]> {
    const result = await db.select().from(alternativeServices)
    return result as unknown as AlternativeService[]
  }

  async update(
    id: number,
    data: Partial<CreateAlternativeServiceInput>
  ): Promise<AlternativeService | null> {
    const result = await db
      .update(alternativeServices)
      .set(data)
      .where(eq(alternativeServices.id, id))
      .returning()

    return (result[0] as unknown as AlternativeService) || null
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(alternativeServices)
      .where(eq(alternativeServices.id, id))

    return result.changes > 0
  }
}
