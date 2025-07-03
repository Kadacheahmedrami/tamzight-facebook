import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

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

    // Fetch posts from database
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
      }
    })

    // Transform the data to match your frontend format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: `${post.author.firstName} ${post.author.lastName}`,
      timestamp: `نشر بتاريخ ${post.createdAt.toLocaleDateString('ar-EG')} الساعة ${post.createdAt.toLocaleTimeString('ar-EG')}`,
      category: post.category,
      subcategory: post.subcategory,
      image: post.image || "/placeholder.svg?height=300&width=600",
      stats: {
        views: post.views,
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares
      }
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}