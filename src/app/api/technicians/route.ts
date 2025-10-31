import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const available = searchParams.get('available')

    const where: any = {}
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { expertise: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Handle available parameter - for now, all technicians are considered available
    // This parameter can be used later to filter technicians based on availability status
    if (available === 'true') {
      // Currently all technicians are available for user assignment
      // In the future, you might want to add logic to filter by active status, current assignments, etc.
    }

    const technicians = await db.technician.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(technicians)
  } catch (error) {
    console.error('Error fetching technicians:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technicians' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, type, expertise } = body

    const technician = await db.technician.create({
      data: {
        name,
        phone,
        address,
        type: type || 'FREELANCE',
        expertise
      }
    })

    return NextResponse.json(technician, { status: 201 })
  } catch (error) {
    console.error('Error creating technician:', error)
    return NextResponse.json(
      { error: 'Failed to create technician' },
      { status: 500 }
    )
  }
}