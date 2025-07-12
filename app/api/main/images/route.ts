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

    // Filter by category
    if (category && category !== "all") {
      whereClause.category = category
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
          description: {
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
    const totalImages = await prisma.image.count({
      where: whereClause
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalImages / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Fetch images from database with pagination
    const images = await prisma.image.findMany({
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
        timestamp: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Define the type for the image object from database
    type ImageFromDb = {
      id: string;
      title: string;
      description: string | null;
      timestamp: Date;
      category: string;
      image: string;
      location: string | null;
      resolution: string | null;
      tags: string[];
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
    const transformedImages = images.map((img: ImageFromDb) => ({
      id: img.id,
      title: img.title,
      description: img.description || "", // Handle null description
      author: `${img.author.firstName} ${img.author.lastName}`,
      timestamp: `نشر بتاريخ ${img.timestamp.toLocaleDateString('ar-EG')} الساعة ${img.timestamp.toLocaleTimeString('ar-EG')}`,
      category: img.category,
      image: img.image,
      stats: {
        views: img.views,
        likes: img._count.likes,
        comments: img._count.comments,
        shares: img._count.shares
      },
      location: img.location || "", // Handle null location
      resolution: img.resolution || "", // Handle null resolution
      tags: img.tags
    }))

    // Return paginated response
    return NextResponse.json({
      images: transformedImages,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
        limit: limit
      }
    })

  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    )
  }
}