import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import VideoDetailClient from "@/components/pages/id/videos/VideoDetailClient"
import { redirect } from "next/navigation"

interface VideoDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  if (!session) {
    redirect("/auth/signin")
  }

  return <VideoDetailClient session={session}  videoId={id} />
}
