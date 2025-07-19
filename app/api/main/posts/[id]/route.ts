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

// GET /api/main/posts/[id] - Get a specific post with full details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    
    // Increment view count
    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    });

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if current user has liked this post
    const userLike = currentUser ? post.likes.find(like => like.userId === currentUser.id) : null;
    
    // Group reactions by emoji
    const reactionSummary = post.likes.reduce((acc: any, like) => {
      if (like.emoji) {
        acc[like.emoji] = (acc[like.emoji] || 0) + 1;
      }
      return acc;
    }, {});

    return NextResponse.json({ 
      post: {
        ...post,
        userLike,
        reactionSummary,
        isOwner: currentUser?.id === post.authorId
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/main/posts/[id] - Handle likes and reactions
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, emoji } = await req.json();

    if (action === 'like') {
      // Check if user already liked this post
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          postId: params.id
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
            message: 'Post unliked',
            action: 'unliked'
          });
        }
      } else {
        // Create new like/reaction
        await prisma.like.create({
          data: {
            userId: user.id,
            postId: params.id,
            emoji: emoji || null
          }
        });

        // Create notification for post author (but not for own posts)
        const post = await prisma.post.findUnique({
          where: { id: params.id },
          select: { authorId: true, title: true }
        });

        if (post && post.authorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: post.authorId,
              type: emoji ? 'reaction' : 'like',
              message: emoji 
                ? `${user.firstName} ${user.lastName} reacted ${emoji} to your post`
                : `${user.firstName} ${user.lastName} liked your post`,
              avatar: user.image || user.avatar
            }
          });
        }

        return NextResponse.json({ 
          success: true, 
          message: emoji ? 'Reaction added' : 'Post liked',
          action: 'liked'
        });
      }
    }

    if (action === 'unlike') {
      // Explicit unlike action
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          postId: params.id
        }
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id }
        });
        return NextResponse.json({ 
          success: true, 
          message: 'Post unliked',
          action: 'unliked'
        });
      } else {
        return NextResponse.json({ 
          error: 'Post not liked',
          action: 'not_liked'
        }, { status: 400 });
      }
    }

    if (action === 'share') {
      // Check if user already shared this post
      const existingShare = await prisma.share.findFirst({
        where: {
          userId: user.id,
          postId: params.id
        }
      });

      if (existingShare) {
        // Unlike Instagram/Twitter, allow unsharing
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
          postId: params.id
        }
      });

      // Create notification for post author (but not for own posts)
      const post = await prisma.post.findUnique({
        where: { id: params.id },
        select: { authorId: true, title: true }
      });

      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'share',
            message: `${user.firstName} ${user.lastName} shared your post`,
            avatar: user.image || user.avatar
          }
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Post shared',
        action: 'shared'
      });
    }

    if (action === 'comment') {
      const { content } = await req.json();
      
      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
      }

      // Validate comment length (social media best practice)
      if (content.trim().length > 2000) {
        return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 });
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          userId: user.id,
          postId: params.id
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

      // Create notification for post author (but not for own posts)
      const post = await prisma.post.findUnique({
        where: { id: params.id },
        select: { authorId: true, title: true }
      });

      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'comment',
            message: `${user.firstName} ${user.lastName} commented on your post`,
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

// DELETE /api/main/posts/[id] - Only author can delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this post.' }, { status: 403 });
    }
    
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/posts/[id] - Only author can edit
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this post.' }, { status: 403 });
    }
    
    const data = await req.json();
    
    // Only allow updating certain fields
    const allowedFields = [
      'title', 'content', 'category', 'subcategory', 'image'
    ];
    
    const updateData: any = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
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
    
    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}