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

    // Fetch truths from database
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
      }
    })

    // Transform the data to match your frontend format
    const transformedTruths = truths.map(truth => ({
      id: truth.id,
      title: truth.title,
      content: truth.content,
      author: `${truth.author.firstName} ${truth.author.lastName}`,
      timestamp: `نشر بتاريخ ${truth.createdAt.toLocaleDateString('ar-EG')} الساعة ${truth.createdAt.toLocaleTimeString('ar-EG')}`,
      category: truth.category,
      subcategory: truth.subcategory,
      image: truth.image || "/placeholder.svg?height=300&width=600",
      stats: {
        views: truth.views,
        likes: truth._count.likes,
        comments: truth._count.comments,
        shares: truth._count.shares
      }
    }))

    return NextResponse.json(transformedTruths)
  } catch (error) {
    console.error("Error fetching truths:", error)
    return NextResponse.json(
      { error: "Failed to fetch truths" },
      { status: 500 }
    )
  }
}