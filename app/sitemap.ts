import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { products as mockProducts } from '@/lib/data/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/shop',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic Product routes
  let productRoutes: MetadataRoute.Sitemap = []
  
  try {
    const q = query(collection(db, 'products'), where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      productRoutes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          url: `${siteUrl}/product/${data.slug || doc.id}`,
          lastModified: (data.updatedAt?.toDate() || new Date()).toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }
      })
    } else {
      // Fallback to mock products if DB is empty
      productRoutes = mockProducts.map(p => ({
        url: `${siteUrl}/product/${p.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }))
    }
  } catch (error) {
    console.error('Error generating sitemap products:', error)
  }

  return [...staticRoutes, ...productRoutes]
}
