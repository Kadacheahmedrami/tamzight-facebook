import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to get current user from session
async function getCurrentUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all messages involving the current user
    const messages = await prisma.groupMessage.findMany({
      where: {
        senderId: currentUser.id
      },
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
      }
    });

    // Since your schema doesn't have a receiverId field, we need to modify the approach
    // For now, I'll assume all messages are in a group chat format
    // If you need direct messaging, you'd need to add a receiverId field to GroupMessage

    // Group messages by conversation (in this case, it's just the group chat)
    const conversations = messages.reduce((acc: any[], message) => {
      const existingConversation = acc.find(conv => conv.participantId === message.senderId);
      
      if (!existingConversation) {
        acc.push({
          participantId: message.senderId,
          participant: {
            id: message.sender.id,
            firstName: message.sender.firstName,
            lastName: message.sender.lastName,
            avatar: message.sender.avatar
          },
          lastMessage: {
            id: message.id,
            message: message.message,
            timestamp: message.timestamp,
            read: message.read
          },
          unreadCount: message.read ? 0 : 1
        });
      } else if (message.timestamp > existingConversation.lastMessage.timestamp) {
        existingConversation.lastMessage = {
          id: message.id,
          message: message.message,
          timestamp: message.timestamp,
          read: message.read
        };
      }
      
      return acc;
    }, []);

    return NextResponse.json({ conversations });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}