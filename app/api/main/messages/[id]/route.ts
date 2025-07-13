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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: otherUserId } = params;

    // Verify the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    if (!otherUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Since your GroupMessage model doesn't have a receiverId field,
    // I'll assume you want to implement this as a direct message system
    // For now, I'll get all messages from both users and sort them chronologically
    
    // Note: This is a simplified approach. For proper direct messaging,
    // you should add a receiverId field to GroupMessage or create a separate DirectMessage model
    
    const messages = await prisma.groupMessage.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { senderId: otherUserId }
        ]
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
        timestamp: 'asc'
      }
    });

    // Mark messages as read (messages from the other user to current user)
    await prisma.groupMessage.updateMany({
      where: {
        senderId: otherUserId,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      messages,
      otherUser
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}







export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id: receiverId } = params;
      const body = await req.json();
      const { message } = body;
  
      // Validate message content
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
      }
  
      // Verify the receiver exists
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      });
  
      if (!receiver) {
        return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
      }
  
      // Check if users are friends (optional security check)
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: currentUser.id, friendId: receiverId },
            { userId: receiverId, friendId: currentUser.id }
          ]
        }
      });
  
      if (!friendship) {
        return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
      }
  
      // Create the new message
      const newMessage = await prisma.groupMessage.create({
        data: {
          senderId: currentUser.id,
          message: message.trim(),
          avatar: currentUser.avatar,
          read: false
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
        }
      });
  
      // Create a notification for the receiver
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'message',
          message: `${currentUser.firstName} ${currentUser.lastName} sent you a message`,
          avatar: currentUser.avatar,
          read: false
        }
      });
  
      return NextResponse.json({ message: newMessage }, { status: 201 });
  
    } catch (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }