import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email in the new User table first
    let user = await db.user.findUnique({
      where: { email },
      include: {
        technician: true
      }
    })

    // If not found in User table, check Admin table for backward compatibility
    if (!user) {
      const admin = await db.admin.findUnique({
        where: { email }
      })

      if (admin) {
        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          )
        }

        // Create session token for admin (backward compatibility)
        const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64')

        return NextResponse.json({
          success: true,
          user: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'ADMIN'
          },
          token
        })
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        technicianId: user.technicianId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        role: userWithoutPassword.role,
        phone: userWithoutPassword.phone,
        avatar: userWithoutPassword.avatar,
        technicianId: userWithoutPassword.technicianId,
        technician: userWithoutPassword.technician
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}