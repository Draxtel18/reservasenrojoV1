import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Motion, Navigation } from '@/components/interactions';
import { Footer } from '@/components/site-shell';

const montserrat = localFont({
  src: [
    { path: '../public/fonts/montserrat-400.ttf', weight: '400' },
    { path: '../public/fonts/montserrat-600.ttf', weight: '600' },
    { path: '../public/fonts/montserrat-700.ttf', weight: '700' },
    { path: '../public/fonts/montserrat-900.ttf', weight: '900' },
  ],
  display: 'swap', variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'Reservas en rojo | Especial periodístico en Piura',
  description: 'Una investigación multimedia sobre las dificultades de acceso a la sangre durante emergencias médicas en Piura, Perú.',
  openGraph: {
    title: 'Reservas en rojo', locale: 'es_PE', type: 'website',
    description: 'Una vida en juego. Una investigación sobre el acceso a la sangre en Piura.',
    images: [{ url: '/media/banco.webp', width: 1366, height: 768, alt: 'Banco de sangre y donantes en Piura' }],
  },
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={montserrat.variable}><body>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <Navigation /><Motion />{children}<Footer />
  </body></html>;
}
