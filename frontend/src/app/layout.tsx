import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Pravah — Navi Mumbai House Price Predictor',
  description:
    'ML-powered house price prediction for Navi Mumbai. Powered by a Gradient Boosting model trained on 2500+ real listings.',
  keywords: 'Navi Mumbai house price, real estate ML, property price prediction, Vashi, Nerul, Kharghar',
  openGraph: {
    title: 'Pravah — Navi Mumbai House Price Predictor',
    description: 'Predict property prices in Navi Mumbai with ML (R²=0.916)',
    type: 'website',
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
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
