import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tamazight - الأمازيغية هويتنا",
  description: "منصة تواصل اجتماعي للثقافة الأمازيغية",
  icons: {
    icon: "/tamzigt.ico",
  },
  keywords: [
    "Tamazight", "أمازيغية", "الأمازيغ", "ثقافة أمازيغية",
    "اللغة الأمازيغية", "تواصل اجتماعي", "الهوية الأمازيغية",
    "الجزائر", "المغرب", "تونس", "شمال إفريقيا", "أمازيغ"
  ],
  authors: [{ name: "Tamazight Team", url: "https://your-website.com" }],
  openGraph: {
    title: "Tamazight - الأمازيغية هويتنا",
    description: "منصة تواصل اجتماعي للثقافة الأمازيغية",
    url: "https://your-website.com",
    siteName: "Tamazight",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tamazight - الأمازيغية هويتنا",
      },
    ],
    locale: "ar_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamazight - الأمازيغية هويتنا",
    description: "منصة تواصل اجتماعي للثقافة الأمازيغية",
    images: ["/og-image.jpg"],
  },
  themeColor: "#00796B",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head />
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
