import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import TruthPageClient from "@/components/pages/TruthPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface TruthPageProps {
  searchParams: Promise<SearchParams>
}

export default async function TruthPage({ searchParams }: TruthPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <TruthPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}
