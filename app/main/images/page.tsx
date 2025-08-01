import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ImagesPageClient from "@/components/pages/ImagesPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface ImagesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ImagesPage({ searchParams }: ImagesPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ImagesPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}
