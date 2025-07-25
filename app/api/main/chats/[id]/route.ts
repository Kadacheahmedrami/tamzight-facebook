// First, create or update your types/next-auth.d.ts file:
// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}

// Then update your route.ts file:
import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Retrieve chat messages between current user and target user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params promise
    const { id: targetUserId } = await params 

    // Get session - check both regular session and server-side header
    const session = await getServerSession(authOptions)
    const headerUserId = request.headers.get("x-user-id")

    const currentUserId = session?.user?.id || headerUserId

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate current user is not trying to chat with themselves
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 })
    }

    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)
    const skip = (page - 1) * limit

    // Create consistent conversation ID
    const conversationId = [currentUserId, targetUserId].sort().join("_")

    // Get messages for this conversation
    const messages = await prisma.groupMessage.findMany({
      where: {
        OR: [
          // Messages where current user is sender and target is recipient
          {
            senderId: currentUserId,
            message: {
              contains: `"recipientId":"${targetUserId}"`,
            },
          },
          // Messages where target user is sender and current is recipient
          {
            senderId: targetUserId,
            message: {
              contains: `"recipientId":"${currentUserId}"`,
            },
          },
          // Direct messages with conversation prefix (both directions)
          {
            senderId: currentUserId,
            message: {
              startsWith: `DM_${conversationId}:`,
            },
          },
          {
            senderId: targetUserId,
            message: {
              startsWith: `DM_${conversationId}:`,
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
      skip,
      take: limit,
    })

    // Mark unread messages as read
    const unreadMessageIds = messages.filter((msg) => msg.senderId === targetUserId && !msg.read).map((msg) => msg.id)

    if (unreadMessageIds.length > 0) {
      await prisma.groupMessage.updateMany({
        where: {
          id: { in: unreadMessageIds },
        },
        data: { read: true },
      })
    }

    // Format messages for response
    const formattedMessages = messages.reverse().map((message) => {
      let content = message.message
      let messageType = "TEXT"
      let attachment = null
      let editedAt = null

      // Parse message content
      if (content.startsWith(`DM_${conversationId}:`)) {
        content = content.replace(`DM_${conversationId}:`, "")
      } else if (content.startsWith("{")) {
        try {
          const parsed = JSON.parse(content)
          content = parsed.content || parsed.message || content
          messageType = parsed.type || "TEXT"
          attachment = parsed.attachment || null
          editedAt = parsed.editedAt || null
        } catch (e) {
          console.warn("Failed to parse message JSON:", e)
        }
      }

      return {
        id: message.id,
        content,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        senderAvatar: message.sender.avatar || message.sender.image,
        timestamp: message.timestamp.toISOString(),
        isOwn: message.senderId === currentUserId,
        messageType,
        attachment,
        read: message.read,
        editedAt: editedAt ? new Date(editedAt).toISOString() : null,
        isDeleted: content === "This message was deleted",
      }
    })

    // Get total message count for pagination
    const totalMessages = await prisma.groupMessage.count({
      where: {
        OR: [
          {
            senderId: currentUserId,
            message: {
              contains: `"recipientId":"${targetUserId}"`,
            },
          },
          {
            senderId: targetUserId,
            message: {
              contains: `"recipientId":"${currentUserId}"`,
            },
          },
          {
            senderId: currentUserId,
            message: {
              startsWith: `DM_${conversationId}:`,
            },
          },
          {
            senderId: targetUserId,
            message: {
              startsWith: `DM_${conversationId}:`,
            },
          },
        ],
      },
    })

    // Get unread count for current user
    const unreadCount = await prisma.groupMessage.count({
      where: {
        senderId: targetUserId,
        read: false,
        OR: [
          {
            message: {
              contains: `"recipientId":"${currentUserId}"`,
            },
          },
          {
            message: {
              startsWith: `DM_${conversationId}:`,
            },
          },
        ],
      },
    })

    const chatData = {
      conversationId,
      participant: {
        id: targetUser.id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        avatar: targetUser.avatar || targetUser.image,
        isOnline: false,
        lastSeen: null,
      },
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: skip + limit < totalMessages,
        unreadCount,
      },
      isNewConversation: totalMessages === 0,
    }

    return NextResponse.json(chatData)
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Send a new message in the chat
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params promise
    const { id: targetUserId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await request.json()
    const { content, messageType = "TEXT", attachment = null, replyTo = null } = body

    // Validate input
    if (!content?.trim() && !attachment) {
      return NextResponse.json({ error: "Message content or attachment is required" }, { status: 400 })
    }

    // Validate current user is not trying to message themselves
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 })
    }

    // Validate target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "Current user not found" }, { status: 404 })
    }

    const conversationId = [currentUserId, targetUserId].sort().join("_")

    // Prepare message content
    let messageContent
    if (messageType !== "TEXT" || attachment || replyTo) {
      messageContent = JSON.stringify({
        content: content?.trim(),
        type: messageType,
        attachment,
        recipientId: targetUserId,
        conversationId,
        replyTo,
        timestamp: new Date().toISOString(),
      })
    } else {
      messageContent = `DM_${conversationId}:${content.trim()}`
    }

    // Create the message
    const message = await prisma.groupMessage.create({
      data: {
        message: messageContent,
        senderId: currentUserId,
        avatar: currentUser.avatar || currentUser.image,
        read: false,
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
    })

    // Format response message
    const responseMessage = {
      id: message.id,
      content: content?.trim(),
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`,
      senderAvatar: message.sender.avatar || message.sender.image,
      timestamp: message.timestamp.toISOString(),
      isOwn: true,
      messageType,
      attachment,
      read: false,
      replyTo,
      editedAt: null,
      isDeleted: false,
    }

    // Send real-time notification via Pusher
    try {
      await pusherServer.trigger(`chat_${conversationId}`, "new-message", {
        message: {
          ...responseMessage,
          isOwn: false, // For the recipient, this message is not their own
        },
        senderId: currentUserId,
        recipientId: targetUserId,
      })

      // Also trigger for the sender's other devices
      await pusherServer.trigger(`user_${currentUserId}`, "message-sent", {
        message: responseMessage,
        conversationId,
      })
    } catch (pusherError) {
      console.warn("Failed to send real-time notification:", pusherError)
    }

    // Create notification for recipient
    try {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "MESSAGE",
          message: `${currentUser.firstName} ${currentUser.lastName} sent you a message`,
          avatar: currentUser.avatar || currentUser.image,
          // Remove the data/metadata field for now - add other fields as needed based on your schema
          // You can add additional fields here based on your Prisma Notification model
        },
      })
    } catch (notificationError) {
      console.warn("Failed to create notification:", notificationError)
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      conversationId,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Mark messages as read or update message
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params promise
    const { id: targetUserId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await request.json()
    const { action, messageId, content } = body

    if (action === "markAsRead") {
      const conversationId = [currentUserId, targetUserId].sort().join("_")

      if (messageId) {
        const updateResult = await prisma.groupMessage.updateMany({
          where: {
            id: messageId,
            senderId: targetUserId,
          },
          data: { read: true },
        })

        if (updateResult.count === 0) {
          return NextResponse.json({ error: "Message not found or already read" }, { status: 404 })
        }
      } else {
        await prisma.groupMessage.updateMany({
          where: {
            senderId: targetUserId,
            read: false,
            OR: [
              {
                message: {
                  contains: `"recipientId":"${currentUserId}"`,
                },
              },
              {
                message: {
                  startsWith: `DM_${conversationId}:`,
                },
              },
            ],
          },
          data: { read: true },
        })
      }

      // Notify sender that messages were read
      try {
        await pusherServer.trigger(`user_${targetUserId}`, "messages-read", {
          readBy: currentUserId,
          conversationId,
          messageId: messageId || null,
        })
      } catch (pusherError) {
        console.warn("Failed to send read notification:", pusherError)
      }

      return NextResponse.json({ success: true })
    }

    if (action === "editMessage") {
      if (!messageId || !content?.trim()) {
        return NextResponse.json({ error: "Message ID and content are required for editing" }, { status: 400 })
      }

      const message = await prisma.groupMessage.findFirst({
        where: {
          id: messageId,
          senderId: currentUserId,
        },
      })

      if (!message) {
        return NextResponse.json({ error: "Message not found or not authorized" }, { status: 404 })
      }

      // Check if message is within edit time limit (24 hours)
      const messageAge = Date.now() - message.timestamp.getTime()
      const editTimeLimit = 24 * 60 * 60 * 1000

      if (messageAge > editTimeLimit) {
        return NextResponse.json({ error: "Message is too old to edit" }, { status: 400 })
      }

      const conversationId = [currentUserId, targetUserId].sort().join("_")

      let updatedMessageContent
      if (message.message.startsWith(`DM_${conversationId}:`)) {
        updatedMessageContent = `DM_${conversationId}:${content.trim()}`
      } else {
        try {
          const parsed = JSON.parse(message.message)
          parsed.content = content.trim()
          parsed.editedAt = new Date().toISOString()
          updatedMessageContent = JSON.stringify(parsed)
        } catch (e) {
          updatedMessageContent = `DM_${conversationId}:${content.trim()}`
        }
      }

      await prisma.groupMessage.update({
        where: { id: messageId },
        data: {
          message: updatedMessageContent,
        },
      })

      // Notify about message edit
      try {
        await pusherServer.trigger(`chat_${conversationId}`, "message-edited", {
          messageId,
          newContent: content.trim(),
          editedAt: new Date().toISOString(),
          senderId: currentUserId,
        })
      } catch (pusherError) {
        console.warn("Failed to send edit notification:", pusherError)
      }

      return NextResponse.json({
        success: true,
        editedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete a message
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the params promise
    const { id: targetUserId } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("messageId")
    const deleteType = searchParams.get("deleteType") || "soft"

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    const message = await prisma.groupMessage.findFirst({
      where: {
        id: messageId,
        senderId: currentUserId,
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found or not authorized" }, { status: 404 })
    }

    const conversationId = [currentUserId, targetUserId].sort().join("_")

    if (deleteType === "hard") {
      await prisma.groupMessage.delete({
        where: { id: messageId },
      })
    } else {
      let deletedMessageContent
      if (message.message.startsWith(`DM_${conversationId}:`)) {
        deletedMessageContent = `DM_${conversationId}:This message was deleted`
      } else {
        try {
          const parsed = JSON.parse(message.message)
          parsed.content = "This message was deleted"
          parsed.deletedAt = new Date().toISOString()
          deletedMessageContent = JSON.stringify(parsed)
        } catch (e) {
          deletedMessageContent = `DM_${conversationId}:This message was deleted`
        }
      }

      await prisma.groupMessage.update({
        where: { id: messageId },
        data: {
          message: deletedMessageContent,
        },
      })
    }

    // Notify about message deletion
    try {
      await pusherServer.trigger(`chat_${conversationId}`, "message-deleted", {
        messageId,
        deleteType,
        deletedAt: new Date().toISOString(),
        senderId: currentUserId,
      })
    } catch (pusherError) {
      console.warn("Failed to send delete notification:", pusherError)
    }

    return NextResponse.json({
      success: true,
      deleteType,
      deletedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}