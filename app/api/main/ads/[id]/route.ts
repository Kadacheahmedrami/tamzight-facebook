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

// GET /api/main/ads/[id] - Get a specific ad with full details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    // Increment view count
    await prisma.ad.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const ad = await prisma.ad.findUnique({
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

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Check if current user has liked this ad
    const userLike = currentUser ? ad.likes.find(like => like.userId === currentUser.id) : null;

    // Group reactions by emoji
    const reactionSummary = ad.likes.reduce((acc: any, like) => {
      if (like.emoji) {
        acc[like.emoji] = (acc[like.emoji] || 0) + 1;
      }
      return acc;
    }, {});

    return NextResponse.json({
      ad: {
        ...ad,
        userLike,
        reactionSummary,
        isOwner: currentUser?.id === ad.authorId
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/main/ads/[id] - Handle likes, reactions, shares, comments
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, emoji, content } = body;

    if (action === 'like') {
      // Check if user already liked this ad
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          adId: id
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
            message: 'Ad unliked',
            action: 'unliked'
          });
        }
      } else {
        // Create new like/reaction
        await prisma.like.create({
          data: {
            userId: user.id,
            adId: id,
            emoji: emoji || null
          }
        });

        // Create notification for ad author (but not for own ads)
        const ad = await prisma.ad.findUnique({
          where: { id },
          select: { authorId: true, title: true }
        });

        if (ad && ad.authorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: ad.authorId,
              type: emoji ? 'reaction' : 'like',
              message: emoji
                ? `${user.firstName} ${user.lastName} reacted ${emoji} to your ad`
                : `${user.firstName} ${user.lastName} liked your ad`,
              avatar: user.image || user.avatar
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: emoji ? 'Reaction added' : 'Ad liked',
          action: 'liked'
        });
      }
    }

    if (action === 'unlike') {
      // Explicit unlike action
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          adId: id
        }
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id }
        });
        return NextResponse.json({
          success: true,
          message: 'Ad unliked',
          action: 'unliked'
        });
      } else {
        return NextResponse.json({
          error: 'Ad not liked',
          action: 'not_liked'
        }, { status: 400 });
      }
    }

    if (action === 'share') {
      // Check if user already shared this ad
      const existingShare = await prisma.share.findFirst({
        where: {
          userId: user.id,
          adId: id
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
          adId: id
        }
      });

      // Create notification for ad author (but not for own ads)
      const ad = await prisma.ad.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });

      if (ad && ad.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: ad.authorId,
            type: 'share',
            message: `${user.firstName} ${user.lastName} shared your ad`,
            avatar: user.image || user.avatar
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Ad shared',
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
          adId: id
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
      // Create notification for ad author (but not for own ads)
      const ad = await prisma.ad.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });
      if (ad && ad.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: ad.authorId,
            type: 'comment',
            message: `${user.firstName} ${user.lastName} commented on your ad`,
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

// DELETE /api/main/ads/[id] - Only author can delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    if (ad.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this ad.' }, { status: 403 });
    }
    await prisma.ad.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/ads/[id] - Only author can edit
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }
    if (ad.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this ad.' }, { status: 403 });
    }
    const data = await req.json();
    // Only allow updating certain fields
    const allowedFields = [
      'title', 'content', 'category', 'subcategory', 'image',
      'targetAmount', 'currentAmount', 'deadline'
    ];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    const updatedAd = await prisma.ad.update({
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
    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 