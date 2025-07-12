import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
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
        likes: {
          select: {
            id: true,
            emoji: true
          }
        },
        comments: {
          select: {
            id: true
          }
        },
        shares: {
          select: {
            id: true
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
      likes: Array<{
        id: string;
        emoji: string;
      }>;
      comments: Array<{
        id: string;
      }>;
      shares: Array<{
        id: string;
      }>;
      _count: {
        likes: number;
        comments: number;
        shares: number;
      };
    };

    // Transform the data to match your frontend format
    const transformedPosts = posts.map((post: PostFromDb) => ({
      id: post.id,
      title: post.title,
      content: post.content || "", // Handle null content
      author: `${post.author.firstName} ${post.author.lastName}`,
      timestamp: `نشر بتاريخ ${post.createdAt.toLocaleDateString('ar-EG')} الساعة ${post.createdAt.toLocaleTimeString('ar-EG')}`,
      category: post.category,
      subcategory: post.subcategory || "", // Handle null subcategory
      image: post.image || "/placeholder.svg?height=300&width=600", // Handle null image
      stats: {
        views: post.views,
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares
      }
    }))

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