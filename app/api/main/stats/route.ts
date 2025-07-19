import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Revalidate every 60 seconds
export const revalidate = 60

export async function GET() {
  try {
    // Total counts
    const [
      totalPosts,
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
      prisma.truth.count(),
      prisma.question.count(),
      prisma.book.count(),
      prisma.video.count(),
      prisma.image.count(),
      prisma.ad.count(),
      prisma.product.count(),
      prisma.idea.count()
    ])

    // Section counts
    const stats = {
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

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Stats API Error:', error)
    
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to fetch stats', 
        details: (error as Error).message 
      }, 
      { status: 500 }
    )
    
    return errorResponse
    
  } finally {
    // Ensure connection is properly closed
    await prisma.$disconnect()
  }
}