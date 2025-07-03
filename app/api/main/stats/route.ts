import { NextResponse } from "next/server"

export async function GET() {
  const stats = {
    totalPosts: 156,
    todayPosts: 12,
    trendingPosts: 24,
    totalUsers: 2847,
    activeUsers: 342,
    totalViews: 45672,
    totalLikes: 8934,
    totalComments: 2156,
    totalShares: 1234,
    sections: {
      posts: 45,
      truth: 32,
      questions: 28,
      books: 15,
      videos: 22,
      images: 38,
      ads: 18,
      shop: 12,
      ideas: 9,
      support: 6,
    },
  }

  return NextResponse.json(stats)
}
