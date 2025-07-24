import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import VideoDetailClient from "@/components/pages/id/videos/VideoDetailClient"
import { redirect } from "next/navigation"

interface VideoDetailPageProps {
  params: { id: string }
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <VideoDetailClient session={session}  videoId={params.id} />
}
