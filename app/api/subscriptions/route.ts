import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionRepository } from '@/db/repositories/subscription-repository'

export async function GET() {
  try {
    const repo = new SubscriptionRepository()
    const subscriptions = await repo.findAll()
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const repo = new SubscriptionRepository()
    const subscription = await repo.create(data)
    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
