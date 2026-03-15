import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import { Sidebar } from '@/components/Sidebar';
import { AuthWrapper } from '@/components/AuthWrapper';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'Work Life OS | El Sistema Definitivo para Freelancers',
    template: '%s | Work Life OS'
  },
  description: 'Gestiona tus jornadas, controla el límite legal de 221 días y audita tus nóminas con IA. La herramienta definitiva de Olianlabs para el freelance moderno.',
  keywords: ['freelance', 'gestión de tiempo', 'auditoría de nómina', 'IA', 'nómina española', 'control de jornada', '221 días', 'Olianlabs'],
  authors: [{ name: 'Olianlabs' }],
  creator: 'Olianlabs',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://worklifeos.olianlabs.com',
    title: 'Work Life OS - Control Total para el Freelance',
    description: 'Optimiza tu vida laboral con IA. Control de jornadas y auditoría de ingresos en una interfaz neo-brutalista.',
    siteName: 'Work Life OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work Life OS | By Olianlabs',
    description: 'Control de jornadas y auditoría de nóminas con Inteligencia Artificial.',
    creator: '@olianlabs',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} overflow-x-hidden`}>
      <body className="antialiased min-h-screen flex flex-col bg-[var(--color-base-bg)] text-black overflow-x-hidden" suppressHydrationWarning>
        <AuthWrapper>
          <div className="flex flex-1 overflow-hidden h-screen w-full relative">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative">
              <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 w-full max-w-full overflow-y-auto overflow-x-hidden relative">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
