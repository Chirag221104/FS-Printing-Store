import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { products as mockProducts } from '@/lib/data/products';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let productTitle = 'Product Not Found';
  let productDesc = 'This product is unavailable.';
  let productImg = `${siteUrl}/images/og-default.jpg`;
  let canonicalUrl = `${siteUrl}/shop`;

  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      productTitle = `${data.name} | F.S Print Works`;
      productDesc = data.shortDescription || data.description || productDesc;
      productImg = data.images?.[0] || productImg;
      canonicalUrl = `${siteUrl}/product/${slug}`;
    } else {
      // Fallback to mock product
      const mockP = mockProducts.find(p => p.id === slug);
      if (mockP) {
        productTitle = `${mockP.name} | F.S Print Works`;
        productDesc = mockP.description;
        productImg = mockP.image.startsWith('http') ? mockP.image : `${siteUrl}${mockP.image}`;
        canonicalUrl = `${siteUrl}/product/${slug}`;
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: productTitle,
    description: productDesc,
    openGraph: {
      title: productTitle,
      description: productDesc,
      url: canonicalUrl,
      images: [
        {
          url: productImg,
          width: 800,
          height: 800,
          alt: productTitle,
        }
      ],
    },
    alternates: {
      canonical: canonicalUrl,
    }
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let schemaData = null;

  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": data.name,
        "image": data.images || [],
        "description": data.shortDescription || data.description,
        "sku": data.id || slug,
        "offers": {
          "@type": "Offer",
          "url": `${siteUrl}/product/${slug}`,
          "priceCurrency": "INR",
          "price": data.basePrice,
          "availability": "https://schema.org/InStock"
        }
      };
    } else {
      const mockP = mockProducts.find(p => p.id === slug);
      if (mockP) {
        schemaData = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": mockP.name,
          "image": [mockP.image.startsWith('http') ? mockP.image : `${siteUrl}${mockP.image}`],
          "description": mockP.description,
          "sku": mockP.id,
          "offers": {
            "@type": "Offer",
            "url": `${siteUrl}/product/${slug}`,
            "priceCurrency": "INR",
            "price": mockP.price,
            "availability": mockP.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        };
      }
    }
  } catch (error) {
    console.error('Error generating schema:', error);
  }

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {children}
    </>
  );
}
