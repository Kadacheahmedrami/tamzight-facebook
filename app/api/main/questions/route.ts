import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build the where clause for filtering
    const whereClause: any = {}

    // Filter by type (answered/unanswered)
    if (type && type !== "all") {
      if (type === "answer") {
        whereClause.answered = false
      } else if (type === "vote") {
        whereClause.answered = true
      }
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
    const totalQuestions = await prisma.question.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalQuestions / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch questions from database with pagination
    const questions = await prisma.question.findMany({
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

    // Define the type for question
    type QuestionWithRelations = {
      id: string;
      title: string;
      content: string;
      author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
      };
      createdAt: Date;
      category: string;
      type: string;
      answered: boolean;
      image?: string | null;
      views: number;
      _count: {
        likes: number;
        comments: number;
        shares: number;
      };
    };

    // Transform the data to match your frontend format
    const transformedQuestions = questions.map((question: QuestionWithRelations) => ({
      id: question.id,
      title: question.title,
      content: question.content,
      author: `${question.author.firstName} ${question.author.lastName}`,
      timestamp: `طرح سؤال بتاريخ ${question.createdAt.toLocaleDateString('ar-EG')} الساعة ${question.createdAt.toLocaleTimeString('ar-EG')}`,
      category: question.category,
      type: question.type,
      answered: question.answered,
      image: question.image || "/placeholder.svg?height=300&width=600",
      stats: {
        views: question.views,
        likes: question._count.likes,
        comments: question._count.comments,
        shares: question._count.shares
      }
    }))

    // Return paginated response
    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalQuestions: totalQuestions,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}