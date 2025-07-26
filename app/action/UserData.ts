"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // Adjust path as needed
import { prisma } from "@/lib/prisma" // Adjust path as needed

export interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  read: boolean
  avatar: string | null
}

export interface Message {
  id: string
  senderId: string
  sender: string
  message: string
  timestamp: string
  read: boolean
  avatar: string | null
}

export interface UserData {
  notifications: Notification[]
  messages: Message[]
  unreadNotifications: number
  unreadMessages: number
}

export async function getUserData(): Promise<UserData> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        notifications: [],
        messages: [],
        unreadNotifications: 0,
        unreadMessages: 0
      }
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10 // Limit to recent 10 notifications
    })

    // Fetch messages (group messages)
    const messages = await prisma.groupMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10 // Limit to recent 10 messages
    })

    // Transform notifications
    const transformedNotifications: Notification[] = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      timestamp: new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(notification.timestamp)),
      read: notification.read,
      avatar: notification.avatar
    }))

    // Transform messages
    const transformedMessages: Message[] = messages.map(message => ({
      id: message.id,
      senderId: message.senderId,
      sender: `${message.sender.firstName} ${message.sender.lastName}`,
      message: message.message,
      timestamp: new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(message.timestamp)),
      read: message.read,
      avatar: message.sender.avatar
    }))

    // Count unread items
    const unreadNotifications = transformedNotifications.filter(n => !n.read).length
    const unreadMessages = transformedMessages.filter(m => !m.read && m.senderId !== session.user.id).length

    return {
      notifications: transformedNotifications,
      messages: transformedMessages,
      unreadNotifications,
      unreadMessages
    }

  } catch (error) {
    console.error("Error fetching user data:", error)
    return {
      notifications: [],
      messages: [],
      unreadNotifications: 0,
      unreadMessages: 0
    }
  }
}