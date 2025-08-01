"use server";

import { prisma } from "@/lib/prisma";

export async function getStats() {
  try {
    // Fetch all counts in parallel
    const [
      totalPosts,
      totalTruths,
      totalQuestions,
      totalBooks,
      totalVideos,
      totalImages,
      totalAds,
      totalProducts,
      totalIdeas,
      totalSentences,
      totalWords,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.truth.count(),
      prisma.question.count(),
      prisma.book.count(),
      prisma.video.count(),
      prisma.image.count(),
      prisma.ad.count(),
      prisma.product.count(),
      prisma.idea.count(),
      prisma.sentence.count(),
      prisma.word.count(),
    ]);

    return {
      posts: totalPosts,
      truth: totalTruths,
      questions: totalQuestions,
      books: totalBooks,
      videos: totalVideos,
      images: totalImages,
      ads: totalAds,
      shop: totalProducts,
      ideas: totalIdeas,
      support: 0, // No support model in schema
      sentences: totalSentences,
      words: totalWords,
    };
  } catch (error) {
    console.error("Stats Server Action Error:", error);
    return {
      posts: 0,
      truth: 0,
      questions: 0,
      books: 0,
      videos: 0,
      images: 0,
      ads: 0,
      shop: 0,
      ideas: 0,
      support: 0,
      sentences: 0,
      words: 0,
      error: "Failed to fetch stats",
      details: (error as Error).message,
    };
  } finally {
    await prisma.$disconnect();
  }
}