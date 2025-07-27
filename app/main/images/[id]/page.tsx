import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ImageDetailClient from "@/components/pages/id/images/ImageDetailClient"
import { redirect } from "next/navigation"

interface ImageDetailPageProps {
  params: Promise<{ id: string }>

}

export default async function ImageDetailPage({ params }: ImageDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  if (!session) {
    redirect("/auth/signin")
  }

  return <ImageDetailClient session={session} imageId={id} />
}
