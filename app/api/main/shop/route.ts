import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get session (optional - depends on if you want to restrict access)
    const session = await getServerSession(authOptions);
    
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
    
    if (category) {
      whereClause.category = category;
    }
    
    if (subcategory) {
      whereClause.subcategory = subcategory;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (inStock !== null && inStock !== undefined) {
      whereClause.inStock = inStock === 'true';
    }
    
    // Build orderBy clause
    const orderByClause: any = {};
    if (sortBy === 'views' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      orderByClause[sortBy] = sortOrder;
    } else {
      orderByClause.createdAt = 'desc';
    }
    
    // Execute database queries
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip: offset,
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
              emoji: true,
              userId: true
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
          }
        }
      }),
      prisma.product.count({
        where: whereClause
      })
    ]);
    
    // Transform data to match your frontend format
    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      content: product.content,
      author: `${product.author.firstName} ${product.author.lastName}`,
      authorId: product.author.id,
      authorAvatar: product.author.avatar,
      timestamp: product.createdAt.toISOString(),
      category: product.category,
      subcategory: product.subcategory,
      image: product.image,
      stats: {
        views: product.views,
        likes: product.likes.length,
        comments: product.comments.length,
        shares: product.shares.length
      },
      price: product.price,
      currency: product.currency,
      inStock: product.inStock,
      sizes: product.sizes,
      colors: product.colors,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
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

