import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | F.S Print Works',
  description: 'Get in touch with F.S Print Works for custom printing quotes, bulk orders, or support. We are located in Bhiwandi and always ready to help.',
  openGraph: {
    title: 'Contact Us | F.S Print Works',
    description: 'Get in touch with F.S Print Works for custom printing quotes or support.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
