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

// GET /api/messages - Get all group messages (since only GroupMessage exists in schema)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Get all group messages
    const messages = await prisma.groupMessage.findMany({
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
        timestamp: 'asc'
      }
    });

    // Mark messages as read for current user (if you want to track read status per user)
    await prisma.groupMessage.updateMany({
      where: {
        senderId: { not: currentUser.id },
        read: false
      },
      data: {
        read: true
      }
    });

    // Format messages for the frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.message,
      senderId: message.senderId,
      timestamp: message.timestamp,
      read: message.read,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        avatar: message.sender.avatar || message.sender.image
      },
      isCurrentUser: message.senderId === currentUser.id,
      formattedTime: formatMessageTime(message.timestamp)
    }));

    return NextResponse.json({
      messages: formattedMessages,
      totalMessages: messages.length
    });

  } catch (error) {
    console.error('Error fetching group messages:', error);
    return NextResponse.json({ error: 'حدث خطأ في جلب الرسائل' }, { status: 500 });
  }
}

// POST /api/messages - Send a message to group chat
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'الرسالة لا يمكن أن تكون فارغة' }, { status: 400 });
    }

    // Create the group message
    const newMessage = await prisma.groupMessage.create({
      data: {
        senderId: currentUser.id,
        message: message.trim(),
        timestamp: new Date(),
        read: false,
        avatar: currentUser.avatar || currentUser.image
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
      }
    });

    // Format the response
    const formattedMessage = {
      id: newMessage.id,
      content: newMessage.message,
      senderId: newMessage.senderId,
      timestamp: newMessage.timestamp,
      read: newMessage.read,
      sender: {
        id: newMessage.sender.id,
        name: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
        avatar: newMessage.sender.avatar || newMessage.sender.image
      },
      isCurrentUser: true,
      formattedTime: formatMessageTime(newMessage.timestamp)
    };

    return NextResponse.json(formattedMessage, { status: 201 });

  } catch (error) {
    console.error('Error sending group message:', error);
    return NextResponse.json({ error: 'حدث خطأ في إرسال الرسالة' }, { status: 500 });
  }
}

// Helper function to format message time
function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If same day, show time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString('ar-DZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'أمس';
  }
  
  // If within a week, show day name
  const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString('ar-DZ', { weekday: 'long' });
  }
  
  // Otherwise show date
  return messageDate.toLocaleDateString('ar-DZ');
}