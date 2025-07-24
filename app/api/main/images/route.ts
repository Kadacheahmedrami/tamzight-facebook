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

    // Filter by category
    if (category && category !== "all") {
      whereClause.category = category
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
          description: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            has: searchTerm
          }
        },
        {
          location: {
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
    const totalImages = await prisma.image.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalImages / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch images from database with pagination
    const images = await prisma.image.findMany({
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
        timestamp: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Get current user's likes for these images
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && images.length > 0) {
      const imageIds = images.map(image => image.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          imageId: { in: imageIds }
        },
        select: {
          imageId: true,
          emoji: true
        }
      });

      // Create a map of imageId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.imageId as string, like.emoji])
      );
    }

    // Get all reactions for these images with user details
    let reactionsData = new Map<string, any>();
    if (images.length > 0) {
      const imageIds = images.map(image => image.id);
      const allReactions = await prisma.like.findMany({
        where: {
          imageId: { in: imageIds }
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

      // Group reactions by image and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const imageId = reaction.imageId;
        const emoji = reaction.emoji;
        
        // Skip if imageId or emoji is null
        if (!imageId || !emoji) {
          return acc;
        }
        
        if (!acc[imageId]) {
          acc[imageId] = {};
        }
        
        if (!acc[imageId][emoji]) {
          acc[imageId][emoji] = [];
        }
        
        acc[imageId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([imageId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this image
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [imageId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the image object from database
    type ImageFromDb = {
      id: string;
      title: string;
      description: string | null;
      timestamp: Date;
      category: string;
      image: string;
      location: string | null;
      resolution: string | null;
      tags: string[];
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
    const transformedImages = images.map((img: ImageFromDb) => {
      const imageReactions = reactionsData.get(img.id);
      
      return {
        id: img.id,
        title: img.title,
        description: img.description || "",
        author: `${img.author.firstName} ${img.author.lastName}`,
        authorId: img.author.id , 
        timestamp: `نشر بتاريخ ${img.timestamp.toLocaleDateString('ar-EG')} الساعة ${img.timestamp.toLocaleTimeString('ar-EG')}`,
        category: img.category,
        image: img.image,
        stats: {
          views: img.views,
          likes: img._count.likes,
          comments: img._count.comments,
          shares: img._count.shares
        },
        location: img.location || "",
        resolution: img.resolution || "",
        tags: img.tags,
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(img.id) : false,
        userReaction: currentUserId ? userLikesMap.get(img.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: imageReactions?.totalReactions || 0,
          summary: imageReactions?.summary || [],
          details: imageReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      images: transformedImages,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}