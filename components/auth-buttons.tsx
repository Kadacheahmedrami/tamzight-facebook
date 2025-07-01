import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline" size="sm">
          تسجيل الدخول
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm">إنشاء حساب</Button>
      </Link>
    </div>
  )
}
