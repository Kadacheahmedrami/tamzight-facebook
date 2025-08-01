import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth';

// Define a custom session type that includes the user ID
type CustomSession = {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
};

export async function GET(request: NextRequest) {
  try {
    // Get current session with custom type
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    const currentUserId = session?.user?.id || null;

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build the where clause for filtering
    const whereClause: any = {}

    // Filter by subcategory
    if (category && category !== "all") {
      whereClause.subcategory = category
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase()
      whereClause.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          author: {
            OR: [
              {
                firstName: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            ]
          }
        }
      ]
    }

    // Get total count for pagination metadata
    const totalSentences = await prisma.sentence.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalSentences / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch sentences from database with pagination and pronunciations
    const sentences = await prisma.sentence.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            image: true // Include NextAuth image field as well
          }
        },
        pronunciations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
            pronunciations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Get current user's likes for these sentences
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && sentences.length > 0) {
      const sentenceIds = sentences.map(sentence => sentence.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          sentenceId: { in: sentenceIds }
        },
        select: {
          sentenceId: true,
          emoji: true
        }
      });

      // Create a map of sentenceId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.sentenceId as string, like.emoji])
      );
    }

    // Get all reactions for these sentences with user details
    let reactionsData = new Map<string, any>();
    if (sentences.length > 0) {
      const sentenceIds = sentences.map(sentence => sentence.id);
      const allReactions = await prisma.like.findMany({
        where: {
          sentenceId: { in: sentenceIds }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group reactions by sentence and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const sentenceId = reaction.sentenceId;
        const emoji = reaction.emoji;
        
        // Skip if sentenceId or emoji is null
        if (!sentenceId || !emoji) {
          return acc;
        }
        
        if (!acc[sentenceId]) {
          acc[sentenceId] = {};
        }
        
        if (!acc[sentenceId][emoji]) {
          acc[sentenceId][emoji] = [];
        }
        
        acc[sentenceId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([sentenceId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this sentence
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [sentenceId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the sentence object from database
    type SentenceFromDb = {
      id: string;
      title: string;
      content: string;
      createdAt: Date;
      category: string;
      subcategory: string | null;
      image: string | null;
      views: number;
      author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        image: string | null;
      };
      pronunciations: {
        id: string;
        accent: string;
        pronunciation: string;
        createdAt: Date;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          avatar: string | null;
        };
      }[];
      _count: {
        likes: number;
        comments: number;
        shares: number;
        pronunciations: number;
      };
    };

    // Transform the data to match your frontend format
    const transformedSentences = sentences.map((sentence: SentenceFromDb) => {
      const sentenceReactions = reactionsData.get(sentence.id);
      
      // Group pronunciations by accent
      const pronunciationsByAccent = sentence.pronunciations.reduce((acc, pronunciation) => {
        if (!acc[pronunciation.accent]) {
          acc[pronunciation.accent] = [];
        }
        acc[pronunciation.accent].push({
          id: pronunciation.id,
          pronunciation: pronunciation.pronunciation,
          createdAt: pronunciation.createdAt,
          user: {
            id: pronunciation.user.id,
            name: `${pronunciation.user.firstName} ${pronunciation.user.lastName}`,
            avatar: pronunciation.user.avatar
          }
        });
        return acc;
      }, {} as Record<string, any[]>);
      
      return {
        id: sentence.id,
        title: sentence.title,
        content: sentence.content,
        author: `${sentence.author.firstName} ${sentence.author.lastName}`,
        authorId: sentence.author.id,
        authorAvatar: sentence.author.avatar || sentence.author.image, // Fallback to NextAuth image
        timestamp: `نشر بتاريخ ${sentence.createdAt.toLocaleDateString('ar-EG')} الساعة ${sentence.createdAt.toLocaleTimeString('ar-EG')}`,
        category: sentence.category,
        subcategory: sentence.subcategory || "",
        image: sentence.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: sentence.views,
          likes: sentence._count.likes,
          comments: sentence._count.comments,
          shares: sentence._count.shares,
          pronunciations: sentence._count.pronunciations
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(sentence.id) : false,
        userReaction: currentUserId ? userLikesMap.get(sentence.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: sentenceReactions?.totalReactions || 0,
          summary: sentenceReactions?.summary || [],
          details: sentenceReactions?.byEmoji || {}
        },
        // Add pronunciations data
        pronunciations: {
          total: sentence._count.pronunciations,
          byAccent: pronunciationsByAccent,
          recent: sentence.pronunciations.slice(0, 5).map(p => ({
            id: p.id,
            accent: p.accent,
            pronunciation: p.pronunciation,
            createdAt: p.createdAt,
            user: {
              id: p.user.id,
              name: `${p.user.firstName} ${p.user.lastName}`,
              avatar: p.user.avatar
            }
          }))
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      sentences: transformedSentences,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSentences: totalSentences,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching sentences:", error)
    return NextResponse.json(
      { error: "Failed to fetch sentences" },
      { status: 500 }
    )
  }
}