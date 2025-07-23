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
    const status = searchParams.get("status") // Filter by idea status
    const priority = searchParams.get("priority") // Filter by priority
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build the where clause for filtering
    const whereClause: any = {}

    // Filter by category
    if (category && category !== "all") {
      whereClause.category = category
    }

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = status
    }

    // Filter by priority
    if (priority && priority !== "all") {
      whereClause.priority = priority
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
    const totalIdeas = await prisma.idea.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalIdeas / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch ideas from database with pagination
    const ideas = await prisma.idea.findMany({
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

    // Get current user's likes for these ideas
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && ideas.length > 0) {
      const ideaIds = ideas.map(idea => idea.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          ideaId: { in: ideaIds }
        },
        select: {
          ideaId: true,
          emoji: true
        }
      });

      // Create a map of ideaId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.ideaId as string, like.emoji])
      );
    }

    // Get all reactions for these ideas with user details
    let reactionsData = new Map<string, any>();
    if (ideas.length > 0) {
      const ideaIds = ideas.map(idea => idea.id);
      const allReactions = await prisma.like.findMany({
        where: {
          ideaId: { in: ideaIds }
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

      // Group reactions by idea and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const ideaId = reaction.ideaId;
        const emoji = reaction.emoji;
        
        // Skip if ideaId or emoji is null
        if (!ideaId || !emoji) {
          return acc;
        }
        
        if (!acc[ideaId]) {
          acc[ideaId] = {};
        }
        
        if (!acc[ideaId][emoji]) {
          acc[ideaId][emoji] = [];
        }
        
        acc[ideaId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([ideaId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this idea
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [ideaId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the idea object from database
    type IdeaFromDb = {
      id: string;
      title: string;
      content: string | null;
      createdAt: Date;
      category: string;
      image: string | null;
      views: number;
      status: string;
      priority: string;
      votes: number;
      timestamp: Date;
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
    const transformedIdeas = ideas.map((idea: IdeaFromDb) => {
      const ideaReactions = reactionsData.get(idea.id);
      
      return {
        id: idea.id,
        title: idea.title,
        content: idea.content || "",
        author: `${idea.author.firstName} ${idea.author.lastName}`,
        timestamp: `نشر بتاريخ ${idea.createdAt.toLocaleDateString('ar-EG')} الساعة ${idea.createdAt.toLocaleTimeString('ar-EG')}`,
        category: idea.category,
        image: idea.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: idea.views,
          likes: idea._count.likes,
          comments: idea._count.comments,
          shares: idea._count.shares,
          votes: idea.votes // Include votes in stats for consistency
        },
        // Idea-specific fields
        status: idea.status,
        priority: idea.priority,
        votes: idea.votes,
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(idea.id) : false,
        userReaction: currentUserId ? userLikesMap.get(idea.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: ideaReactions?.totalReactions || 0,
          summary: ideaReactions?.summary || [],
          details: ideaReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      ideas: transformedIdeas,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalIdeas: totalIdeas,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    )
  }
}