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

export const metadata: Metadata = {
  title: "F.S Print Works | We Print Your Ideas — Custom T-Shirts, Mugs, Stickers & More",
  description: "Premium custom printing services in Bhiwandi. Get personalized t-shirts, mugs, keychains, stickers, phone cases and more. Best quality, affordable prices, fast delivery.",
  keywords: "custom printing, t-shirt printing, mug printing, sticker printing, keychain, phone case, Bhiwandi, personalized gifts",
  openGraph: {
    title: "F.S Print Works | We Print Your Ideas",
    description: "Premium custom printing services — T-Shirts, Mugs, Stickers, Keychains & More",
    type: "website",
  },
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
      </body>
    </html>
  );
}

