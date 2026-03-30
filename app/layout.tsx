import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Typebeat Studio',
  description: 'AI Instrumental Generation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
