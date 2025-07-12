import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"


import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  // استخراج معلمة الفئة من رابط الطلب
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get('category')
  
  // استخراج معلمات الترقيم
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 5 // حجم الصفحة ثابت = 5
  const skip = (page - 1) * limit

  // بناء شرط الفلترة
  const whereClause = (!categoryParam || categoryParam === 'all')
    ? {}
    : { category: categoryParam }

  // الحصول على العدد الإجمالي للأفكار
  const totalIdeas = await prisma.idea.count({
    where: whereClause,
  })

  // جلب الأفكار من قاعدة البيانات مع الترقيم
  const ideas = await prisma.idea.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: skip,
    take: limit,
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      image: true,
      status: true,
      priority: true,
      votes: true,
      views: true,
      timestamp: true,
      author: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true,
        }
      }
    }
  })

  // إعداد الاستجابة بالشكل المناسب
  type IdeaType = {
    id: string | number;
    title: string;
    content: string;
    category: string;
    image: string | null;
    status: string;
    priority: string;
    votes: number;
    views: number;
    timestamp: Date;
    author: {
      firstName: string;
      lastName: string;
    };
    _count: {
      likes: number;
      comments: number;
      shares: number;
    };
  };

  const result = ideas.map((idea: IdeaType) => ({
    id: idea.id,
    title: idea.title,
    content: idea.content,
    author: `${idea.author.firstName} ${idea.author.lastName}`,
    timestamp: idea.timestamp.toISOString(),
    category: idea.category,
    image: idea.image,
    stats: {
      views: idea.views,
      likes: idea._count.likes,
      comments: idea._count.comments,
      shares: idea._count.shares,
    },
    status: idea.status,
    priority: idea.priority,
    votes: idea.votes,
  }))

  // حساب معلومات الترقيم
  const totalPages = Math.ceil(totalIdeas / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return NextResponse.json({
    data: result,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalIdeas,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }
  })
}