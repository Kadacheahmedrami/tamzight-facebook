import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth' // Adjust path to your auth config
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the user ID from params (Next.js 15 async params)
    const { id } = await params
    
    // Get the authenticated session
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    
    // Check if the authenticated user is trying to edit their own profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own profile' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    // Validate and extract allowed fields for update
    const {
      firstName,
      lastName,
      bio,
      location,
      occupation,
      avatar,
      coverImage
    } = body
    
    // Basic validation
    if (firstName && typeof firstName !== 'string') {
      return NextResponse.json(
        { error: 'First name must be a string' },
        { status: 400 }
      )
    }
    
    if (lastName && typeof lastName !== 'string') {
      return NextResponse.json(
        { error: 'Last name must be a string' },
        { status: 400 }
      )
    }
    
    if (bio && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Bio must be a string' },
        { status: 400 }
      )
    }
    
    if (location && typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Location must be a string' },
        { status: 400 }
      )
    }
    
    if (occupation && typeof occupation !== 'string') {
      return NextResponse.json(
        { error: 'Occupation must be a string' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData: any = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (occupation !== undefined) updateData.occupation = occupation
    if (avatar !== undefined) updateData.avatar = avatar
    if (coverImage !== undefined) updateData.coverImage = coverImage
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        occupation: true,
        avatar: true,
        coverImage: true,
        joinDate: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the user ID from params
    const { id } = await params
    
    // Get the authenticated session
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    
    // Check if the authenticated user is trying to view their own profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only view your own profile edit data' },
        { status: 403 }
      )
    }
    
    // Get user data for editing
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        occupation: true,
        avatar: true,
        coverImage: true,
        joinDate: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}