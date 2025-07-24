import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import ProductDetailClient from "@/components/pages/id/shop/ProductDetailClient"
import { redirect } from "next/navigation"

interface ProductDetailPageProps {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <ProductDetailClient session={session} productId={params.id} />
}
