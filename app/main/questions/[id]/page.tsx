import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import QuestionDetailClient from "@/components/pages/id/questions/QuestionDetailClient"
import { redirect } from "next/navigation"

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  if (!session) {
    redirect("/auth/signin")
  }

  return <QuestionDetailClient session={session} questionId={id} />
}
