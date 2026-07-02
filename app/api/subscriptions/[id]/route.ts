export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionRepository } from '@/db/repositories/subscription-repository'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const repo = new SubscriptionRepository()
    const subscription = await repo.findById(Number(id))

    if (!subscription) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('GET /api/subscriptions/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await req.json()
    const repo = new SubscriptionRepository()

    const updated = await repo.update(Number(id), data)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/subscriptions/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const repo = new SubscriptionRepository()

    await repo.delete(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/subscriptions/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
