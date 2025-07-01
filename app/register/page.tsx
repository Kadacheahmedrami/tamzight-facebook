"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuthContext } from "@/components/auth-provider"

export default function RegisterPage() {
  const { register } = useAuthContext()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.terms) {
      setError("يجب الموافقة على الشروط والأحكام")
      setLoading(false)
      return
    }

    try {
      const result = await register(formData)

      if (result.success) {
        router.push("/")
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("حدث خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container-mobile py-4 sm:py-8">
        <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">أنضم إلينا مجاناً</h1>
          <p className="text-gray-700 mb-4 text-center text-sm sm:text-base leading-relaxed">
            أبدا بالتواصل مع الاعضاء، وشارك بالنشر على تجمع الامازيغية هويتنا واستفيد من منشوراته في اقسامه الثقافية
            المتنوعة، وادعو اهلك واصدقاءك الامازيغ للانضمام الينا.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  الاسم الاول
                </label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="أكتبه هنا"
                  className="mt-1 form-input-mobile"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  اسم الاب
                </label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="أكتبه هنا"
                  className="mt-1 form-input-mobile"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                بريد الكتروني
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أكتبه هنا"
                className="mt-1 form-input-mobile"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                كلمة السر
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أكتب كلمة مرور قوية"
                className="mt-1 form-input-mobile"
                required
              />
              <p className="text-xs text-gray-500 mt-1">أختار كلمة سر تتكون من حروف، أرقام، رموز</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                تأكيد كلمة السر
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="تأكيد كلمة السر"
                className="mt-1 form-input-mobile"
                required
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 touch-target"
                required
              />
              <label htmlFor="terms" className="mr-2 block text-sm text-gray-900 leading-relaxed">
                لاكمال إنشاء حسابك الشخصي معنا، أنت توافق على{" "}
                <Link href="/policy" className="text-blue-500">
                  سياسة وشروط الاستخدام
                </Link>
                .
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <Button type="submit" disabled={loading} className="touch-target">
                {loading ? "جاري التسجيل..." : "سجل الان"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/")}
                className="touch-target bg-transparent"
              >
                إلغا التسجيل
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
