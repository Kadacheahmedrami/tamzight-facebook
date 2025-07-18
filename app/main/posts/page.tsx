import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostsPageClient from '@/components/pages/PostsPageClient'

interface PostsPageProps {
  searchParams: { 
    category?: string
    search?: string
    page?: string
  }
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const session = await getServerSession(authOptions)
  
  return (
    <PostsPageClient 
      session={session}
      searchParams={searchParams}
    />
  )
} 