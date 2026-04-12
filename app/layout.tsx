import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeuroTwin — AI Digital Twin Recruitment',
  description:
    'Interactive AI Digital Twin platform for verified technical recruitment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nt-bg text-gray-100 font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
