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
    const totalPosts = await prisma.post.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch posts from database with pagination
    const posts = await prisma.post.findMany({
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

    // Get current user's likes for these posts
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && posts.length > 0) {
      const postIds = posts.map(post => post.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds }
        },
        select: {
          postId: true,
          emoji: true
        }
      });

      // Create a map of postId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.postId as string, like.emoji])
      );
    }

    // Get all reactions for these posts with user details
    let reactionsData = new Map<string, any>();
    if (posts.length > 0) {
      const postIds = posts.map(post => post.id);
      const allReactions = await prisma.like.findMany({
        where: {
          postId: { in: postIds }
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

      // Group reactions by post and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const postId = reaction.postId;
        const emoji = reaction.emoji;
        
        // Skip if postId or emoji is null
        if (!postId || !emoji) {
          return acc;
        }
        
        if (!acc[postId]) {
          acc[postId] = {};
        }
        
        if (!acc[postId][emoji]) {
          acc[postId][emoji] = [];
        }
        
        acc[postId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([postId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this post
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [postId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the post object from database
    type PostFromDb = {
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
    const transformedPosts = posts.map((post: PostFromDb) => {
      const postReactions = reactionsData.get(post.id);
      
      return {
        id: post.id,
        title: post.title,
        content: post.content || "",
        author: `${post.author.firstName} ${post.author.lastName}`,
        authorId: post.author.id , 
        timestamp: `نشر بتاريخ ${post.createdAt.toLocaleDateString('ar-EG')} الساعة ${post.createdAt.toLocaleTimeString('ar-EG')}`,
        category: post.category,
        subcategory: post.subcategory || "",
        image: post.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: post.views,
          likes: post._count.likes,
          comments: post._count.comments,
          shares: post._count.shares
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(post.id) : false,
        userReaction: currentUserId ? userLikesMap.get(post.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: postReactions?.totalReactions || 0,
          summary: postReactions?.summary || [],
          details: postReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}