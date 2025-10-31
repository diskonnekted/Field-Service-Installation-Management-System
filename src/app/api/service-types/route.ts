import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const serviceTypes = await db.serviceType.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(serviceTypes)
  } catch (error) {
    console.error('Error fetching service types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, price } = body

    const serviceType = await db.serviceType.create({
      data: {
        name,
        category,
        description,
        price: price ? parseFloat(price) : null
      }
    })

    return NextResponse.json(serviceType, { status: 201 })
  } catch (error) {
    console.error('Error creating service type:', error)
    return NextResponse.json(
      { error: 'Failed to create service type' },
      { status: 500 }
    )
  }
}