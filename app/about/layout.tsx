import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | F.S Print Works',
  description: 'Learn about F.S Print Works, our mission to provide the best custom printing services, and our commitment to premium quality and fast delivery in Bhiwandi.',
  openGraph: {
    title: 'About Us | F.S Print Works',
    description: 'Learn about F.S Print Works, our mission to provide the best custom printing services.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
