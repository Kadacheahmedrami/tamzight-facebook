import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to get current user from session
async function getCurrentUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user;
}

// GET /api/main/messages - Get all conversations for current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get all friends to show them in conversations
    const friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true
          }
        },
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true
          }
        }
      }
    });

    // Get recent group messages to see who user has messaged
    const recentMessages = await prisma.groupMessage.findMany({
      where: {
        senderId: user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Get recent messages to find conversation partners
    });

    // Build conversations map
    const conversations = new Map();

    // Add friends as potential conversations
    for (const friendship of friends) {
      const friend = friendship.userId === user.id ? friendship.friend : friendship.user;
      
      // Check if there are recent messages with this friend
      const hasMessages = recentMessages.some(msg => 
        msg.senderId === friend.id || msg.senderId === user.id
      );

      conversations.set(friend.id, {
        id: friend.id,
        name: `${friend.firstName} ${friend.lastName}`,
        avatarUrl: friend.avatar || friend.image,
        lastMessage: hasMessages ? 'آخر رسالة...' : 'ابدأ محادثة...',
        lastSeen: hasMessages ? 'منذ قليل' : 'غير متصل',
        isOnline: Math.random() > 0.5, // Mock online status - you can implement real presence
        unreadCount: hasMessages ? Math.floor(Math.random() * 5) : 0, // Mock unread count
        isPinned: false,
        messageStatus: 'read' as const,
        lastActivity: hasMessages ? new Date(Date.now() - Math.random() * 86400000) : friendship.createdAt,
        isGroup: false,
        groupMembers: 2
      });
    }

    // Add group conversation if there are group messages
    if (recentMessages.length > 0) {
      const lastGroupMessage = recentMessages[0];
      conversations.set('group', {
        id: 'group',
        name: 'المحادثة الجماعية',
        avatarUrl: null,
        lastMessage: lastGroupMessage.message,
        lastSeen: formatLastSeen(lastGroupMessage.timestamp),
        isOnline: true,
        unreadCount: Math.floor(Math.random() * 10),
        isPinned: true,
        messageStatus: 'read' as const,
        lastActivity: lastGroupMessage.timestamp,
        isGroup: true,
        groupMembers: await prisma.user.count() // All users in the group
      });
    }

    // Convert to array and sort by last activity
    const conversationList = Array.from(conversations.values()).sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by last activity
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return NextResponse.json(conversationList);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب المحادثات' }, { status: 500 });
  }
}

// Helper function to format last seen time
function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'الآن';
  if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `قبل ${diffInHours} ساعة`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'أمس';
  if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
  
  return `منذ ${Math.floor(diffInDays / 7)} أسبوع`;
}