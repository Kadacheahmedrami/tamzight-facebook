import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(req: NextRequest) {
  // استخراج معلمات الفئة والكلمة المفتاحية من رابط الطلب
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

  // بناء شرط الفلترة
  const whereClause: any = {}
  if (categoryParam && categoryParam !== 'all') {
    whereClause.category = categoryParam
  }

  if (searchParam) {
    whereClause.OR = [
      { title: { contains: searchParam, mode: 'insensitive' } },
      { description: { contains: searchParam, mode: 'insensitive' } },
      { tags: { has: searchParam } },
    ]
  }

  // جلب الصور من قاعدة البيانات
  const images = await prisma.image.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      image: true,
      location: true,
      resolution: true,
      tags: true,
      timestamp: true,
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
  const result = images.map(img => ({
    id: img.id,
    title: img.title,
    description: img.description,
    author: `${img.author.firstName} ${img.author.lastName}`,
    timestamp: img.timestamp.toISOString(),
    category: img.category,
    image: img.image,
    stats: {
      views: img.views,
      likes: img._count.likes,
      comments: img._count.comments,
      shares: img._count.shares,
    },
    location: img.location,
    resolution: img.resolution,
    tags: img.tags,
  }))

  return NextResponse.json(result)
}