// app/api/main/member/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper function to determine friendship status
async function getFriendshipStatus(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) {
    return 'none' // Own profile, no friendship status needed
  }

  // Check for existing friendship first (highest priority)
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: currentUserId, friendId: targetUserId },
        { userId: targetUserId, friendId: currentUserId }
      ]
    }
  })

  if (friendship) {
    return 'friends'
  }

  // Check for pending friend requests
  const sentRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: currentUserId,
      receiverId: targetUserId,
      status: 'pending'
    }
  })

  if (sentRequest) {
    return 'pending_sent'
  }

  const receivedRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: targetUserId,
      receiverId: currentUserId,
      status: 'pending'
    }
  })

  if (receivedRequest) {
    return 'pending_received'
  }

  return 'none'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: memberId } = await params
    const currentUserId = session?.user?.id as string

    // Find the member
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        image: true,
        coverImage: true,
        bio: true,
        location: true,
        occupation: true,
        joinDate: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            books: true,
            ideas: true,
            images: true,
            videos: true,
            truths: true,
            questions: true,
            ads: true,
            products: true,
            likes: true,
            comments: true,
            shares: true,
            friendships: true,
            friendOf: true,
          }
        },
        badges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              }
            }
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    const isOwnProfile = currentUserId === memberId
    
    // Get friendship status using the helper function
    const friendshipStatus = currentUserId ? 
      await getFriendshipStatus(currentUserId, memberId) : 'none'

    const responseData = {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: isOwnProfile ? member.email : undefined,
      avatar: member.avatar || member.image,
      coverImage: member.coverImage,
      bio: member.bio,
      location: member.location,
      occupation: member.occupation,
      joinDate: member.joinDate || member.createdAt,
      _count: member._count,
      badges: member.badges,
      friendshipStatus,
      isOwnProfile
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching member data:', error)
    return NextResponse.json(
      { error: 'خطأ في تحميل البيانات' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

    const currentUserId = session.user.id as string
    const { id: targetUserId } = await params
    const { action } = await request.json()

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'لا يمكنك إجراء هذا العمل على ملفك الشخصي' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    // Get current friendship status before any action
    const currentStatus = await getFriendshipStatus(currentUserId, targetUserId)
    
    switch (action) {
      case 'send':
        // Only allow sending if status is 'none'
        if (currentStatus !== 'none') {
          return NextResponse.json(
            { error: 'لا يمكن إرسال طلب الصداقة في الوقت الحالي' },
            { status: 400 }
          )
        }

        await prisma.friendRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: targetUserId,
            status: 'pending'
          }
        })

        // Create notification
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: 'friend_request',
            message: 'أرسل لك طلب صداقة'
          }
        })

        return NextResponse.json({ 
          success: true, 
          message: 'تم إرسال طلب الصداقة',
          friendshipStatus: 'pending_sent'
        })

      case 'accept':
        // Only allow accepting if there's a pending received request
        if (currentStatus !== 'pending_received') {
          return NextResponse.json(
            { error: 'لا يوجد طلب صداقة للقبول' },
            { status: 400 }
          )
        }

        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            senderId: targetUserId,
            receiverId: currentUserId,
            status: 'pending'
          }
        })

        if (!friendRequest) {
          return NextResponse.json(
            { error: 'طلب الصداقة غير موجود' },
            { status: 404 }
          )
        }

        await prisma.$transaction([
          // Update request status
          prisma.friendRequest.update({
            where: { id: friendRequest.id },
            data: { status: 'accepted' }
          }),
          // Create friendship
          prisma.friendship.create({
            data: {
              userId: currentUserId,
              friendId: targetUserId
            }
          }),
          // Create notification
          prisma.notification.create({
            data: {
              userId: targetUserId,
              type: 'friend_accept',
              message: 'قبل طلب صداقتك'
            }
          })
        ])

        return NextResponse.json({ 
          success: true, 
          message: 'تم قبول طلب الصداقة',
          friendshipStatus: 'friends'
        })

      case 'cancel':
        // Allow canceling only for pending_sent or pending_received
        if (!['pending_sent', 'pending_received'].includes(currentStatus)) {
          return NextResponse.json(
            { error: 'لا يوجد طلب للإلغاء' },
            { status: 400 }
          )
        }

        await prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: targetUserId },
              { senderId: targetUserId, receiverId: currentUserId }
            ],
            status: 'pending'
          }
        })

        return NextResponse.json({ 
          success: true, 
          message: 'تم إلغاء الطلب',
          friendshipStatus: 'none'
        })

      case 'remove':
        // Only allow removing if they are friends
        if (currentStatus !== 'friends') {
          return NextResponse.json(
            { error: 'لستما أصدقاء' },
            { status: 400 }
          )
        }

        await prisma.$transaction([
          // Remove friendship records
          prisma.friendship.deleteMany({
            where: {
              OR: [
                { userId: currentUserId, friendId: targetUserId },
                { userId: targetUserId, friendId: currentUserId }
              ]
            }
          }),
          // Remove any related friend requests (both pending and accepted)
          prisma.friendRequest.deleteMany({
            where: {
              OR: [
                { senderId: currentUserId, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: currentUserId }
              ]
              // Remove the status filter to delete all related requests
            }
          })
        ])

        return NextResponse.json({ 
          success: true, 
          message: 'تم إلغاء الصداقة',
          friendshipStatus: 'none'
        })

      default:
        return NextResponse.json(
          { error: 'عملية غير صحيحة' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error handling friendship action:', error)
    return NextResponse.json(
      { error: 'خطأ في العملية' },
      { status: 500 }
    )
  }
}