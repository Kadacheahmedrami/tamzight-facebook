import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FOREIGN_KEY_MAP: Record<string, string> = {
  posts: 'postId', books: 'bookId', ideas: 'ideaId', images: 'imageId',
  videos: 'videoId', truths: 'truthId', questions: 'questionId', 
  ads: 'adId', products: 'productId',
}

const MODEL_MAP: Record<string, any> = {
  posts: prisma.post,
  books: prisma.book,
  ideas: prisma.idea,
  images: prisma.image,
  videos: prisma.video,
  truths: prisma.truth,
  questions: prisma.question,
  ads: prisma.ad,
  products: prisma.product,
}

const CONTENT_TYPE_FIELDS: Record<string, object> = {
  books: { pages: true, language: true, isbn: true, price: true, currency: true },
  ideas: { status: true, priority: true, votes: true },
  images: { description: true, location: true, resolution: true, tags: true },
  videos: { duration: true, quality: true, language: true },
  questions: { type: true, answered: true },
  ads: { targetAmount: true, currentAmount: true, deadline: true },
  products: { price: true, currency: true, inStock: true, sizes: true, colors: true },
}

const fetchReactions = async (contentIds: number[], contentType: string) => {
  const foreignKey = FOREIGN_KEY_MAP[contentType]
  if (!foreignKey || !contentIds.length) return { reactions: new Map(), userReactions: new Map() }

  try {
    const reactions = await prisma.like.findMany({
      where: { [foreignKey]: { in: contentIds } },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    })

    const reactionsMap = new Map()
    reactions.forEach(reaction => {
      const contentId = (reaction as any)[foreignKey]
      const key = `${contentType.slice(0, -1)}-${contentId}`
      if (!reactionsMap.has(key)) reactionsMap.set(key, [])
      reactionsMap.get(key).push({
        id: reaction.id,
        emoji: reaction.emoji,
        userId: reaction.userId,
        user: {
          id: reaction.user.id,
          firstName: reaction.user.firstName,
          lastName: reaction.user.lastName,
          avatar: reaction.user.avatar
        },
        createdAt: reaction.createdAt
      })
    })

    return { reactions: reactionsMap, userReactions: new Map() }
  } catch (error) {
    console.error(`Error fetching reactions:`, error)
    return { reactions: new Map(), userReactions: new Map() }
  }
}

const fetchUserReactions = async (userId: string, contentIds: number[], contentType: string) => {
  const foreignKey = FOREIGN_KEY_MAP[contentType]
  if (!foreignKey || !contentIds.length) return new Map()

  try {
    const userReactions = await prisma.like.findMany({
      where: { userId, [foreignKey]: { in: contentIds } },
      select: { [foreignKey]: true, emoji: true }
    })

    const userReactionsMap = new Map()
    userReactions.forEach(reaction => {
      const contentId = (reaction as any)[foreignKey]
      userReactionsMap.set(`${contentType.slice(0, -1)}-${contentId}`, reaction.emoji)
    })

    return userReactionsMap
  } catch (error) {
    console.error(`Error fetching user reactions:`, error)
    return new Map()
  }
}

const processReactionDetails = (reactions: any[]) => {
  if (!reactions.length) return { total: 0, summary: [], details: {} }

  const grouped = reactions.reduce((acc, reaction) => {
    if (!reaction.emoji) return acc
    if (!acc[reaction.emoji]) acc[reaction.emoji] = []
    acc[reaction.emoji].push({
      userId: reaction.user.id,
      userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
      userAvatar: reaction.user.avatar,
      createdAt: reaction.createdAt
    })
    return acc
  }, {})

  const summary = Object.entries(grouped).map(([emoji, users]) => ({
    emoji, count: (users as any[]).length, users
  }))

  return {
    total: summary.reduce((sum, reaction) => sum + reaction.count, 0),
    summary,
    details: grouped
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type') || 'posts'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const { id: memberId } = await params
    const currentUserId = session?.user?.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'العضو غير موجود' }, { status: 404 })
    }

    const isOwnProfile = currentUserId === memberId

    // Check friendship for friends list access
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

    // Handle special content types
    if (contentType === 'friends') {
      if (!isOwnProfile && !areFriends) {
        return NextResponse.json({ error: 'غير مصرح لك بمشاهدة قائمة الأصدقاء' }, { status: 403 })
      }

      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ userId: memberId }, { friendId: memberId }]
        },
        select: {
          id: true,
          createdAt: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true, image: true, location: true, occupation: true } },
          friend: { select: { id: true, firstName: true, lastName: true, avatar: true, image: true, location: true, occupation: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })

      const data = friendships.map(friendship => {
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

      return NextResponse.json(data)
    }

    if (contentType === 'interactions') {
      const [recentLikes, recentComments] = await Promise.all([
        prisma.like.findMany({
          where: { userId: memberId },
          select: {
            id: true, createdAt: true, emoji: true,
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
            id: true, content: true, createdAt: true,
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

      const interactions = [
        ...recentLikes.map(like => ({
          id: like.id, type: 'like', timestamp: like.createdAt, emoji: like.emoji,
          targetContent: like.post || like.book || like.idea || like.image || like.video,
        })),
        ...recentComments.map(comment => ({
          id: comment.id, type: 'comment', timestamp: comment.createdAt, content: comment.content,
          targetContent: comment.post || comment.book || comment.idea || comment.image || comment.video,
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return NextResponse.json(interactions.slice(0, limit))
    }

    if (contentType === 'shares') {
      const commonSelect = {
        id: true, title: true, content: true, timestamp: true, category: true,
        subcategory: true, image: true, media: true, views: true, createdAt: true,
        _count: { select: { likes: true, comments: true, shares: true } }
      }

      const shares = await prisma.share.findMany({
        where: { userId: memberId },
        select: {
          id: true, createdAt: true,
          post: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          book: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          idea: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          image: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          video: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          truth: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          question: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          ad: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
          product: { select: { ...commonSelect, author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } }
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' }
      })

      const data = shares.map(share => {
        const sharedContent = share.post || share.book || share.idea || share.image || 
                             share.video || share.truth || share.question || share.ad || share.product
        if (!sharedContent) return null
        return {
          ...sharedContent,
          shareId: share.id,
          sharedAt: share.createdAt,
          isShared: true,
          images: [],
          media: sharedContent.media || []
        }
      }).filter(Boolean)

      return NextResponse.json(data)
    }

    // Handle regular content types
    const model = MODEL_MAP[contentType]
    if (!model) {
      return NextResponse.json({ error: 'نوع المحتوى غير صحيح' }, { status: 400 })
    }

    const baseSelect = {
      id: true, title: true, content: true, timestamp: true, category: true,
      subcategory: true, image: true, media: true, views: true, createdAt: true,
      _count: { select: { likes: true, comments: true, shares: true } }
    }

    const typeSpecificFields = CONTENT_TYPE_FIELDS[contentType] || {}
    const selectFields = { ...baseSelect, ...typeSpecificFields }

    const data = await model.findMany({
      where: { authorId: memberId },
      select: selectFields,
      skip, take: limit,
      orderBy: { createdAt: 'desc' }
    })

    if (data.length === 0) {
      return NextResponse.json([])
    }

    // Fetch reactions
    const contentIds = data.map((item: any) => item.id)
    const [{ reactions: reactionsData }, userReactionsMap] = await Promise.all([
      fetchReactions(contentIds, contentType),
      currentUserId ? fetchUserReactions(currentUserId, contentIds, contentType) : Promise.resolve(new Map())
    ])

    const contentTypeSingular = contentType.slice(0, -1)
    const enrichedData = data.map((item: any) => {
      const key = `${contentTypeSingular}-${item.id}`
      const reactions = reactionsData.get(key) || []
      const userReaction = userReactionsMap.get(key) || null

      return {
        ...item,
        type: contentTypeSingular,
        images: [],
        media: item.media || [],
        reactions,
        userHasLiked: !!userReaction,
        userReaction,
        reactionDetails: processReactionDetails(reactions)
      }
    })

    return NextResponse.json(enrichedData)

  } catch (error) {
    console.error('Error fetching member content:', error)
    return NextResponse.json({ error: 'خطأ في تحميل المحتوى' }, { status: 500 })
  }
}