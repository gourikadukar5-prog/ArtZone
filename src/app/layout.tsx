import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ART ZONE — A Curated Space for Sketches & Mandala Art",
  description:
    "ART ZONE is a curated digital space for sketches, mandala art, and creative expression. Discover, share, and celebrate handcrafted artwork from artists worldwide.",
  keywords: [
    "art",
    "sketches",
    "mandala",
    "creative platform",
    "portfolio",
    "gallery",
    "illustration",
    "drawing",
  ],
  authors: [{ name: "ART ZONE" }],
  openGraph: {
    title: "ART ZONE — A Curated Space for Sketches & Mandala Art",
    description:
      "Discover, share, and celebrate handcrafted artwork from artists worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "ART ZONE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ART ZONE",
    description:
      "A curated digital space for sketches, mandala art, and creative expression.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Global Background Video */}
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-charcoal-950">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-80"
          >
            <source src="/new-hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/40 dark:bg-black/60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/60 dark:to-black/80" />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </div>
            <Toaster position="bottom-right" theme="system" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
