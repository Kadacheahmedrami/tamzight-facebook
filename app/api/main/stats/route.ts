import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"  // singleton PrismaClient

export async function GET(req: NextRequest) {
  try {
    // إحصائيات المنصة
    const [
      totalPosts,
      todayPosts,
      trendingPosts,
      totalUsers,
      activeUsers,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      sectionPosts,
      sectionTruths,
      sectionQuestions,
      sectionBooks,
      sectionVideos,
      sectionImages,
      sectionAds,
      sectionShop,
      sectionIdeas,
      sectionSupport
    ] = await Promise.all([
      getTotalPosts(),
      getTodayPosts(),
      getTrendingPosts(),
      getTotalUsers(),
      getActiveUsers(),
      getTotalViews(),
      getTotalLikes(),
      getTotalComments(),
      getTotalShares(),
      prisma.post.count(),
      prisma.truth.count(),
      prisma.question.count(),
      prisma.book.count(),
      prisma.video.count(),
      prisma.image.count(),
      prisma.ad.count(),
      prisma.product.count(),
      prisma.idea.count(),
      prisma.ad.count({ where: { subcategory: 'support' } })
    ])

    const stats = {
      totalPosts,
      todayPosts,
      trendingPosts,
      totalUsers,
      activeUsers,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      sections: {
        posts: sectionPosts,
        truth: sectionTruths,
        questions: sectionQuestions,
        books: sectionBooks,
        videos: sectionVideos,
        images: sectionImages,
        ads: sectionAds,
        shop: sectionShop,
        ideas: sectionIdeas,
        support: sectionSupport,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[Stats API] Error:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// دوال مساعدة لاستعلام قاعدة البيانات
async function getTotalPosts() {
  return prisma.post.count()
}

async function getTodayPosts() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return prisma.post.count({ where: { createdAt: { gte: start } } })
}

async function getTrendingPosts() {
  // أعلى 10 منشورات من حيث عدد الإعجابات خلال 7 أيام
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const trending = await prisma.like.groupBy({
    by: ['postId'],
    where: { createdAt: { gte: oneWeekAgo }, postId: { not: null } },
    _count: { postId: true },
    orderBy: { _count: { postId: 'desc' } },
    take: 10,
  })
  return trending.length
}

async function getTotalUsers() {
  return prisma.user.count()
}

async function getActiveUsers() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return prisma.session.count({ where: { expires: { gte: oneMonthAgo } } })
}

async function getTotalViews() {
  const agg = await prisma.post.aggregate({ _sum: { views: true } })
  return agg._sum.views || 0
}

async function getTotalLikes() {
  return prisma.like.count()
}

async function getTotalComments() {
  return prisma.comment.count()
}

async function getTotalShares() {
  return prisma.share.count()
}