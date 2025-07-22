import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ContentItem {
  id: number;
  title: string;
  content?: string | null;
  description?: string | null;
  authorId: number;
  author: { id: number; firstName: string; lastName: string; avatar?: string | null };
  timestamp: Date;
  category: string;
  subcategory?: string | null;
  image?: string | null;
  views: number;
  type: string;
  likes: Array<{ id: number; emoji: string; userId: number; user: { firstName: string; lastName: string } }>;
  comments: Array<{ id: number; content: string; userId: number }>;
  shares: Array<{ id: number; userId: number }>;
  _count: { likes: number; comments: number; shares: number };
  price?: number;
  currency?: string;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  reactions?: Array<{ id: number; emoji: string; userId: number; user: { firstName: string; lastName: string } }>;
}

const baseSelect = {
  id: true, title: true, authorId: true,
  author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
  timestamp: true, category: true, views: true,
  likes: { select: { id: true, emoji: true, userId: true, user: { select: { firstName: true, lastName: true } } } },
  comments: { select: { id: true, content: true, userId: true }, take: 3 },
  shares: { select: { id: true, userId: true } },
  _count: { select: { likes: true, comments: true, shares: true } },
};

const selectConfigs = {
  post: { ...baseSelect, content: true, subcategory: true, image: true },
  book: { ...baseSelect, content: true, subcategory: true, image: true },
  idea: { ...baseSelect, content: true },
  image: { ...baseSelect, description: true, image: true },
  video: { ...baseSelect, content: true, subcategory: true, image: true },
  truth: { ...baseSelect, content: true, subcategory: true, image: true },
  question: { ...baseSelect, content: true },
  ad: { ...baseSelect, content: true, subcategory: true, image: true },
  product: { ...baseSelect, content: true, image: true, subcategory: true, price: true, currency: true, inStock: true, sizes: true, colors: true },
};

const foreignKeyMap = {
  post: 'postId', book: 'bookId', idea: 'ideaId', image: 'imageId',
  video: 'videoId', truth: 'truthId', question: 'questionId', ad: 'adId', product: 'productId',
};

const safeQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Query error:', error);
    return [] as T;
  }
};

const fetchReactions = async (content: ContentItem[]): Promise<Map<string, any[]>> => {
  const reactionsData = new Map();
  if (!content.length) return reactionsData;
  
  const contentByType = content.reduce((acc: Record<string, number[]>, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item.id);
    return acc;
  }, {});
  
  for (const [type, ids] of Object.entries(contentByType)) {
    const foreignKey = foreignKeyMap[type as keyof typeof foreignKeyMap];
    if (!foreignKey) continue;
    
    try {
      const reactions = await prisma.like.findMany({
        where: { [foreignKey]: { in: ids } },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
      });
      
      reactions.forEach(reaction => {
        const contentId = reaction[foreignKey as keyof typeof reaction] as number;
        const key = `${type}-${contentId}`;
        if (!reactionsData.has(key)) reactionsData.set(key, []);
        reactionsData.get(key)!.push({
          id: reaction.id,
          emoji: reaction.emoji,
          userId: reaction.userId,
          user: { firstName: reaction.user.firstName, lastName: reaction.user.lastName },
        });
      });
    } catch (error) {
      console.error(`Error fetching reactions for ${type}:`, error);
    }
  }
  
  return reactionsData;
};

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || 'all';
    
    const models = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'] as const;
    
    if (type !== 'all' && !models.includes(type as any)) {
      return NextResponse.json({
        success: false, data: [], meta: { total: 0, limit, offset, hasMore: false, type },
        error: `Invalid type: ${type}. Valid types are: ${models.join(', ')}`,
      }, { status: 400 });
    }
    
    const modelsToQuery = type === 'all' ? models : [type as typeof models[number]];
    
    const results = await Promise.all(
      modelsToQuery.map(model => 
        safeQuery(async () => {
          const modelClient = (prisma as any)[model];
          if (!modelClient) throw new Error(`Model ${model} not found`);
          return await modelClient.findMany({
            select: selectConfigs[model],
            orderBy: { timestamp: 'desc' },
          });
        })
      )
    );
    
    const allContent: ContentItem[] = results.flatMap((items, i) => 
      (items || []).map((item: any) => ({
        ...item,
        type: modelsToQuery[i],
        subcategory: item.subcategory || null,
        image: item.image || null,
        content: item.content || item.description || null,
        description: modelsToQuery[i] === 'image' ? item.description : undefined,
        price: item.price || undefined,
        currency: item.currency || undefined,
        inStock: item.inStock !== undefined ? item.inStock : undefined,
        sizes: item.sizes || undefined,
        colors: item.colors || undefined,
      }))
    );
    
    const sortedContent = allContent.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const totalItems = sortedContent.length;
    const paginatedContent = sortedContent.slice(offset, offset + limit);
    
    const reactionsData = await fetchReactions(paginatedContent);
    
    const contentWithReactions = paginatedContent.map(item => ({
      ...item,
      reactions: reactionsData.get(`${item.type}-${item.id}`) || []
    }));
    
    return NextResponse.json({
      success: true,
      data: contentWithReactions,
      meta: { total: totalItems, limit, offset, hasMore: offset + limit < totalItems, type },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      success: false, data: [], meta: { total: 0, limit: 0, offset: 0, hasMore: false, type: 'all' },
      error: 'Failed to fetch content', message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    try { await prisma.$disconnect(); } catch (e) { console.error('Disconnect error:', e); }
  }
}

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const body = await request.json();
    const { type, authorId, ...contentData } = body;
    
    if (!type || !authorId) {
      return NextResponse.json({ success: false, error: 'Type and authorId are required' }, { status: 400 });
    }
    
    const validTypes = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid content type' }, { status: 400 });
    }
    
    const modelClient = (prisma as any)[type];
    if (!modelClient) {
      return NextResponse.json({ success: false, error: `Model ${type} not found` }, { status: 400 });
    }
    
    const newContent = await modelClient.create({
      data: { ...contentData, authorId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        likes: { select: { id: true, emoji: true, userId: true, user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { likes: true, comments: true, shares: true } },
      },
    });
    
    const contentWithReactions = [{ ...newContent, type }];
    const reactionsData = await fetchReactions(contentWithReactions);
    const reactions = reactionsData.get(`${type}-${newContent.id}`) || [];
    
    return NextResponse.json({
      success: true,
      data: { ...newContent, type, reactions },
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({
      success: false, error: 'Failed to create content',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  } finally {
    try { await prisma.$disconnect(); } catch (e) { console.error('Disconnect error:', e); }
  }
}