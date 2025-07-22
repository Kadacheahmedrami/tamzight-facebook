import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostsPageClient from '@/components/LatestSactionCards/PostsPageClient'

// Force dynamic rendering - disable caching
export const dynamic = 'force-dynamic'

export default async function LatestPostsPage() {
  const session = await getServerSession(authOptions)
  
  // Extract only the serializable data you need
  const userSession = session ? {
    user: {
      id: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      image: session.user?.image,
    },
    expires: session.expires,
  } : null
     
  return <PostsPageClient session={userSession} />
}