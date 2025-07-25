import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

// Helper function to format timestamps
const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "الآن"
  if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`
  if (diffInMinutes < 1440) return `قبل ${Math.floor(diffInMinutes / 60)} ساعة`
  return `قبل ${Math.floor(diffInMinutes / 1440)} يوم`
}

// GET: Retrieve all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    // Get session - check both regular session and server-side header
    const session = await getServerSession(authOptions)
    const headerUserId = request.headers.get("x-user-id")

    const currentUserId = session?.user?.id || headerUserId

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all direct messages where current user is sender or recipient
    const directMessages = await prisma.groupMessage.findMany({
      where: {
        OR: [
          // Messages sent by current user
          {
            senderId: currentUserId,
            message: {
              startsWith: "DM_",
            },
          },
          // Messages received by current user (JSON format)
          {
            message: {
              contains: `"recipientId":"${currentUserId}"`,
            },
          },
          // Messages where current user is part of conversation ID
          {
            message: {
              contains: `_${currentUserId}_`,
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    })

    // Group messages by conversation and get the latest message for each
    const conversationMap = new Map()

    for (const message of directMessages) {
      let otherUserId
      let conversationId

      // Determine the other user and conversation ID
      if (message.message.startsWith("DM_")) {
        const parts = message.message.split(":")
        conversationId = parts[0].replace("DM_", "")
        const userIds = conversationId.split("_")
        otherUserId = userIds.find((id) => id !== currentUserId)
      } else if (message.message.startsWith("{")) {
        try {
          const parsed = JSON.parse(message.message)
          if (parsed.recipientId && message.senderId === currentUserId) {
            otherUserId = parsed.recipientId
            conversationId = parsed.conversationId || [currentUserId, otherUserId].sort().join("_")
          } else if (parsed.recipientId === currentUserId) {
            otherUserId = message.senderId
            conversationId = parsed.conversationId || [currentUserId, otherUserId].sort().join("_")
          }
        } catch (e) {
          continue
        }
      }

      if (!otherUserId || !conversationId) continue

      // Check if we already have a more recent message for this conversation
      const existing = conversationMap.get(conversationId)
      if (!existing || message.timestamp > existing.timestamp) {
        conversationMap.set(conversationId, {
          ...message,
          otherUserId,
          conversationId,
        })
      }
    }

    // Get user details for all other participants
    const otherUserIds = Array.from(conversationMap.values()).map((conv) => conv.otherUserId)

    if (otherUserIds.length === 0) {
      return NextResponse.json([])
    }

    const otherUsers = await prisma.user.findMany({
      where: {
        id: { in: otherUserIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      },
    })

    const userMap = new Map(otherUsers.map((user) => [user.id, user]))

    // Format conversations for response
    const conversations = await Promise.all(
      Array.from(conversationMap.values()).map(async (conv) => {
        const otherUser = userMap.get(conv.otherUserId)
        if (!otherUser) return null

        // Count unread messages for this conversation
        const unreadCount = await prisma.groupMessage.count({
          where: {
            senderId: conv.otherUserId,
            read: false,
            OR: [
              {
                message: {
                  contains: `"recipientId":"${currentUserId}"`,
                },
              },
              {
                message: {
                  startsWith: `DM_${conv.conversationId}:`,
                },
              },
            ],
          },
        })

        // Parse the last message content
        let lastMessageContent = conv.message
        let messageType = "TEXT"

        if (conv.message.startsWith("DM_")) {
          lastMessageContent = conv.message.replace(`DM_${conv.conversationId}:`, "")
        } else if (conv.message.startsWith("{")) {
          try {
            const parsed = JSON.parse(conv.message)
            lastMessageContent = parsed.content || "Message"
            messageType = parsed.type || "TEXT"

            // Format different message types
            if (messageType === "IMAGE") lastMessageContent = "📷 Photo"
            else if (messageType === "VIDEO") lastMessageContent = "🎥 Video"
            else if (messageType === "FILE") lastMessageContent = "📎 File"
          } catch (e) {
            // Keep original content
          }
        }

        // Check if message was deleted
        if (lastMessageContent === "This message was deleted") {
          lastMessageContent = "🚫 Message deleted"
        }

        return {
          id: otherUser.id, // This is the user ID for the dynamic route
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          avatarUrl: otherUser.avatar || otherUser.image,
          lastMessage: lastMessageContent,
          lastSeen: formatTimestamp(conv.timestamp),
          isOnline: false,
          unreadCount,
          isPinned: false,
          isArchived: false,
          messageStatus: conv.senderId === currentUserId ? "sent" : undefined,
          isTyping: false,
          lastActivity: conv.timestamp,
          isGroup: false,
          conversationId: conv.conversationId,
        }
      }),
    )

    // Filter out null conversations and sort by last message time
    const validConversations = conversations
      .filter((conv) => conv !== null)
      .sort((a, b) => {
        // Pinned conversations first
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1

        // Then sort by last activity
        return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0)
      })

    return NextResponse.json(validConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Start a new conversation or search for users to chat with
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await request.json()
    const { action, query, userId } = body

    if (action === "search") {
      // Search for users to start conversations with
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: currentUserId } },
            {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          image: true,
          email: true,
        },
        take: 10,
      })

      // Check which users are friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            {
              userId: currentUserId,
              friendId: { in: users.map((u) => u.id) },
            },
            {
              friendId: currentUserId,
              userId: { in: users.map((u) => u.id) },
            },
          ],
        },
      })

      const friendIds = new Set([...friendships.map((f) => f.userId), ...friendships.map((f) => f.friendId)])

      const formattedUsers = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar || user.image,
        email: user.email,
        isFriend: friendIds.has(user.id),
      }))

      return NextResponse.json({ users: formattedUsers })
    }

    if (action === "start" && userId) {
      // Check if conversation already exists
      const conversationId = [currentUserId, userId].sort().join("_")

      const existingMessage = await prisma.groupMessage.findFirst({
        where: {
          OR: [
            {
              senderId: currentUserId,
              message: { startsWith: `DM_${conversationId}:` },
            },
            {
              senderId: userId,
              message: { startsWith: `DM_${conversationId}:` },
            },
          ],
        },
      })

      return NextResponse.json({
        conversationId,
        exists: !!existingMessage,
        userId,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in conversations POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
