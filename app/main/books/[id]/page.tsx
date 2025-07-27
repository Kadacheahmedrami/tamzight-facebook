import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import BookDetailClient from "@/components/pages/id/books/BookDetailClient"
import { redirect } from "next/navigation"

interface BookDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  if (!session) {
    redirect("/auth/signin")
  }

  return <BookDetailClient session={session} bookId={id} />
}
