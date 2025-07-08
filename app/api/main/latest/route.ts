import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  likes: Array<{ id: number; emoji: string; userId: number }>;
  comments: Array<{ id: number; content: string; userId: number }>;
  shares: Array<{ id: number; userId: number }>;
  _count: {
    likes: number;
    comments: number;
    shares: number;
  };
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

// Fixed select configurations - removed subcategory from image and product
const selectConfigs = {
  post: { ...baseSelect, content: true, subcategory: true, image: true },
  book: { ...baseSelect, content: true, subcategory: true, image: true },
  idea: { ...baseSelect, content: true },
  image: { ...baseSelect, description: true, image: true }, // removed subcategory
  video: { ...baseSelect, content: true, subcategory: true, image: true },
  truth: { ...baseSelect, content: true, subcategory: true, image: true },
  question: { ...baseSelect, content: true },
  ad: { ...baseSelect, content: true, subcategory: true, image: true },
  product: { ...baseSelect, content: true, image: true }, // removed subcategory
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
  }));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || 'all';

    const orderBy = { timestamp: 'desc' as const };
    const models = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'] as const;
    
    // Filter models based on type parameter
    const modelsToQuery = type === 'all' ? models : models.filter(model => model === type);
    
    console.log('Querying models:', modelsToQuery);
    
    // Fixed query - remove take and skip from individual model queries
    const results = await Promise.all(
      modelsToQuery.map(model => 
        safeQuery(() => (prisma[model] as any).findMany({
          select: selectConfigs[model],
          orderBy,
          // Removed take and skip from here
        }), model)
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

    const sortedContent = allContent.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination ONLY here, after combining and sorting
    const paginatedContent = sortedContent.slice(offset, offset + limit);
    const hasMore = offset + limit < sortedContent.length;

    console.log('Pagination Debug:', {
      totalItems: sortedContent.length,
      requestedOffset: offset,
      requestedLimit: limit,
      returnedItems: paginatedContent.length,
      hasMore,
      nextOffset: hasMore ? offset + limit : null
    });

    return NextResponse.json({
      success: true,
      data: paginatedContent,
      meta: {
        total: sortedContent.length, // Total should be all items, not just paginated
        limit,
        offset,
        hasMore,
        type,
      },
    });
  } catch (error) {
    console.error('Error fetching latest content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch latest content',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const newContent = await (prisma[type as keyof typeof prisma] as any).create({
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
    await prisma.$disconnect();
  }
}