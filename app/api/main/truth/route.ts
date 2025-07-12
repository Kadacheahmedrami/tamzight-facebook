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

    // Use the actual Prisma type instead of custom type
    type PrismaTruth = typeof truths[0]

    // Transform the data to match your frontend format
    const transformedTruths = truths.map((truth: PrismaTruth) => ({
      id: truth.id,
      title: truth.title,
      content: truth.content,
      author: `${truth.author.firstName} ${truth.author.lastName}`,
      timestamp: `نشر بتاريخ ${truth.createdAt.toLocaleDateString('ar-EG')} الساعة ${truth.createdAt.toLocaleTimeString('ar-EG')}`,
      category: truth.category,
      subcategory: truth.subcategory || "", // Handle null subcategory
      image: truth.image || "/placeholder.svg?height=300&width=600",
      stats: {
        views: truth.views,
        likes: truth._count.likes,
        comments: truth._count.comments,
        shares: truth._count.shares
      }
    }))

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