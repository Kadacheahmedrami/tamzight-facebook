import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import TruthDetailClient from "@/components/pages/id/truth/TruthDetailClient"
import { redirect } from "next/navigation"

interface TruthDetailPageProps {
  params: { id: string }
}

export default async function TruthDetailPage({ params }: TruthDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <TruthDetailClient session={session} truthId={params.id} />
}
