import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const serviceTypeId = searchParams.get('serviceTypeId')

    const where: any = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (serviceTypeId) where.serviceTypeId = serviceTypeId

    const assignments = await db.assignment.findMany({
      where,
      include: {
        client: true,
        serviceType: true,
        leadTechnician: true,
        assistants: {
          include: {
            technician: true
          }
        },
        equipment: {
          include: {
            equipment: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await db.assignment.count({ where })

    return NextResponse.json({
      assignments,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      serviceTypeId,
      leadTechnicianId,
      startDate,
      endDate,
      notes,
      documentation,
      totalCost,
      manualCostOverride,
      workLocation,
      latitude,
      longitude,
      assistantIds,
      equipment
    } = body

    // Create the assignment
    const assignment = await db.assignment.create({
      data: {
        clientId,
        serviceTypeId,
        leadTechnicianId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        documentation: documentation ? JSON.stringify(documentation) : null,
        totalCost: parseFloat(totalCost) || 0,
        manualCostOverride: Boolean(manualCostOverride),
        workLocation: workLocation || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        assistants: assistantIds ? {
          create: assistantIds.map((technicianId: string) => ({
            technicianId
          }))
        } : undefined,
        equipment: equipment ? {
          create: equipment.map((item: { equipmentId: string; quantity: number }) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity
          }))
        } : undefined
      },
      include: {
        client: true,
        serviceType: true,
        leadTechnician: true,
        assistants: {
          include: {
            technician: true
          }
        },
        equipment: {
          include: {
            equipment: true
          }
        }
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}