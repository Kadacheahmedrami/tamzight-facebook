import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdDetailClient from "@/components/pages/id/ads/AdDetailClient"
import { redirect } from "next/navigation"

interface AdDetailPageProps {
  params: { id: string }
}

export default async function AdDetailPage({ params }: AdDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <AdDetailClient session={session} adId={params.id} />
}
