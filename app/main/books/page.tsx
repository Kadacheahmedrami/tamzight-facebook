import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import BooksPageClient from "@/components/pages/BooksPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface BooksPageProps {
  searchParams: Promise<SearchParams>
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <BooksPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}
