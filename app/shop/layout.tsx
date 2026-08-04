import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Custom Prints | F.S Print Works',
  description: 'Browse our complete collection of custom printed t-shirts, mugs, phone cases, stickers, and more. Filter by category, price, and sort by newest arrivals.',
  openGraph: {
    title: 'Shop Custom Prints | F.S Print Works',
    description: 'Browse our complete collection of custom printed products.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/shop`,
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  // Breadcrumb Structured Data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": `${siteUrl}/shop`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
