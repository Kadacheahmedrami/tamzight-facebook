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

// GET /api/main/words/[id] - Get a specific word with full details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    // Increment view count
    await prisma.word.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    const word = await prisma.word.findUnique({
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
        pronunciations: {
          select: {
            id: true,
            accent: true,
            pronunciation: true,
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
        _count: {
          select: {
            comments: true,
            likes: true,
            shares: true,
            pronunciations: true,
          },
        },
      },
    });

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // Check if current user has liked this word
    const userLike = currentUser ? word.likes.find(like => like.userId === currentUser.id) : null;

    // Check if current user has added a pronunciation
    const userPronunciation = currentUser ? word.pronunciations.find(p => p.user.id === currentUser.id) : null;

    // Group reactions by emoji
    const reactionSummary = word.likes.reduce((acc: any, like) => {
      if (like.emoji) {
        acc[like.emoji] = (acc[like.emoji] || 0) + 1;
      }
      return acc;
    }, {});

    // Group pronunciations by accent
    const pronunciationsByAccent = word.pronunciations.reduce((acc: any, pronunciation) => {
      if (!acc[pronunciation.accent]) {
        acc[pronunciation.accent] = [];
      }
      acc[pronunciation.accent].push(pronunciation);
      return acc;
    }, {});

    return NextResponse.json({
      word: {
        ...word,
        userLike,
        userPronunciation,
        reactionSummary,
        pronunciationsByAccent,
        isOwner: currentUser?.id === word.authorId
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// POST /api/main/words/[id] - Handle likes, reactions, shares, comments, pronunciations
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, emoji, content, accent, pronunciation } = body;

    if (action === 'like') {
      // Check if user already liked this word
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          wordId: id
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
            message: 'Word unliked',
            action: 'unliked'
          });
        }
      } else {
        // Create new like/reaction
        await prisma.like.create({
          data: {
            userId: user.id,
            wordId: id,
            emoji: emoji || null
          }
        });

        // Create notification for word author (but not for own words)
        const word = await prisma.word.findUnique({
          where: { id },
          select: { authorId: true, title: true }
        });

        if (word && word.authorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: word.authorId,
              type: emoji ? 'reaction' : 'like',
              message: emoji
                ? `${user.firstName} ${user.lastName} reacted ${emoji} to your word`
                : `${user.firstName} ${user.lastName} liked your word`,
              avatar: user.image || user.avatar
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: emoji ? 'Reaction added' : 'Word liked',
          action: 'liked'
        });
      }
    }

    if (action === 'unlike') {
      // Explicit unlike action
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: user.id,
          wordId: id
        }
      });

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id }
        });
        return NextResponse.json({
          success: true,
          message: 'Word unliked',
          action: 'unliked'
        });
      } else {
        return NextResponse.json({
          error: 'Word not liked',
          action: 'not_liked'
        }, { status: 400 });
      }
    }

    if (action === 'share') {
      // Check if user already shared this word
      const existingShare = await prisma.share.findFirst({
        where: {
          userId: user.id,
          wordId: id
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
          wordId: id
        }
      });

      // Create notification for word author (but not for own words)
      const word = await prisma.word.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });

      if (word && word.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: word.authorId,
            type: 'share',
            message: `${user.firstName} ${user.lastName} shared your word`,
            avatar: user.image || user.avatar
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Word shared',
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
          wordId: id
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
      // Create notification for word author (but not for own words)
      const word = await prisma.word.findUnique({
        where: { id },
        select: { authorId: true, title: true }
      });
      if (word && word.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: word.authorId,
            type: 'comment',
            message: `${user.firstName} ${user.lastName} commented on your word`,
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

    if (action === 'pronunciation') {
      // Validate pronunciation data
      if (!accent || accent.trim() === '') {
        return NextResponse.json({ error: 'Accent is required' }, { status: 400 });
      }
      if (!pronunciation || pronunciation.trim() === '') {
        return NextResponse.json({ error: 'Pronunciation is required' }, { status: 400 });
      }
      if (accent.trim().length > 100) {
        return NextResponse.json({ error: 'Accent name too long (max 100 characters)' }, { status: 400 });
      }
      if (pronunciation.trim().length > 500) {
        return NextResponse.json({ error: 'Pronunciation too long (max 500 characters)' }, { status: 400 });
      }

      // Check if user already added a pronunciation for this word
      const existingPronunciation = await prisma.wordPronunciation.findFirst({
        where: {
          userId: user.id,
          wordId: id
        }
      });

      if (existingPronunciation) {
        // Update existing pronunciation
        const updatedPronunciation = await prisma.wordPronunciation.update({
          where: { id: existingPronunciation.id },
          data: {
            accent: accent.trim(),
            pronunciation: pronunciation.trim()
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

        return NextResponse.json({
          success: true,
          message: 'Pronunciation updated',
          pronunciation: updatedPronunciation,
          action: 'pronunciation_updated'
        });
      } else {
        // Create new pronunciation
        const newPronunciation = await prisma.wordPronunciation.create({
          data: {
            userId: user.id,
            wordId: id,
            accent: accent.trim(),
            pronunciation: pronunciation.trim()
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

        // Create notification for word author (but not for own words)
        const word = await prisma.word.findUnique({
          where: { id },
          select: { authorId: true, title: true }
        });

        if (word && word.authorId !== user.id) {
          await prisma.notification.create({
            data: {
              userId: word.authorId,
              type: 'pronunciation',
              message: `${user.firstName} ${user.lastName} added a pronunciation in ${accent.trim()} to your word`,
              avatar: user.image || user.avatar
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Pronunciation added',
          pronunciation: newPronunciation,
          action: 'pronunciation_added'
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/main/words/[id] - Only author can delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
    if (word.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this word.' }, { status: 403 });
    }
    await prisma.word.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/words/[id] - Only author can edit
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
    if (word.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this word.' }, { status: 403 });
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
    const updatedWord = await prisma.word.update({
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
            pronunciations: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, word: updatedWord });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}