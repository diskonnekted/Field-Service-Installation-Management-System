import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceType = await db.serviceType.findUnique({
      where: { id: params.id }
    })

    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(serviceType)
  } catch (error) {
    console.error('Error fetching service type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service type' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, category, description, price } = body

    const serviceType = await db.serviceType.update({
      where: { id: params.id },
      data: {
        name,
        category,
        description,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined
      }
    })

    return NextResponse.json(serviceType)
  } catch (error) {
    console.error('Error updating service type:', error)
    return NextResponse.json(
      { error: 'Failed to update service type' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.serviceType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service type:', error)
    return NextResponse.json(
      { error: 'Failed to delete service type' },
      { status: 500 }
    )
  }
}