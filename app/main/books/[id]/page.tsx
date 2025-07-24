import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import BookDetailClient from "@/components/pages/id/books/BookDetailClient"
import { redirect } from "next/navigation"

interface BookDetailPageProps {
  params: { id: string }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <BookDetailClient session={session} bookId={params.id} />
}
