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

  // جلب الفيديوهات من قاعدة البيانات
  const videos = await prisma.video.findMany({
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
      duration: true,
      quality: true,
      language: true,
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
  const result = videos.map(video => ({
    id: video.id,
    title: video.title,
    content: video.content,
    author: `${video.author.firstName} ${video.author.lastName}`,
    timestamp: video.timestamp.toISOString(),
    category: video.category,
    subcategory: video.subcategory,
    image: video.image,
    stats: {
      views: video.views,
      likes: video._count.likes,
      comments: video._count.comments,
      shares: video._count.shares,
    },
    duration: video.duration,
    quality: video.quality,
    language: video.language,
  }))

  return NextResponse.json(result)
}