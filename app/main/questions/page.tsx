import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import QuestionsPageClient from "@/components/pages/QuestionsPageClient"

interface SearchParams {
  category?: string
  page?: string
}

interface QuestionsPageProps {
  searchParams: SearchParams
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <QuestionsPageClient session={session} searchParams={searchParams} />
      </div>
    </div>
  )
}
