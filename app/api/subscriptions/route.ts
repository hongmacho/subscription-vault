export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionRepository } from '@/db/repositories/subscription-repository'

export async function GET(_: NextRequest) {
  try {
    const repo = new SubscriptionRepository()
    const subscriptions = await repo.findAll()
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('GET /api/subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const repo = new SubscriptionRepository()

    const created = await repo.create(data)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('POST /api/subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
