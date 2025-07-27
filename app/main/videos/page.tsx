import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import VideosPageClient from "@/components/pages/VideosPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface VideosPageProps {
  searchParams: Promise<SearchParams>
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <VideosPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}
