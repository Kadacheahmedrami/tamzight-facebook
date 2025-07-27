import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import ShopPageClient from "@/components/pages/ShopPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface ShopPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ShopPageClient session={session} searchParams={resolvedSearchParams} />
      </div>
    </div>
  )
}
