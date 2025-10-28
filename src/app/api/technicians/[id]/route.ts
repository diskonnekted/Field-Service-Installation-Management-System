import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technician = await db.technician.findUnique({
      where: { id: params.id }
    })

    if (!technician) {
      return NextResponse.json(
        { error: 'Technician not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(technician)
  } catch (error) {
    console.error('Error fetching technician:', error)
    return NextResponse.json(
      { error: 'Failed to fetch technician' },
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
    const { name, phone, address, type, expertise } = body

    const technician = await db.technician.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        address,
        type: type || 'FREELANCE',
        expertise
      }
    })

    return NextResponse.json(technician)
  } catch (error) {
    console.error('Error updating technician:', error)
    return NextResponse.json(
      { error: 'Failed to update technician' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.technician.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting technician:', error)
    return NextResponse.json(
      { error: 'Failed to delete technician' },
      { status: 500 }
    )
  }
}