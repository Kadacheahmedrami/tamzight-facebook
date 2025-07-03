import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")

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

    // Fetch questions from database
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
      }
    })

    // Transform the data to match your frontend format
    const transformedQuestions = questions.map(question => ({
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

    return NextResponse.json(transformedQuestions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}