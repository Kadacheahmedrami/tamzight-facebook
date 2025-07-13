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

    // Get all friends
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

    // Get recent messages to find last message with each friend
    const recentMessages = await prisma.groupMessage.findMany({
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
      take: 100 // Get more messages to find conversations
    });

    // Build conversations array
    const conversations = [];

    // Add friends as conversations
    for (const friendship of friends) {
      const friend = friendship.userId === user.id ? friendship.friend : friendship.user;
      
      // Find last message between user and this friend
      const lastMessage = recentMessages.find(msg => 
        (msg.senderId === user.id && msg.message.includes(friend.firstName)) ||
        (msg.senderId === friend.id)
      );

      conversations.push({
        id: friend.id,
        name: `${friend.firstName} ${friend.lastName}`,
        avatarUrl: friend.avatar || friend.image,
        lastMessage: lastMessage ? lastMessage.message : 'ابدأ محادثة...',
        lastSeen: lastMessage ? formatLastSeen(lastMessage.timestamp) : 'غير متصل',
        isOnline: Math.random() > 0.5, // Mock online status
        unreadCount: lastMessage ? Math.floor(Math.random() * 3) : 0,
        isPinned: false,
        messageStatus: 'read' as const,
        lastActivity: lastMessage ? lastMessage.timestamp : friendship.createdAt,
        isGroup: false,
        groupMembers: 2
      });
    }

    // Add general chat conversation (using existing GroupMessage)
    const lastGroupMessage = recentMessages[0];
    if (lastGroupMessage) {
      conversations.push({
        id: 'general',
        name: 'المحادثة العامة',
        avatarUrl: null,
        lastMessage: lastGroupMessage.message,
        lastSeen: formatLastSeen(lastGroupMessage.timestamp),
        isOnline: true,
        unreadCount: Math.floor(Math.random() * 5),
        isPinned: true,
        messageStatus: 'read' as const,
        lastActivity: lastGroupMessage.timestamp,
        isGroup: true,
        groupMembers: await prisma.user.count()
      });
    }

    // Sort conversations by last activity
    conversations.sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by last activity
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return NextResponse.json(conversations);

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