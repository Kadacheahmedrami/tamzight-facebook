import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ContentItem {
  id: number;
  title: string;
  content?: string;
  description?: string;
  authorId: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  timestamp: Date;
  category: string;
  subcategory?: string | null;
  image?: string | null;
  views: number;
  type: string;
  likes: Array<{ id: number; emoji: string; userId: number; user: { firstName: string; lastName: string } }>;
  comments: Array<{ id: number; content: string; userId: number }>;
  shares: Array<{ id: number; userId: number }>;
  _count: {
    likes: number;
    comments: number;
    shares: number;
  };
  // Product specific fields
  price?: number;
  currency?: string;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
}

const baseSelect = {
  id: true,
  title: true,
  authorId: true,
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  },
  timestamp: true,
  category: true,
  views: true,
  likes: {
    select: {
      id: true,
      emoji: true,
      userId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  comments: {
    select: {
      id: true,
      content: true,
      userId: true,
    },
    take: 3,
  },
  shares: {
    select: {
      id: true,
      userId: true,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
      shares: true,
    },
  },
};

// Model-specific select configurations based on actual schema
const selectConfigs = {
  post: { 
    ...baseSelect, 
    content: true, 
    subcategory: true, 
    image: true
  },
  book: { 
    ...baseSelect, 
    content: true, 
    subcategory: true, 
    image: true
  },
  idea: { 
    ...baseSelect, 
    content: true
  },
  image: { 
    ...baseSelect, 
    description: true, 
    image: true
  },
  video: { 
    ...baseSelect, 
    content: true, 
    subcategory: true, 
    image: true
  },
  truth: { 
    ...baseSelect, 
    content: true, 
    subcategory: true, 
    image: true
  },
  question: { 
    ...baseSelect, 
    content: true
  },
  ad: { 
    ...baseSelect, 
    content: true, 
    subcategory: true, 
    image: true
  },
  product: { 
    ...baseSelect, 
    content: true, 
    image: true,
    subcategory: true,
    price: true,
    currency: true,
    inStock: true,
    sizes: true,
    colors: true
  },
};

// Enhanced connection handling
const ensurePrismaConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
  } catch (error) {
    console.error('Failed to connect to Prisma:', error);
    throw new Error('Database connection failed');
  }
};

const safeQuery = async (queryFn: () => Promise<any>, modelName: string) => {
  try {
    const result = await queryFn();
    console.log(`${modelName} query result:`, result?.length || 0, 'items');
    return result;
  } catch (error) {
    console.error(`Error querying ${modelName}:`, error);
    return [];
  }
};

const normalizeContent = (items: any[], type: string): ContentItem[] => {
  return items.map((item: any) => ({
    ...item,
    type,
    // Set subcategory to null for models that don't have it
    subcategory: item.subcategory || null,
    image: item.image || null,
    content: item.content || item.description || null,
    description: type === 'image' ? item.description : undefined,
    // Product specific fields
    price: item.price || undefined,
    currency: item.currency || undefined,
    inStock: item.inStock !== undefined ? item.inStock : undefined,
    sizes: item.sizes || undefined,
    colors: item.colors || undefined,
  }));
};

export async function GET(request: NextRequest) {
  try {
    // Ensure Prisma connection is established
    await ensurePrismaConnection();
    
    const { searchParams } = new URL(request.url);
    
    // Extract pagination parameters (using offset-based pagination to match frontend)
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || 'all';

    const orderBy = { timestamp: 'desc' as const };
    
    // Use English model names that match your Prisma schema
    const models = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'] as const;

    // Filter models based on type parameter
    const modelsToQuery = type === 'all' ? models : models.filter(model => model === type);
    
    console.log('Querying models:', modelsToQuery);
    console.log('Pagination params:', { limit, offset, type });
    
    // Query all models without pagination first
    const results = await Promise.all(
      modelsToQuery.map(model => 
        safeQuery(async () => {
          // Add connection check for each query
          const modelClient = prisma[model] as any;
          if (!modelClient) {
            throw new Error(`Model ${model} not found in Prisma client`);
          }
          
          return await modelClient.findMany({
            select: selectConfigs[model],
            orderBy,
          });
        }, model)
      )
    );

    const allContent: ContentItem[] = results.flatMap((items, i) => 
      normalizeContent(items || [], modelsToQuery[i])
    );

    console.log('Total items before sorting:', allContent.length);
    console.log('Items by type:', allContent.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    // Sort all content by timestamp
    const sortedContent = allContent.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination after sorting
    const paginatedContent = sortedContent.slice(offset, offset + limit);
    const totalItems = sortedContent.length;
    const hasMore = offset + limit < totalItems;

    console.log('Pagination Debug:', {
      totalItems,
      requestedOffset: offset,
      requestedLimit: limit,
      returnedItems: paginatedContent.length,
      hasMore,
      nextOffset: offset + limit
    });

    // Return data in the format expected by frontend
    return NextResponse.json({
      success: true,
      data: paginatedContent,
      meta: {
        total: totalItems,
        limit: limit,
        offset: offset,
        hasMore: hasMore,
        type: type,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching latest content:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        meta: {
          total: 0,
          limit: 0,
          offset: 0,
          hasMore: false,
          type: 'all',
        },
        error: 'Failed to fetch latest content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Ensure proper cleanup
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure Prisma connection is established
    await ensurePrismaConnection();
    
    const body = await request.json();
    const { type, authorId, ...contentData } = body;

    if (!type || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Type and authorId are required' },
        { status: 400 }
      );
    }

    const includeConfig = {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          id: true,
          emoji: true,
          userId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true,
        },
      },
    };

    const validTypes = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'];
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    const modelClient = prisma[type as keyof typeof prisma] as any;
    if (!modelClient) {
      return NextResponse.json(
        { success: false, error: `Model ${type} not found` },
        { status: 400 }
      );
    }

    const newContent = await modelClient.create({
      data: { ...contentData, authorId },
      include: includeConfig,
    });

    return NextResponse.json({
      success: true,
      data: { ...newContent, type },
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Ensure proper cleanup
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError);
    }
  }
}