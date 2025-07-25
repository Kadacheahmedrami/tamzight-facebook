import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: Retrieve chat messages between current user and target user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const targetUserId = params.id; // Safely access params
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;

    // Validate current user is not trying to chat with themselves
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot chat with yourself' },
        { status: 400 }
      );
    }

    // Validate target user exists (removed invalid fields)
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Create consistent conversation ID
    const conversationId = [currentUserId, targetUserId].sort().join('_');

    // Get messages for this conversation with improved query
    const messages = await prisma.groupMessage.findMany({
      where: {
        OR: [
          // Messages where current user is sender and target is recipient
          {
            senderId: currentUserId,
            message: {
              contains: `"recipientId":"${targetUserId}"`
            }
          },
          // Messages where target user is sender and current is recipient
          {
            senderId: targetUserId,
            message: {
              contains: `"recipientId":"${currentUserId}"`
            }
          },
          // Direct messages with conversation prefix (both directions)
          {
            senderId: currentUserId,
            message: {
              startsWith: `DM_${conversationId}:`
            }
          },
          {
            senderId: targetUserId,
            message: {
              startsWith: `DM_${conversationId}:`
            }
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: limit
    });

    // Mark unread messages as read (only messages sent to current user)
    const unreadMessageIds = messages
      .filter(msg => msg.senderId === targetUserId && !msg.read)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.groupMessage.updateMany({
        where: {
          id: { in: unreadMessageIds }
        },
        data: { read: true }
      });
    }

    // Format messages for response
    const formattedMessages = messages.reverse().map(message => {
      let content = message.message;
      let messageType = 'TEXT';
      let attachment = null;
      let editedAt = null;

      // Parse message content
      if (content.startsWith(`DM_${conversationId}:`)) {
        content = content.replace(`DM_${conversationId}:`, '');
      } else if (content.startsWith('{')) {
        try {
          const parsed = JSON.parse(content);
          content = parsed.content || parsed.message || content;
          messageType = parsed.type || 'TEXT';
          attachment = parsed.attachment || null;
          editedAt = parsed.editedAt || null;
        } catch (e) {
          // Keep original content if JSON parsing fails
          console.warn('Failed to parse message JSON:', e);
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
        isDeleted: content === 'This message was deleted'
      };
    });

    // Get total message count for pagination
    const totalMessages = await prisma.groupMessage.count({
      where: {
        OR: [
          {
            senderId: currentUserId,
            message: {
              contains: `"recipientId":"${targetUserId}"`
            }
          },
          {
            senderId: targetUserId,
            message: {
              contains: `"recipientId":"${currentUserId}"`
            }
          },
          {
            senderId: currentUserId,
            message: {
              startsWith: `DM_${conversationId}:`
            }
          },
          {
            senderId: targetUserId,
            message: {
              startsWith: `DM_${conversationId}:`
            }
          }
        ]
      }
    });

    // Get unread count for current user
    const unreadCount = await prisma.groupMessage.count({
      where: {
        senderId: targetUserId,
        read: false,
        OR: [
          {
            message: {
              contains: `"recipientId":"${currentUserId}"`
            }
          },
          {
            message: {
              startsWith: `DM_${conversationId}:`
            }
          }
        ]
      }
    });

    // Prepare response data with default values for removed fields
    const chatData = {
      conversationId,
      participant: {
        id: targetUser.id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        avatar: targetUser.avatar || targetUser.image,
        isOnline: false, // Default value
        lastSeen: null, // Default value
      },
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: skip + limit < totalMessages,
        unreadCount
      },
      // Flag to indicate if this is a new conversation
      isNewConversation: totalMessages === 0
    };

    return NextResponse.json(chatData);

  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Send a new message in the chat
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const targetUserId = params.id;
    const body = await request.json();

    const { content, messageType = 'TEXT', attachment = null, replyTo = null } = body;

    // Validate input
    if (!content?.trim() && !attachment) {
      return NextResponse.json(
        { error: 'Message content or attachment is required' },
        { status: 400 }
      );
    }

    // Validate current user is not trying to message themselves
    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      );
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
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
        image: true,
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    const conversationId = [currentUserId, targetUserId].sort().join('_');
    
    // Prepare message content
    let messageContent;
    if (messageType !== 'TEXT' || attachment || replyTo) {
      // Store as JSON for complex messages
      messageContent = JSON.stringify({
        content: content?.trim(),
        type: messageType,
        attachment,
        recipientId: targetUserId,
        conversationId,
        replyTo,
        timestamp: new Date().toISOString()
      });
    } else {
      // Simple text message with conversation identifier
      messageContent = `DM_${conversationId}:${content.trim()}`;
    }

    // Create the message using GroupMessage model
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
          }
        }
      }
    });

    // Create notification for recipient
    try {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'MESSAGE',
          message: `${currentUser.firstName} ${currentUser.lastName} sent you a message`,
          avatar: currentUser.avatar || currentUser.image,
          data: JSON.stringify({
            senderId: currentUserId,
            conversationId,
            messageId: message.id
          })
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
      // Don't fail the message send if notification fails
    }

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
      isDeleted: false
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
      conversationId,
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Mark messages as read or update message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const targetUserId = params.id;
    const body = await request.json();

    const { action, messageId, content } = body;

    if (action === 'markAsRead') {
      const conversationId = [currentUserId, targetUserId].sort().join('_');

      if (messageId) {
        // Mark specific message as read
        const updateResult = await prisma.groupMessage.updateMany({
          where: {
            id: messageId,
            senderId: targetUserId, // Only mark messages from the other user as read
          },
          data: { read: true }
        });

        if (updateResult.count === 0) {
          return NextResponse.json(
            { error: 'Message not found or already read' },
            { status: 404 }
          );
        }
      } else {
        // Mark all unread messages from target user as read
        await prisma.groupMessage.updateMany({
          where: {
            senderId: targetUserId,
            read: false,
            OR: [
              {
                message: {
                  contains: `"recipientId":"${currentUserId}"`
                }
              },
              {
                message: {
                  startsWith: `DM_${conversationId}:`
                }
              }
            ]
          },
          data: { read: true }
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'editMessage') {
      if (!messageId || !content?.trim()) {
        return NextResponse.json(
          { error: 'Message ID and content are required for editing' },
          { status: 400 }
        );
      }

      // Verify the message belongs to the current user and is recent (within 24 hours)
      const message = await prisma.groupMessage.findFirst({
        where: {
          id: messageId,
          senderId: currentUserId
        }
      });

      if (!message) {
        return NextResponse.json(
          { error: 'Message not found or not authorized' },
          { status: 404 }
        );
      }

      // Check if message is within edit time limit (24 hours)
      const messageAge = Date.now() - message.timestamp.getTime();
      const editTimeLimit = 24 * 60 * 60 * 1000; // 24 hours

      if (messageAge > editTimeLimit) {
        return NextResponse.json(
          { error: 'Message is too old to edit' },
          { status: 400 }
        );
      }

      const conversationId = [currentUserId, targetUserId].sort().join('_');
      
      // Parse existing message and update content
      let updatedMessageContent;
      if (message.message.startsWith(`DM_${conversationId}:`)) {
        updatedMessageContent = `DM_${conversationId}:${content.trim()}`;
      } else {
        try {
          const parsed = JSON.parse(message.message);
          parsed.content = content.trim();
          parsed.editedAt = new Date().toISOString();
          updatedMessageContent = JSON.stringify(parsed);
        } catch (e) {
          updatedMessageContent = `DM_${conversationId}:${content.trim()}`;
        }
      }

      await prisma.groupMessage.update({
        where: { id: messageId },
        data: {
          message: updatedMessageContent
        }
      });

      return NextResponse.json({ 
        success: true,
        editedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUserId = session.user.id;
    const targetUserId = params.id;
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const deleteType = searchParams.get('deleteType') || 'soft'; // 'soft' or 'hard'

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Verify the message belongs to the current user
    const message = await prisma.groupMessage.findFirst({
      where: {
        id: messageId,
        senderId: currentUserId
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or not authorized' },
        { status: 404 }
      );
    }

    if (deleteType === 'hard') {
      // Hard delete - completely remove the message
      await prisma.groupMessage.delete({
        where: { id: messageId }
      });
    } else {
      // Soft delete - update message content to indicate deletion
      const conversationId = [currentUserId, targetUserId].sort().join('_');
      
      let deletedMessageContent;
      if (message.message.startsWith(`DM_${conversationId}:`)) {
        deletedMessageContent = `DM_${conversationId}:This message was deleted`;
      } else {
        try {
          const parsed = JSON.parse(message.message);
          parsed.content = 'This message was deleted';
          parsed.deletedAt = new Date().toISOString();
          deletedMessageContent = JSON.stringify(parsed);
        } catch (e) {
          deletedMessageContent = `DM_${conversationId}:This message was deleted`;
        }
      }

      await prisma.groupMessage.update({
        where: { id: messageId },
        data: {
          message: deletedMessageContent
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      deleteType,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}