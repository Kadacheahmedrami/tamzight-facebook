import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  // استخراج معلمة الفئة من رابط الطلب
  const { searchParams } = new URL(req.url)
  const categoryParam = searchParams.get('category')

  // بناء شرط الفلترة
  const whereClause = (!categoryParam || categoryParam === 'all')
    ? {}
    : { category: categoryParam }

  // جلب الأفكار من قاعدة البيانات
  const ideas = await prisma.idea.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
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
  const result = ideas.map(idea => ({
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

  return NextResponse.json(result)
}
