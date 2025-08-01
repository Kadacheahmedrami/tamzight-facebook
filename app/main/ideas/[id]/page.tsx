import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import IdeaDetailClient from "@/components/pages/id/ideas/IdeaDetailClient"
import { redirect } from "next/navigation"

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  if (!session) {
    redirect("/auth/signin")
  }

  return <IdeaDetailClient session={session} ideaId={id} />
}
