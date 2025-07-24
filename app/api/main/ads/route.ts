import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import {prisma} from "@/lib/prisma"

export async function GET(req: NextRequest) {
  // استخراج معلمات الفئة والكلمة المفتاحية من رابط الطلب
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')
  
  // استخراج معلمات الترقيم
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 5 // حجم الصفحة ثابت = 5
  const skip = (page - 1) * limit

  // بناء شرط الفلترة
  const whereClause: any = {}
  if (categoryParam && categoryParam !== 'all') {
    whereClause.subcategory = categoryParam
  }

  if (searchParam) {
    whereClause.OR = [
      { title: { contains: searchParam, mode: 'insensitive' } },
      { content: { contains: searchParam, mode: 'insensitive' } },
    ]
  }

  // الحصول على العدد الإجمالي للإعلانات
  const totalAds = await prisma.ad.count({
    where: whereClause,
  })

  // جلب الإعلانات من قاعدة البيانات مع الترقيم
  const ads = await prisma.ad.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: skip,
    take: limit,
    select: {
      id: true,
      title: true,
      content: true,
      timestamp: true,
      category: true,
      subcategory: true,
      image: true,
      targetAmount: true,
      currentAmount: true,
      deadline: true,
      views: true,
      author: {
        select: {
          id:true,
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
  type AdType = {
    id: string;
    title: string;
    content: string;
    timestamp: Date;
    category: string;
    subcategory: string | null;
    image: string | null;
    targetAmount: string | null;
    currentAmount: string | null;
    deadline: Date | null;
    views: number;
    author: {
      id:string,
      firstName: string;
      lastName: string;
    };
    _count: {
      likes: number;
      comments: number;
      shares: number;
    };
  };

  const result = ads.map((ad: AdType) => ({
    id: ad.id,
    title: ad.title,
    content: ad.content,
    author: `${ad.author.firstName} ${ad.author.lastName}`,
    authorId: ad.author.firstName , 
    timestamp: ad.timestamp.toISOString(),
    category: ad.category,
    subcategory: ad.subcategory ?? '',
    image: ad.image,
    stats: {
      views: ad.views,
      likes: ad._count.likes,
      comments: ad._count.comments,
      shares: ad._count.shares,
    },
    targetAmount: ad.targetAmount !== null ? Number(ad.targetAmount) : null,
    currentAmount: ad.currentAmount !== null ? Number(ad.currentAmount) : null,
    deadline: ad.deadline ? ad.deadline.toISOString() : null,
  }))

  // حساب معلومات الترقيم
  const totalPages = Math.ceil(totalAds / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return NextResponse.json({
    data: result,
    pagination: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalAds,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }
  })
}