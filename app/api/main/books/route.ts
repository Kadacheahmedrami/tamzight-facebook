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
          isbn: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          language: {
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
    const totalBooks = await prisma.book.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalBooks / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch books from database with pagination
    const books = await prisma.book.findMany({
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

    // Get current user's likes for these books
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && books.length > 0) {
      const bookIds = books.map(book => book.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          bookId: { in: bookIds }
        },
        select: {
          bookId: true,
          emoji: true
        }
      });

      // Create a map of bookId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.bookId as string, like.emoji])
      );
    }

    // Get all reactions for these books with user details
    let reactionsData = new Map<string, any>();
    if (books.length > 0) {
      const bookIds = books.map(book => book.id);
      const allReactions = await prisma.like.findMany({
        where: {
          bookId: { in: bookIds }
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

      // Group reactions by book and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const bookId = reaction.bookId;
        const emoji = reaction.emoji;
        
        // Skip if bookId or emoji is null
        if (!bookId || !emoji) {
          return acc;
        }
        
        if (!acc[bookId]) {
          acc[bookId] = {};
        }
        
        if (!acc[bookId][emoji]) {
          acc[bookId][emoji] = [];
        }
        
        acc[bookId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([bookId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this book
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [bookId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the book object from database
    type BookFromDb = {
      id: string;
      title: string;
      content: string | null;
      createdAt: Date;
      category: string;
      subcategory: string | null;
      image: string | null;
      views: number;
      pages: number | null;
      language: string | null;
      isbn: string | null;
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
    const transformedBooks = books.map((book: BookFromDb) => {
      const bookReactions = reactionsData.get(book.id);
      
      return {
        id: book.id,
        title: book.title,
        content: book.content || "",
        author: `${book.author.firstName} ${book.author.lastName}`,
        authorId: book.author.id , 
        timestamp: `نشر بتاريخ ${book.createdAt.toLocaleDateString('ar-EG')} الساعة ${book.createdAt.toLocaleTimeString('ar-EG')}`,
        category: book.category,
        subcategory: book.subcategory || "",
        image: book.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: book.views,
          likes: book._count.likes,
          comments: book._count.comments,
          shares: book._count.shares
        },
        // Book-specific fields
        pages: book.pages,
        language: book.language,
        isbn: book.isbn,
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(book.id) : false,
        userReaction: currentUserId ? userLikesMap.get(book.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: bookReactions?.totalReactions || 0,
          summary: bookReactions?.summary || [],
          details: bookReactions?.byEmoji || {}
        }
      }
    })

    // Return paginated response
    return NextResponse.json({
      books: transformedBooks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalBooks: totalBooks,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
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