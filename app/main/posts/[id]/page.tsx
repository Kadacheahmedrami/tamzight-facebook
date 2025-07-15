import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostDetailClient from '@/components/pages/PostDetailClient'

interface PostDetailPageProps {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const session = await getServerSession(authOptions)
  
  // If you need authentication, uncomment this:
  // if (!session) {
  //   redirect('/auth/signin')
  // }

  return (
    <PostDetailClient 
      session={session}
      postId={params.id}
    />
  )
}