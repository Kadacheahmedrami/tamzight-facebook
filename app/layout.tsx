import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";




const inter = Inter({ subsets: ["latin"] });

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
        url: "/logo-tamazight.png",
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.className} h-screen overflow-hidden`}>
    
          <div className="h-full flex flex-col">
        
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
  
      </body>
    </html>
  );
}
