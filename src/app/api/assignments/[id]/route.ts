import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await db.assignment.findUnique({
      where: { id: params.id },
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

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
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
    const {
      clientId,
      serviceTypeId,
      leadTechnicianId,
      startDate,
      endDate,
      status,
      notes,
      documentation,
      totalCost,
      manualCostOverride,
      assistantIds,
      equipment
    } = body

    // First, delete existing assistants and equipment
    await db.assignmentAssistant.deleteMany({
      where: { assignmentId: params.id }
    })
    
    await db.assignmentEquipment.deleteMany({
      where: { assignmentId: params.id }
    })

    // Update the assignment
    const assignment = await db.assignment.update({
      where: { id: params.id },
      data: {
        clientId,
        serviceTypeId,
        leadTechnicianId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        notes,
        documentation: documentation ? JSON.stringify(documentation) : null,
        totalCost: parseFloat(totalCost) || 0,
        manualCostOverride: Boolean(manualCostOverride),
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

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related records first
    await db.assignmentAssistant.deleteMany({
      where: { assignmentId: params.id }
    })
    
    await db.assignmentEquipment.deleteMany({
      where: { assignmentId: params.id }
    })

    // Delete the assignment
    await db.assignment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}