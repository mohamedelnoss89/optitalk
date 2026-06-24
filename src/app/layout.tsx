import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-geist-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "الماشي — دليل السيدة زينب بالقاهرة",
  description:
    "اكتشف روح القاهرة الفاطمية. دليلك الذكي لأفضل مطاعم السيدة زينب، قهوتها، جوامعها وأكثر من 80 مكاناً موثقاً في 12 تصنيفاً.",
  keywords: [
    "الماشي",
    "السيدة زينب",
    "القاهرة",
    "دليل القاهرة",
    "مطاعم السيدة زينب",
    "قهوة بلبع",
    "كشري أبو طارق",
    "مسجد السيدة زينب",
  ],
  authors: [{ name: "Al-Mashi Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "الماشي",
  },
  openGraph: {
    title: "الماشي — دليل السيدة زينب بالقاهرة",
    description: "اكتشف روح القاهرة الفاطمية مع الماشي.",
    type: "website",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: "الماشي",
    description: "دليل السيدة زينب بالقاهرة",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0B09",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <Toaster />
      </body>
    </html>
  );
}
