import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";
import StorefrontLayoutWrapper from "@/components/StorefrontLayoutWrapper";
import { Toaster } from 'react-hot-toast';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "F.S Print Works | We Print Your Ideas",
    template: "%s | F.S Print Works"
  },
  description: "Premium custom printing services in Bhiwandi. Get personalized t-shirts, mugs, keychains, stickers, phone cases and more. Best quality, affordable prices, fast delivery.",
  keywords: "custom printing, t-shirt printing, mug printing, sticker printing, keychain, phone case, Bhiwandi, personalized gifts",
  openGraph: {
    title: "F.S Print Works | We Print Your Ideas",
    description: "Premium custom printing services — T-Shirts, Mugs, Stickers, Keychains & More",
    url: siteUrl,
    siteName: "F.S Print Works",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "F.S Print Works Logo",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "F.S Print Works | We Print Your Ideas",
    description: "Premium custom printing services — T-Shirts, Mugs, Stickers, Keychains & More",
    images: ["/images/og-default.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="bottom-right" />
        <AuthProvider>
          <CartProvider>
            <StorefrontLayoutWrapper>
              {children}
            </StorefrontLayoutWrapper>
          </CartProvider>
        </AuthProvider>
        {/* Structured Data: WebSite & Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "F.S Print Works",
              "url": siteUrl,
              "logo": `${siteUrl}/images/og-default.jpg`,
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-7776003843",
                "contactType": "customer service"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "F.S Print Works",
              "url": siteUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/shop?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}

