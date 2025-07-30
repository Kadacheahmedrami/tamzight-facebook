import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

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
  reactions?: any[];
  userHasLiked?: boolean;
  userReaction?: string | null;
  reactionDetails?: any;
  // Share-specific fields
  sharedBy?: { id: number; firstName: string; lastName: string; avatar?: string | null };
  sharedAt?: Date;
  originalType?: string;
}

interface ReactionUser {
  userId: number;
  userName: string;
  userAvatar: string | null;
  createdAt: Date;
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

const selectConfigs: Record<string, any> = {
  post: { ...baseSelect, content: true, subcategory: true, image: true },
  book: { ...baseSelect, content: true, subcategory: true, image: true },
  idea: { ...baseSelect, content: true, image: true },
  image: { ...baseSelect, description: true, image: true },
  video: { ...baseSelect, content: true, subcategory: true, image: true },
  truth: { ...baseSelect, content: true, subcategory: true, image: true },
  question: { ...baseSelect, content: true, image: true },
  ad: { ...baseSelect, content: true, subcategory: true, image: true },
  product: { ...baseSelect, content: true, image: true, subcategory: true, price: true, currency: true, inStock: true, sizes: true, colors: true },
};

const foreignKeyMap: Record<string, string> = {
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

const fetchSharedContent = async (authorId?: string): Promise<ContentItem[]> => {
  try {
    const whereClause = authorId ? { userId: authorId } : {};
    
    const shares = await prisma.share.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        post: {
          select: {
            ...baseSelect,
            content: true,
            subcategory: true,
            image: true,
          }
        },
        book: {
          select: {
            ...baseSelect,
            content: true,
            subcategory: true,
            image: true,
          }
        },
        idea: {
          select: {
            ...baseSelect,
            content: true,
            image: true,
          }
        },
        image: {
          select: {
            ...baseSelect,
            description: true,
            image: true,
          }
        },
        video: {
          select: {
            ...baseSelect,
            content: true,
            subcategory: true,
            image: true,
          }
        },
        truth: {
          select: {
            ...baseSelect,
            content: true,
            subcategory: true,
            image: true,
          }
        },
        question: {
          select: {
            ...baseSelect,
            content: true,
            image: true,
          }
        },
        ad: {
          select: {
            ...baseSelect,
            content: true,
            subcategory: true,
            image: true,
          }
        },
        product: {
          select: {
            ...baseSelect,
            content: true,
            image: true,
            subcategory: true,
            price: true,
            currency: true,
            inStock: true,
            sizes: true,
            colors: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sharedContent: ContentItem[] = shares.map(share => {
      // Find which content type was shared
      const contentTypes = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'];
      let originalContent = null;
      let originalType = '';

      for (const type of contentTypes) {
        if ((share as any)[type]) {
          originalContent = (share as any)[type];
          originalType = type;
          break;
        }
      }

      if (!originalContent) return null;

      return {
        ...originalContent,
        type: originalType,
        originalType,
        subcategory: originalContent.subcategory || null,
        image: originalContent.image || null,
        content: originalContent.content || originalContent.description || null,
        description: originalType === 'image' ? originalContent.description : undefined,
        price: originalContent.price || undefined,
        currency: originalContent.currency || undefined,
        inStock: originalContent.inStock !== undefined ? originalContent.inStock : undefined,
        sizes: originalContent.sizes || undefined,
        colors: originalContent.colors || undefined,
        sharedBy: {
          id: share.user.id,
          firstName: share.user.firstName,
          lastName: share.user.lastName,
          avatar: share.user.avatar,
        },
        sharedAt: share.createdAt,
      };
    }).filter(Boolean) as ContentItem[];

    return sharedContent;
  } catch (error) {
    console.error('Error fetching shared content:', error);
    return [];
  }
};

const fetchReactions = async (content: ContentItem[]): Promise<Map<string, any[]>> => {
  const reactionsData = new Map();
  if (!content.length) return reactionsData;
  
  const contentByType = content.reduce((acc: Record<string, number[]>, item) => {
    const type = item.originalType || item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item.id);
    return acc;
  }, {});
  
  await Promise.all(
    Object.entries(contentByType).map(async ([type, ids]) => {
      const foreignKey = foreignKeyMap[type];
      if (!foreignKey) return;
      
      try {
        const reactions = await prisma.like.findMany({
          where: { [foreignKey]: { in: ids } },
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        });
        
        reactions.forEach(reaction => {
          const contentId = (reaction as any)[foreignKey] as number;
          const key = `${type}-${contentId}`;
          if (!reactionsData.has(key)) reactionsData.set(key, []);
          reactionsData.get(key)!.push({
            id: reaction.id,
            emoji: reaction.emoji,
            userId: reaction.userId,
            user: { 
              id: reaction.user.id,
              firstName: reaction.user.firstName, 
              lastName: reaction.user.lastName,
              avatar: reaction.user.avatar
            },
            createdAt: reaction.createdAt
          });
        });
      } catch (error) {
        console.error(`Error fetching reactions for ${type}:`, error);
      }
    })
  );
  
  return reactionsData;
};

const fetchUserReactions = async (userId: string, content: ContentItem[]): Promise<Map<string, string | null>> => {
  const userReactionsMap = new Map<string, string | null>();
  if (!userId || !content.length) return userReactionsMap;

  const contentByType = content.reduce((acc: Record<string, number[]>, item) => {
    const type = item.originalType || item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item.id);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(contentByType).map(async ([type, ids]) => {
      const foreignKey = foreignKeyMap[type];
      if (!foreignKey) return;

      try {
        const userReactions = await prisma.like.findMany({
          where: { userId, [foreignKey]: { in: ids } },
          select: { [foreignKey]: true, emoji: true }
        });

        userReactions.forEach(reaction => {
          const contentId = (reaction as any)[foreignKey] as number;
          userReactionsMap.set(`${type}-${contentId}`, reaction.emoji);
        });
      } catch (error) {
        console.error(`Error fetching user reactions for ${type}:`, error);
      }
    })
  );

  return userReactionsMap;
};

const processReactionDetails = (reactions: any[]) => {
  if (!reactions.length) {
    return { total: 0, summary: [], details: {} };
  }

  const groupedReactions = reactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji;
    if (!emoji) return acc;

    if (!acc[emoji]) acc[emoji] = [];
    acc[emoji].push({
      userId: reaction.user.id,
      userName: `${reaction.user.firstName} ${reaction.user.lastName}`,
      userAvatar: reaction.user.avatar,
      createdAt: reaction.createdAt
    });

    return acc;
  }, {} as Record<string, ReactionUser[]>);

  const summary = Object.entries(groupedReactions).map(([emoji, users]) => {
    const typedUsers = users as ReactionUser[];
    return { emoji, count: typedUsers.length, users: typedUsers };
  });
  
  return {
    total: summary.reduce((sum, reaction) => sum + reaction.count, 0),
    summary,
    details: groupedReactions
  };
};

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const session = await getServerSession(authOptions) as any;
    const currentUserId = session?.user?.id || null;
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const type = searchParams.get('type') || 'all';
    const authorId = searchParams.get('authorId'); // For filtering shares by specific user
    
    const models = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product', 'share'] as const;
    
    if (type !== 'all' && !models.includes(type as any)) {
      return NextResponse.json({
        success: false, data: [], 
        meta: { total: 0, limit, offset, hasMore: false, type },
        error: `Invalid type: ${type}`,
      }, { status: 400 });
    }
    
    let allContent: ContentItem[] = [];
    
    if (type === 'share') {
      // Handle shares specifically
      allContent = await fetchSharedContent(authorId || undefined);
    } else {
      // Handle regular content types
      const modelsToQuery = type === 'all' ? models.filter(m => m !== 'share') : [type as typeof models[number]];
      
      const results = await Promise.all(
        modelsToQuery.map(model => 
          safeQuery(async () => {
            const modelClient = (prisma as any)[model];
            if (!modelClient) return [];
            
            const whereClause = authorId ? { authorId } : {};
            
            return await modelClient.findMany({
              where: whereClause,
              select: selectConfigs[model],
              orderBy: { timestamp: 'desc' },
            });
          })
        )
      );
      
      allContent = results.flatMap((items, i) => 
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

      // If type is 'all', also include shares
      if (type === 'all') {
        const sharedContent = await fetchSharedContent();
        allContent = [...allContent, ...sharedContent];
      }
    }
    
    // Sort all content by timestamp
    allContent.sort((a, b) => {
      const timeA = a.sharedAt || a.timestamp;
      const timeB = b.sharedAt || b.timestamp;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
    
    const totalItems = allContent.length;
    const paginatedContent = allContent.slice(offset, offset + limit);
    
    // Fetch reactions and user reactions in parallel
    const [reactionsData, userReactionsMap] = await Promise.all([
      fetchReactions(paginatedContent),
      currentUserId ? fetchUserReactions(currentUserId, paginatedContent) : Promise.resolve(new Map())
    ]);
    
    const contentWithReactions = paginatedContent.map(item => {
      const contentType = item.originalType || item.type;
      const key = `${contentType}-${item.id}`;
      const reactions = reactionsData.get(key) || [];
      const userReaction = userReactionsMap.get(key) || null;
      
      return {
        ...item,
        reactions,
        userHasLiked: !!userReaction,
        userReaction,
        reactionDetails: processReactionDetails(reactions)
      };
    });
    
    return NextResponse.json({
      success: true,
      data: contentWithReactions,
      meta: { 
        total: totalItems, 
        limit, 
        offset, 
        hasMore: offset + limit < totalItems, 
        type,
        currentUserId,
        authorId
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      success: false, 
      data: [], 
      meta: { total: 0, limit: 0, offset: 0, hasMore: false, type: 'all' },
      error: 'Failed to fetch content',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const { type, authorId, ...contentData } = await request.json();
    
    if (!type || !authorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type and authorId are required' 
      }, { status: 400 });
    }
    
    const validTypes = ['post', 'book', 'idea', 'image', 'video', 'truth', 'question', 'ad', 'product'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid content type' 
      }, { status: 400 });
    }
    
    const modelClient = (prisma as any)[type];
    if (!modelClient) {
      return NextResponse.json({ 
        success: false, 
        error: `Model ${type} not found` 
      }, { status: 400 });
    }
    
    const newContent = await modelClient.create({
      data: { ...contentData, authorId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        likes: { select: { id: true, emoji: true, userId: true, user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { likes: true, comments: true, shares: true } },
      },
    });
    
    const reactions: any[] = [];
    
    return NextResponse.json({
      success: true,
      data: { 
        ...newContent, 
        type, 
        reactions,
        userHasLiked: false,
        userReaction: null,
        reactionDetails: processReactionDetails(reactions)
      },
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({
      success: false, 
      error: 'Failed to create content',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch(console.error);
  }
}