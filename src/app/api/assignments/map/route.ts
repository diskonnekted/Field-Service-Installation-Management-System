import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {
      latitude: { not: null },
      longitude: { not: null }
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const assignments = await db.assignment.findMany({
      where,
      include: {
        client: true,
        serviceType: true,
        leadTechnician: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching map assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments for map' },
      { status: 500 }
    )
  }
}