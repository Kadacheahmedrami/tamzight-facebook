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

// GET /api/main/videos/[id] - Get a specific video with full details
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(req);

    // Increment view count
    await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            emoji: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
                avatar: true,
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        shares: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
                avatar: true,
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            shares: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if current user has liked this video
    const userLike = currentUser ? video.likes.find(like => like.userId === currentUser.id) : null;

    // Group reactions by emoji
    const reactionSummary = video.likes.reduce((acc: any, like) => {
      if (like.emoji) {
        acc[like.emoji] = (acc[like.emoji] || 0) + 1;
      }
      return acc;
    }, {});

    return NextResponse.json({
      video: {
        ...video,
        userLike,
        reactionSummary,
        isOwner: currentUser?.id === video.authorId
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/main/videos/[id] - Handle likes, reactions, shares, comments
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, emoji, content } = body;

    if (action === 'like') {
      // Check if user already liked this video
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          videoId: id
        }
      });

      if (existingLike) {
        // If emoji is provided, update the reaction
        if (emoji) {
          await prisma.like.update({
            where: { id: existingLike.id },
            data: { emoji }
          });
          return NextResponse.json({
            success: true,
            message: 'Reaction updated',
            action: 'updated'
          });
        } else {
          // This is a simple like toggle - since they already liked it, unlike it
          await prisma.like.delete({
            where: { id: existingLike.id }
          });
          return NextResponse.json({
            success: true,
            message: 'Video unliked',
            action: 'unliked'
          });
        }
      } else {
        // Create new like/reaction
        await prisma.like.create({
          data: {
            userId: user.id,
            videoId: id,
            emoji: emoji || null
          }
        });

        // Create notification for video author (but not for own videos)
        const video = await prisma.video.findUnique({
          where: { id },
          select: { authorId: true, title: true }
        });

        if (video && video.authorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: video.authorId,
              type: emoji ? 'reaction' : 'like',
              message: emoji
                ? `${user.firstName} ${user.lastName} reacted ${emoji} to your video`
                : `${user.firstName} ${user.lastName} liked your video`,
              avatar: user.image || user.avatar
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: emoji ? 'Reaction added' : 'Video liked',
          action: 'liked'
        });
      }
    }

    if (action === 'unlike') {
      // Explicit unlike action
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          videoId: id
        }
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id }
        });
        return NextResponse.json({
          success: true,
          message: 'Video unliked',
          action: 'unliked'
        });
      } else {
        return NextResponse.json({
          error: 'Video not liked',
          action: 'not_liked'
        }, { status: 400 });
      }
    }

    if (action === 'share') {
      // Check if user already shared this video
      const existingShare = await prisma.share.findFirst({
        where: {
          userId: user.id,
          videoId: id
        }
      });

      if (existingShare) {
        // Allow unsharing
        await prisma.share.delete({
          where: { id: existingShare.id }
        });
        return NextResponse.json({
          success: true,
          message: 'Share removed',
          action: 'unshared'
        });
      }

      // Create new share
      await prisma.share.create({
        data: {
          userId: user.id,
          videoId: id
        }
      });

      // Create notification for video author (but not for own videos)
      const video = await prisma.video.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });

      if (video && video.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: video.authorId,
            type: 'share',
            message: `${user.firstName} ${user.lastName} shared your video`,
            avatar: user.image || user.avatar
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Video shared',
        action: 'shared'
      });
    }

    if (action === 'comment') {
      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
      }
      if (content.trim().length > 2000) {
        return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 });
      }
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          userId: user.id,
          videoId: id
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
              avatar: true,
            }
          }
        }
      });
      // Create notification for video author (but not for own videos)
      const video = await prisma.video.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });
      if (video && video.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: video.authorId,
            type: 'comment',
            message: `${user.firstName} ${user.lastName} commented on your video`,
            avatar: user.image || user.avatar
          }
        });
      }
      return NextResponse.json({
        success: true,
        comment,
        action: 'commented'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/main/videos/[id] - Only author can delete
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    if (video.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this video.' }, { status: 403 });
    }
    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/videos/[id] - Only author can edit
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    if (video.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this video.' }, { status: 403 });
    }
    const data = await req.json();
    // Only allow updating certain fields
    const allowedFields = [
      'title', 'content', 'category', 'subcategory', 'image',
      'duration', 'quality', 'language'
    ];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    const updatedVideo = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            shares: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, video: updatedVideo });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
  }