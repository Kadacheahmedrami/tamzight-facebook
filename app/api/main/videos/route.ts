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
    const totalVideos = await prisma.video.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalVideos / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch videos from database with pagination
    const videos = await prisma.video.findMany({
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

    // Get current user's likes for these videos
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && videos.length > 0) {
      const videoIds = videos.map(video => video.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          videoId: { in: videoIds }
        },
        select: {
          videoId: true,
          emoji: true
        }
      });

      // Create a map of videoId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.videoId as string, like.emoji])
      );
    }

    // Get all reactions for these videos with user details
    let reactionsData = new Map<string, any>();
    if (videos.length > 0) {
      const videoIds = videos.map(video => video.id);
      const allReactions = await prisma.like.findMany({
        where: {
          videoId: { in: videoIds }
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

      // Group reactions by video and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const videoId = reaction.videoId;
        const emoji = reaction.emoji;
        
        // Skip if videoId or emoji is null
        if (!videoId || !emoji) {
          return acc;
        }
        
        if (!acc[videoId]) {
          acc[videoId] = {};
        }
        
        if (!acc[videoId][emoji]) {
          acc[videoId][emoji] = [];
        }
        
        acc[videoId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([videoId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this video
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [videoId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the video object from database
    type VideoFromDb = {
      id: string;
      title: string;
      content: string | null;
      createdAt: Date;
      category: string;
      subcategory: string | null;
      image: string | null;
      duration: number | null;
      quality: string | null;
      language: string | null;
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
    const transformedVideos = videos.map((video) => {
      const videoReactions = reactionsData.get(video.id);

      return {
        id: video.id,
        title: video.title,
        content: video.content || "",
        author: `${video.author.firstName} ${video.author.lastName}`,
        authorId: video.author.id , 
        timestamp: `نشر بتاريخ ${video.createdAt.toLocaleDateString('ar-EG')} الساعة ${video.createdAt.toLocaleTimeString('ar-EG')}`,
        category: video.category,
        subcategory: video.subcategory || "",
        image: video.image || "/placeholder.svg?height=300&width=600",
        duration: video.duration || 0,
        quality: video.quality || "HD",
        language: video.language || "ar",
        stats: {
          views: video.views,
          likes: video._count.likes,
          comments: video._count.comments,
          shares: video._count.shares
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(video.id) : false,
        userReaction: currentUserId ? userLikesMap.get(video.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: videoReactions?.totalReactions || 0,
          summary: videoReactions?.summary || [],
          details: videoReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalVideos: totalVideos,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    )
  }
}