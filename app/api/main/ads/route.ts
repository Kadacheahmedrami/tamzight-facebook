import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // استخراج معلمات الفئة والكلمة المفتاحية من رابط الطلب
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

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

  // جلب الإعلانات من قاعدة البيانات
  const ads = await prisma.ad.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
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
  const result = ads.map(ad => ({
    id: ad.id,
    title: ad.title,
    content: ad.content,
    author: `${ad.author.firstName} ${ad.author.lastName}`,
    timestamp: ad.timestamp.toISOString(),
    category: ad.category,
    subcategory: ad.subcategory,
    image: ad.image,
    stats: {
      views: ad.views,
      likes: ad._count.likes,
      comments: ad._count.comments,
      shares: ad._count.shares,
    },
    // حقول مالية وخيرية
    targetAmount: ad.targetAmount,
    currentAmount: ad.currentAmount,
    deadline: ad.deadline?.toISOString(),
  }))

  return NextResponse.json(result)
}
