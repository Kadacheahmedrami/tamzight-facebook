import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import IdeasPageClient from "@/components/pages/IdeasPageClient"

interface IdeasPageProps {
  searchParams: {
    category?: string
    search?: string
    page?: string
  }
}

export default async function IdeasPage({ searchParams }: IdeasPageProps) {
  const session = await getServerSession(authOptions)

  return <IdeasPageClient session={session} searchParams={searchParams} />
}
