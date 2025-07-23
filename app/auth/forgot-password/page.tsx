import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">استعادة كلمة المرور</h1>
        <p className="text-gray-700 mb-6 text-center">أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور.</p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <Input type="email" id="email" placeholder="أدخل بريدك الإلكتروني" className="w-full" />
          </div>

          <Button type="submit" className="w-full">
            إرسال رابط الاستعادة
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            تذكرت كلمة المرور؟{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
