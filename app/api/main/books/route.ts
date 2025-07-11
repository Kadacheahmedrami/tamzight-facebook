import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    
    // استخراج معلمات الترقيم
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 5 // حجم الصفحة ثابت = 5
    const skip = (page - 1) * limit

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

    // الحصول على العدد الإجمالي للكتب
    const totalBooks = await prisma.book.count({
      where: whereClause,
    })

    // Fetch books from database with pagination
    const books = await prisma.book.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
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
    const transformedBooks = books.map((book: any) => ({
      id: book.id,
      title: book.title,
      content: book.content,
      author: `${book.author.firstName} ${book.author.lastName}`,
      timestamp: `نشر بتاريخ ${book.createdAt.toLocaleDateString('ar-EG')} الساعة ${book.createdAt.toLocaleTimeString('ar-EG')}`,
      category: book.category,
      subcategory: book.subcategory,
      image: book.image || "/placeholder.svg?height=300&width=600",
      stats: {
        views: book.views,
        likes: book._count.likes,
        comments: book._count.comments,
        shares: book._count.shares
      },
      pages: book.pages,
      language: book.language,
      isbn: book.isbn
    }))

    // حساب معلومات الترقيم
    const totalPages = Math.ceil(totalBooks / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      data: transformedBooks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalBooks,
        itemsPerPage: limit,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      }
    })
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    )
  }
}