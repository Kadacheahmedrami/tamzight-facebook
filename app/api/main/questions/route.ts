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
          category: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          type: {
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

    // Get current user's likes for these questions
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && questions.length > 0) {
      const questionIds = questions.map(question => question.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          questionId: { in: questionIds }
        },
        select: {
          questionId: true,
          emoji: true
        }
      });

      // Create a map of questionId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.questionId as string, like.emoji])
      );
    }

    // Get all reactions for these questions with user details
    let reactionsData = new Map<string, any>();
    if (questions.length > 0) {
      const questionIds = questions.map(question => question.id);
      const allReactions = await prisma.like.findMany({
        where: {
          questionId: { in: questionIds }
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

      // Group reactions by question and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const questionId = reaction.questionId;
        const emoji = reaction.emoji;
        
        // Skip if questionId or emoji is null
        if (!questionId || !emoji) {
          return acc;
        }
        
        if (!acc[questionId]) {
          acc[questionId] = {};
        }
        
        if (!acc[questionId][emoji]) {
          acc[questionId][emoji] = [];
        }
        
        acc[questionId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([questionId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this question
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [questionId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for question from database
    type QuestionFromDb = {
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
    const transformedQuestions = questions.map((question: QuestionFromDb) => {
      const questionReactions = reactionsData.get(question.id);
      
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        author: `${question.author.firstName} ${question.author.lastName}`,
        authorId: question.author.id , 
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
        },
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(question.id) : false,
        userReaction: currentUserId ? userLikesMap.get(question.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: questionReactions?.totalReactions || 0,
          summary: questionReactions?.summary || [],
          details: questionReactions?.byEmoji || {}
        }
      }
    })

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