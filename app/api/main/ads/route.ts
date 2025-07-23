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
    const totalAds = await prisma.ad.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalAds / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch ads from database with pagination
    const ads = await prisma.ad.findMany({
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

    // Get current user's likes for these ads
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && ads.length > 0) {
      const adIds = ads.map(ad => ad.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          adId: { in: adIds }
        },
        select: {
          adId: true,
          emoji: true
        }
      });

      // Create a map of adId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.adId as string, like.emoji])
      );
    }

    // Get all reactions for these ads with user details
    let reactionsData = new Map<string, any>();
    if (ads.length > 0) {
      const adIds = ads.map(ad => ad.id);
      const allReactions = await prisma.like.findMany({
        where: {
          adId: { in: adIds }
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

      // Group reactions by ad and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const adId = reaction.adId;
        const emoji = reaction.emoji;
        
        // Skip if adId or emoji is null
        if (!adId || !emoji) {
          return acc;
        }
        
        if (!acc[adId]) {
          acc[adId] = {};
        }
        
        if (!acc[adId][emoji]) {
          acc[adId][emoji] = [];
        }
        
        acc[adId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([adId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this ad
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [adId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the ad object from database
    type AdFromDb = {
      id: string;
      title: string;
      content: string | null;
      createdAt: Date;
      category: string;
      subcategory: string | null;
      image: string | null;
      views: number;
      targetAmount: number | null;
      currentAmount: number | null;
      deadline: Date | null;
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
    const transformedAds = ads.map((ad) => {
      const adReactions = reactionsData.get(ad.id);

      return {
        id: ad.id,
        title: ad.title,
        content: ad.content || "",
        author: `${ad.author.firstName} ${ad.author.lastName}`,
        timestamp: `نشر بتاريخ ${ad.createdAt.toLocaleDateString('ar-EG')} الساعة ${ad.createdAt.toLocaleTimeString('ar-EG')}`,
        category: ad.category,
        subcategory: ad.subcategory || "",
        image: ad.image || "/placeholder.svg?height=300&width=600",
        // Campaign-specific fields
        targetAmount: ad.targetAmount !== null ? Number(ad.targetAmount) : null,
        currentAmount: ad.currentAmount !== null ? Number(ad.currentAmount) : null,
        deadline: ad.deadline ? ad.deadline.toISOString() : null,
        stats: {
          views: ad.views,
          likes: ad._count.likes,
          comments: ad._count.comments,
          shares: ad._count.shares
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(ad.id) : false,
        userReaction: currentUserId ? userLikesMap.get(ad.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: adReactions?.totalReactions || 0,
          summary: adReactions?.summary || [],
          details: adReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      ads: transformedAds,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalAds: totalAds,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching ads:", error)
    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    )
  }
}