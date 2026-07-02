import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const cairo = Cairo({
  variable: "--font-geist-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OptiTalk - تعلّم الإنجليزية بالمحادثة",
  description:
    "تطبيق تعليم اللغة الإنجليزية بالمحادثة الحية مع مدرس AI. اختار مدرسك، تحدث بصوتك، واحصل على تصحيح فوري.",
  keywords: [
    "OptiTalk",
    "تعلم الإنجليزية",
    "محادثة إنجليزي",
    "مدرس AI",
    "تحسين النطق",
    "opti-group",
  ],
  authors: [{ name: "opti-group" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OptiTalk",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "OptiTalk - تعلّم الإنجليزية بالمحادثة",
    description: "تعلّم الإنجليزية بالمحادثة الحية مع مدرسك AI الشخصي.",
    type: "website",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: "OptiTalk",
    description: "تعلّم الإنجليزية بالمحادثة الحية مع مدرسك AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-geist-sans), Cairo, system-ui, sans-serif" }}
      >
        {children}
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
