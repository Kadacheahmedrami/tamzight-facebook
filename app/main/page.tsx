
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostsPageClient from '@/components/LatestSactionCards/PostsPageClient'

export default async function LatestPostsPage() {
  const session = await getServerSession(authOptions)
  
  return <PostsPageClient session={session} />
}