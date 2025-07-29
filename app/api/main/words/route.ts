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
    const totalWords = await prisma.word.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalWords / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch words from database with pagination
    const words = await prisma.word.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Get current user's likes for these words
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && words.length > 0) {
      const wordIds = words.map(word => word.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          wordId: { in: wordIds }
        },
        select: {
          wordId: true,
          emoji: true
        }
      });

      // Create a map of wordId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.wordId as string, like.emoji])
      );
    }

    // Get all reactions for these words with user details
    let reactionsData = new Map<string, any>();
    if (words.length > 0) {
      const wordIds = words.map(word => word.id);
      const allReactions = await prisma.like.findMany({
        where: {
          wordId: { in: wordIds }
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

      // Group reactions by word and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const wordId = reaction.wordId;
        const emoji = reaction.emoji;
        
        // Skip if wordId or emoji is null
        if (!wordId || !emoji) {
          return acc;
        }
        
        if (!acc[wordId]) {
          acc[wordId] = {};
        }
        
        if (!acc[wordId][emoji]) {
          acc[wordId][emoji] = [];
        }
        
        acc[wordId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([wordId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this word
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [wordId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the word object from database
    type WordFromDb = {
      id: string;
      title: string;
      content: string | null;
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
      };
      _count: {
        likes: number;
        comments: number;
        shares: number;
      };
    };

    // Transform the data to match your frontend format
    const transformedWords = words.map((word: WordFromDb) => {
      const wordReactions = reactionsData.get(word.id);
      
      return {
        id: word.id,
        title: word.title,
        content: word.content || "",
        author: `${word.author.firstName} ${word.author.lastName}`,
        authorId: word.author.id,
        timestamp: `نشر بتاريخ ${word.createdAt.toLocaleDateString('ar-EG')} الساعة ${word.createdAt.toLocaleTimeString('ar-EG')}`,
        category: word.category,
        subcategory: word.subcategory || "",
        image: word.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: word.views,
          likes: word._count.likes,
          comments: word._count.comments,
          shares: word._count.shares
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(word.id) : false,
        userReaction: currentUserId ? userLikesMap.get(word.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: wordReactions?.totalReactions || 0,
          summary: wordReactions?.summary || [],
          details: wordReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      words: transformedWords,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalWords: totalWords,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching words:", error)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}
