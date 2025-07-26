import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma" // Adjust path as needed


export async function GET() {
  try {
    // Approach 1: Most active categories in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get trending categories based on recent activity (posts, likes, comments)
    const trendingCategories = await prisma.$queryRaw`
      SELECT 
        category,
        COUNT(*) as total_posts,
        SUM(views) as total_views,
        (
          SELECT COUNT(*) FROM likes l 
          WHERE l."postId" IN (
            SELECT id FROM posts p2 WHERE p2.category = posts.category AND p2."createdAt" >= ${sevenDaysAgo}
          )
          OR l."bookId" IN (
            SELECT id FROM books b2 WHERE b2.category = posts.category AND b2."createdAt" >= ${sevenDaysAgo}
          )
          OR l."ideaId" IN (
            SELECT id FROM ideas i2 WHERE i2.category = posts.category AND i2."createdAt" >= ${sevenDaysAgo}
          )
        ) as total_likes,
        (
          SELECT COUNT(*) FROM comments c 
          WHERE c."postId" IN (
            SELECT id FROM posts p3 WHERE p3.category = posts.category AND p3."createdAt" >= ${sevenDaysAgo}
          )
        ) as total_comments
      FROM posts 
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY category
      ORDER BY (COUNT(*) + SUM(views) + 
        (SELECT COUNT(*) FROM likes l WHERE l."postId" IN (SELECT id FROM posts p4 WHERE p4.category = posts.category))
      ) DESC
      LIMIT 5
    `

    // Approach 2: Most liked content types in recent days
    const trendingContentTypes = await prisma.$queryRaw`
      WITH content_stats AS (
        SELECT 'posts' as content_type, category, COUNT(*) as count, SUM(views) as views
        FROM posts WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY category
        
        UNION ALL
        
        SELECT 'books' as content_type, category, COUNT(*) as count, SUM(views) as views
        FROM books WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY category
        
        UNION ALL
        
        SELECT 'ideas' as content_type, category, COUNT(*) as count, SUM(views) as views
        FROM ideas WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY category
        
        UNION ALL
        
        SELECT 'questions' as content_type, category, COUNT(*) as count, SUM(views) as views
        FROM questions WHERE "createdAt" >= ${sevenDaysAgo}
        GROUP BY category
      )
      SELECT category, SUM(count) as total_count, SUM(views) as total_views
      FROM content_stats
      GROUP BY category
      ORDER BY (SUM(count) + SUM(views)) DESC
      LIMIT 5
    `

    // Approach 3: Simpler aggregation using Prisma
    const recentPosts = await prisma.post.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        views: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    const recentBooks = await prisma.book.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        views: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 3
    })

    const recentIdeas = await prisma.idea.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      },
      _sum: {
        views: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 3
    })

    // Combine and format the trending topics
    const combinedTrending = [
      ...recentPosts.map(post => ({
        category: post.category,
        count: post._count.id,
        views: post._sum.views || 0,
        type: 'post'
      })),
      ...recentBooks.map(book => ({
        category: book.category,
        count: book._count.id,
        views: book._sum.views || 0,
        type: 'book'
      })),
      ...recentIdeas.map(idea => ({
        category: idea.category,
        count: idea._count.id,
        views: idea._sum.views || 0,
        type: 'idea'
      }))
    ]

    // Sort by engagement score (count + views)
    const sortedTrending = combinedTrending
      .sort((a, b) => (b.count + b.views) - (a.count + a.views))
      .slice(0, 5)

    // Format as trending topics with colors
    const colors = ['blue', 'green', 'yellow', 'red', 'purple']
    const trendingTopics = sortedTrending.map((topic, index) => ({
      id: index + 1,
      hashtag: `#${topic.category}`,
      count: topic.count + topic.views, // Combined engagement score
      color: colors[index] || 'blue',
      type: topic.type,
      posts: topic.count,
      views: topic.views
    }))

    // Fallback to static data if no recent activity
    if (trendingTopics.length === 0) {
      const fallbackTopics = [
        {
          id: 1,
          hashtag: "#الأمازيغية_هويتنا",
          count: 1250,
          color: "blue",
        },
        {
          id: 2,
          hashtag: "#تعلم_الأمازيغية",
          count: 890,
          color: "green",
        },
        {
          id: 3,
          hashtag: "#التراث_الأمازيغي",
          count: 675,
          color: "yellow",
        },
        {
          id: 4,
          hashtag: "#الثقافة_الأمازيغية",
          count: 543,
          color: "red",
        },
        {
          id: 5,
          hashtag: "#امازيغ_باقون",
          count: 432,
          color: "purple",
        },
      ]
      return NextResponse.json({ topics: fallbackTopics })
    }

    return NextResponse.json({ topics: trendingTopics })

  } catch (error) {
    console.error('Error fetching trending topics:', error)
    
    // Return static trending topics as fallback
    const fallbackTopics = [
      {
        id: 1,
        hashtag: "#الأمازيغية_هويتنا",
        count: 1250,
        color: "blue",
      },
      {
        id: 2,
        hashtag: "#تعلم_الأمازيغية",
        count: 890,
        color: "green",
      },
      {
        id: 3,
        hashtag: "#التراث_الأمازيغي",
        count: 675,
        color: "yellow",
      },
      {
        id: 4,
        hashtag: "#الثقافة_الأمازيغية",
        count: 543,
        color: "red",
      },
      {
        id: 5,
        hashtag: "#امازيغ_باقون",
        count: 432,
        color: "purple",
      },
    ]
    
    return NextResponse.json({ topics: fallbackTopics })
  } finally {
    await prisma.$disconnect()
  }
}