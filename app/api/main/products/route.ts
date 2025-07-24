import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause: any = {};
    
    // Filter by category
    if (category && category !== "all") {
      whereClause.category = category;
    }
    
    // Filter by subcategory
    if (subcategory && subcategory !== "all") {
      whereClause.subcategory = subcategory;
    }
    
    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
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
          subcategory: {
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
      ];
    }
    
    // Filter by stock status
    if (inStock !== null && inStock !== undefined) {
      whereClause.inStock = inStock === 'true';
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereClause.price.lte = parseFloat(maxPrice);
      }
    }
    
    // Build orderBy clause
    const orderByClause: any = {};
    if (sortBy === 'views' || sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'price') {
      orderByClause[sortBy] = sortOrder;
    } else {
      orderByClause.createdAt = 'desc';
    }
    
    // Get total count for pagination metadata
    const totalProducts = await prisma.product.count({
      where: whereClause
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    // Fetch products from database with pagination
    const products = await prisma.product.findMany({
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
      orderBy: orderByClause,
      skip: offset,
      take: limit
    });
    
    // Get current user's likes for these products
    let userLikesMap = new Map<string, string | null>();
    if (currentUserId && products.length > 0) {
      const productIds = products.map(product => product.id);
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          productId: { in: productIds }
        },
        select: {
          productId: true,
          emoji: true
        }
      });

      // Create a map of productId -> emoji with type safety
      userLikesMap = new Map(
        userLikes.map(like => [like.productId as string, like.emoji])
      );
    }

    // Get all reactions for these products with user details
    let reactionsData = new Map<string, any>();
    if (products.length > 0) {
      const productIds = products.map(product => product.id);
      const allReactions = await prisma.like.findMany({
        where: {
          productId: { in: productIds }
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

      // Group reactions by product and emoji
      const groupedReactions = allReactions.reduce((acc, reaction) => {
        const productId = reaction.productId;
        const emoji = reaction.emoji;
        
        // Skip if productId or emoji is null
        if (!productId || !emoji) {
          return acc;
        }
        
        if (!acc[productId]) {
          acc[productId] = {};
        }
        
        if (!acc[productId][emoji]) {
          acc[productId][emoji] = [];
        }
        
        acc[productId][emoji].push({
          userId: reaction.user.id,
          userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
          userAvatar: reaction.user.avatar,
          createdAt: reaction.createdAt
        });
        
        return acc;
      }, {} as Record<string, Record<string, any[]>>);

      // Convert to Map and calculate reaction summary
      reactionsData = new Map(
        Object.entries(groupedReactions).map(([productId, reactions]) => {
          // Calculate total reactions per emoji
          const reactionSummary = Object.entries(reactions).map(([emoji, users]) => ({
            emoji,
            count: users.length,
            users: users
          }));

          // Calculate total reactions for this product
          const totalReactions = reactionSummary.reduce((sum, reaction) => sum + reaction.count, 0);

          return [productId, {
            summary: reactionSummary,
            totalReactions,
            byEmoji: reactions
          }];
        })
      );
    }

    // Define the type for the product object from database
    type ProductFromDb = {
      id: string;
      title: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      category: string;
      subcategory: string | null;
      image: string | null;
      views: number;
      price: number;
      currency: string;
      inStock: boolean;
      sizes: string[];
      colors: string[];
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

    // Transform data to match your frontend format
    const transformedProducts = products.map((product) => {
      const productReactions = reactionsData.get(product.id);

      return {
        id: product.id,
        title: product.title,
        content: product.content,
        author: `${product.author.firstName} ${product.author.lastName}`,
        authorId: product.author.id,
        authorAvatar: product.author.avatar,
        timestamp: `نشر بتاريخ ${product.createdAt.toLocaleDateString('ar-EG')} الساعة ${product.createdAt.toLocaleTimeString('ar-EG')}`,
        category: product.category,
        subcategory: product.subcategory || "",
        image: product.image || "/placeholder.svg?height=300&width=600",
        stats: {
          views: product.views,
          likes: product._count.likes,
          comments: product._count.comments,
          shares: product._count.shares
        },
        price: product.price,
        currency: product.currency,
        inStock: product.inStock,
        sizes: product.sizes,
        colors: product.colors,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        // Add user interaction information
        userHasLiked: currentUserId ? userLikesMap.has(product.id) : false,
        userReaction: currentUserId ? userLikesMap.get(product.id) || null : null,
        // Add detailed reactions data
        reactions: {
          total: productReactions?.totalReactions || 0,
          summary: productReactions?.summary || [],
          details: productReactions?.byEmoji || {}
        }
      };
    });
    
    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: totalProducts,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}