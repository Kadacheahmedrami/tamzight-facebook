import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type') || 'posts'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const memberId = params.id
    const currentUserId = session?.user?.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      )
    }

    // Check privacy - for now, all content is public, but you can add privacy logic here
    const isOwnProfile = currentUserId === memberId
    
    // Check if users are friends (for private content access)
    let areFriends = false
    if (!isOwnProfile && currentUserId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: currentUserId, friendId: memberId },
            { userId: memberId, friendId: currentUserId }
          ]
        }
      })
      areFriends = !!friendship
    }

    const commonSelect = {
      id: true,
      title: true,
      content: true,
      timestamp: true,
      category: true,
      subcategory: true,
      image: true,
      views: true,
      createdAt: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true
        }
      }
    }

    const commonWhere = {
      authorId: memberId
    }

    const commonOptions = {
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' as const } // Changed from timestamp to createdAt
    }

    let data: any[] = []

    switch (contentType) {
      case 'posts':
        data = await prisma.post.findMany({
          where: commonWhere,
          select: commonSelect,
          ...commonOptions
        })
        break

      case 'books':
        data = await prisma.book.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            pages: true,
            language: true,
            isbn: true
          },
          ...commonOptions
        })
        break

      case 'ideas':
        data = await prisma.idea.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            status: true,
            priority: true,
            votes: true
          },
          ...commonOptions
        })
        break

      case 'images':
        data = await prisma.image.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            description: true,
            location: true,
            resolution: true,
            tags: true
          },
          ...commonOptions
        })
        break

      case 'videos':
        data = await prisma.video.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            duration: true,
            quality: true,
            language: true
          },
          ...commonOptions
        })
        break

      case 'truths':
        data = await prisma.truth.findMany({
          where: commonWhere,
          select: commonSelect,
          ...commonOptions
        })
        break

      case 'questions':
        data = await prisma.question.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            type: true,
            answered: true
          },
          ...commonOptions
        })
        break

      case 'ads':
        data = await prisma.ad.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            targetAmount: true,
            currentAmount: true,
            deadline: true
          },
          ...commonOptions
        })
        break

      case 'products':
        data = await prisma.product.findMany({
          where: commonWhere,
          select: {
            ...commonSelect,
            price: true,
            currency: true,
            inStock: true,
            sizes: true,
            colors: true
          },
          ...commonOptions
        })
        break

      case 'shares':
        // Get items that this user has shared
        const shares = await prisma.share.findMany({
          where: { userId: memberId },
          select: {
            id: true,
            createdAt: true,
            // Include the related content with proper select
            post: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            book: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            idea: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            image: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            video: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            truth: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            question: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            ad: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            },
            product: { 
              select: {
                ...commonSelect,
                author: { select: { firstName: true, lastName: true, avatar: true } }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        })

        // Transform shares data to include the shared content
        data = shares.map(share => {
          const sharedContent = share.post || share.book || share.idea || 
                               share.image || share.video || share.truth || 
                               share.question || share.ad || share.product

          if (!sharedContent) return null

          return {
            ...sharedContent,
            shareId: share.id,
            sharedAt: share.createdAt,
            isShared: true
          }
        }).filter(item => item !== null) // Remove any null results
        break

      case 'interactions':
        // Get recent likes and comments by this user
        const [recentLikes, recentComments] = await Promise.all([
          prisma.like.findMany({
            where: { userId: memberId },
            select: {
              id: true,
              createdAt: true,
              emoji: true,
              post: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              book: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              idea: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              image: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              video: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: Math.floor(limit / 2)
          }),
          prisma.comment.findMany({
            where: { userId: memberId },
            select: {
              id: true,
              content: true,
              createdAt: true,
              post: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              book: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              idea: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              image: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
              video: { select: { id: true, title: true, authorId: true, author: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: Math.ceil(limit / 2)
          })
        ])

        // Combine and sort interactions
        const interactions = [
          ...recentLikes.map(like => ({
            id: like.id,
            type: 'like',
            timestamp: like.createdAt,
            emoji: like.emoji,
            targetContent: like.post || like.book || like.idea || like.image || like.video,
          })),
          ...recentComments.map(comment => ({
            id: comment.id,
            type: 'comment',
            timestamp: comment.createdAt,
            content: comment.content,
            targetContent: comment.post || comment.book || comment.idea || comment.image || comment.video,
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        data = interactions.slice(0, limit)
        break

      case 'friends':
        // Only show friends list if it's own profile or if users are friends
        if (!isOwnProfile && !areFriends) {
          return NextResponse.json(
            { error: 'غير مصرح لك بمشاهدة قائمة الأصدقاء' },
            { status: 403 }
          )
        }

        const friendships = await prisma.friendship.findMany({
          where: {
            OR: [
              { userId: memberId },
              { friendId: memberId }
            ]
          },
          select: {
            id: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                image: true,
                location: true,
                occupation: true
              }
            },
            friend: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                image: true,
                location: true,
                occupation: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        })

        // Transform to get the friend (not the current user)
        data = friendships.map(friendship => {
          const friend = friendship.user.id === memberId ? friendship.friend : friendship.user
          return {
            id: friend.id,
            firstName: friend.firstName,
            lastName: friend.lastName,
            avatar: friend.avatar || friend.image,
            location: friend.location,
            occupation: friend.occupation,
            friendsSince: friendship.createdAt
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'نوع المحتوى غير صحيح' },
          { status: 400 }
        )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching member content:', error)
    return NextResponse.json(
      { error: 'خطأ في تحميل المحتوى' },
      { status: 500 }
    )
  }
}