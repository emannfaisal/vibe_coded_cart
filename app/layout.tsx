import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Petal & Ink | Custom Digital Design Studio',
  description: 'Exquisite custom-made digital greeting cards, wedding invitations, and landing page designs tailored personally by our lead designer.',
  keywords: ['wedding invitations', 'digital greeting cards', 'landing page design', 'petal & ink', 'custom design studio'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col justify-between antialiased selection:bg-rose-200 selection:text-rose-900 bg-[#FDFBF7] text-[#1C1917]">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
