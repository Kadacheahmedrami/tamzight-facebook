import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostDetailClient from '@/components/pages/id/posts/PostDetailClient'
import { redirect } from "next/navigation"

interface PostDetailPageProps {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const session = await getServerSession(authOptions)
  
 
  if (!session) {
    redirect('/auth/signin')
  }
  else {
    return (
      <PostDetailClient 
        session={session}
        postId={params.id}
      />
    )
  }

}