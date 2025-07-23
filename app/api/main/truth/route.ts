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
    const totalTruths = await prisma.truth.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalTruths / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch truths from database with pagination
    const truths = await prisma.truth.findMany({
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

    // Get current user's likes for these truths
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && truths.length > 0) {
      const truthIds = truths.map(truth => truth.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          truthId: { in: truthIds }
        },
        select: {
          truthId: true,
          emoji: true
        }
      });

      // Create a map of truthId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.truthId as string, like.emoji])
      );
    }

    // Get all reactions for these truths with user details
    let reactionsData = new Map<string, any>();
    if (truths.length > 0) {
      const truthIds = truths.map(truth => truth.id);
      const allReactions = await prisma.like.findMany({
        where: {
          truthId: { in: truthIds }
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

      // Group reactions by truth and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const truthId = reaction.truthId;
        const emoji = reaction.emoji;
        
        // Skip if truthId or emoji is null
        if (!truthId || !emoji) {
          return acc;
        }
        
        if (!acc[truthId]) {
          acc[truthId] = {};
        }
        
        if (!acc[truthId][emoji]) {
          acc[truthId][emoji] = [];
        }
        
        acc[truthId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([truthId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this truth
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [truthId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the truth object from database
    type TruthFromDb = {
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
    const transformedTruths = truths.map((truth: TruthFromDb) => {
      const truthReactions = reactionsData.get(truth.id);
      
      return {
        id: truth.id,
        title: truth.title,
        content: truth.content || "",
        author: `${truth.author.firstName} ${truth.author.lastName}`,
        timestamp: `نشر بتاريخ ${truth.createdAt.toLocaleDateString('ar-EG')} الساعة ${truth.createdAt.toLocaleTimeString('ar-EG')}`,
        category: truth.category,
        subcategory: truth.subcategory || "",
        image: truth.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: truth.views,
          likes: truth._count.likes,
          comments: truth._count.comments,
          shares: truth._count.shares
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(truth.id) : false,
        userReaction: currentUserId ? userLikesMap.get(truth.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: truthReactions?.totalReactions || 0,
          summary: truthReactions?.summary || [],
          details: truthReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      truths: transformedTruths,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalTruths: totalTruths,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching truths:", error)
    return NextResponse.json(
      { error: "Failed to fetch truths" },
      { status: 500 }
    )
  }
}