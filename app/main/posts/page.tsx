// /main/posts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostsPageClient from '@/components/pages/PostsPageClient'

interface PostsPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <PostsPageClient 
      session={session}
      searchParams={resolvedSearchParams}
    />
    )
} 