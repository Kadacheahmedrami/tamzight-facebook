import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import AdsPageClient from "@/components/pages/AdsPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface AdsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  // Await the searchParams promise in Next.js 15
  const resolvedSearchParams = await searchParams
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <AdsPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}