import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Ensure Prisma is connected before making queries
    await prisma.$connect()

    // Total counts
    const [
      totalPosts,
      totalUsers,
      totalTruths,
      totalQuestions,
      totalBooks,
      totalVideos,
      totalImages,
      totalAds,
      totalProducts,
      totalIdeas
    ] = await Promise.all([
      prisma.post.count(),
      prisma.user.count(),
      prisma.truth.count(),
      prisma.question.count(),
      prisma.book.count(),
      prisma.video.count(),
      prisma.image.count(),
      prisma.ad.count(),
      prisma.product.count(),
      prisma.idea.count()
    ])

    // Today counts (createdAt = today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const todayPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Trending posts: posts with most views in the last 7 days (top 24)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const trendingPosts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: weekAgo
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 24
    })

    // Total views, likes, comments, shares (across all content types)
    const [
      postViews, bookViews, ideaViews, imageViews, videoViews, truthViews, questionViews, adViews, productViews
    ] = await Promise.all([
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.book.aggregate({ _sum: { views: true } }),
      prisma.idea.aggregate({ _sum: { views: true } }),
      prisma.image.aggregate({ _sum: { views: true } }),
      prisma.video.aggregate({ _sum: { views: true } }),
      prisma.truth.aggregate({ _sum: { views: true } }),
      prisma.question.aggregate({ _sum: { views: true } }),
      prisma.ad.aggregate({ _sum: { views: true } }),
      prisma.product.aggregate({ _sum: { views: true } })
    ])
    const totalViews =
      (postViews._sum.views || 0) +
      (bookViews._sum.views || 0) +
      (ideaViews._sum.views || 0) +
      (imageViews._sum.views || 0) +
      (videoViews._sum.views || 0) +
      (truthViews._sum.views || 0) +
      (questionViews._sum.views || 0) +
      (adViews._sum.views || 0) +
      (productViews._sum.views || 0)

    // Likes, comments, shares (polymorphic)
    const [totalLikes, totalComments, totalShares] = await Promise.all([
      prisma.like.count(),
      prisma.comment.count(),
      prisma.share.count()
    ])

    // Section counts
    const sections = {
      posts: totalPosts,
      truth: totalTruths,
      questions: totalQuestions,
      books: totalBooks,
      videos: totalVideos,
      images: totalImages,
      ads: totalAds,
      shop: totalProducts,
      ideas: totalIdeas,
      support: 0 // No support model in schema
    }

    // Active users: users who created content in the last 7 days
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { posts: { some: { createdAt: { gte: weekAgo } } } },
          { books: { some: { createdAt: { gte: weekAgo } } } },
          { ideas: { some: { createdAt: { gte: weekAgo } } } },
          { images: { some: { createdAt: { gte: weekAgo } } } },
          { videos: { some: { createdAt: { gte: weekAgo } } } },
          { truths: { some: { createdAt: { gte: weekAgo } } } },
          { questions: { some: { createdAt: { gte: weekAgo } } } },
          { ads: { some: { createdAt: { gte: weekAgo } } } },
          { products: { some: { createdAt: { gte: weekAgo } } } },
        ]
      }
    })

    const stats = {
      totalPosts,
      todayPosts,
      trendingPosts: trendingPosts.length,
      totalUsers,
      activeUsers,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      sections
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats API Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats', 
      details: (error as Error).message 
    }, { status: 500 })
  } finally {
    // Ensure connection is properly closed
    await prisma.$disconnect()
  }
}