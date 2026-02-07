import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Air Rockstar - Virtual Instruments',
  description: 'Play air guitar and air drums using motion tracking',
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
