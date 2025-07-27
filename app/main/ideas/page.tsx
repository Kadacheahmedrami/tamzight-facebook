import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import IdeasPageClient from "@/components/pages/IdeasPageClient"

interface IdeasPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

export default async function IdeasPage({ searchParams }: IdeasPageProps) {
  // Await the searchParams promise in Next.js 15
  const resolvedSearchParams = await searchParams
  const session = await getServerSession(authOptions)

  return <IdeasPageClient session={session} searchParams={resolvedSearchParams} />
}