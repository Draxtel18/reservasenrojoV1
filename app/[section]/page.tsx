import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionContent } from '@/components/section-content';
import { sections } from '@/content/editorial';

const titles: Record<string, string> = {
  reportaje: 'Reportaje audiovisual', comic: 'Cómic periodístico', podcast: 'Podcast',
  participa: 'Cuestionario', cronologia: 'Cronología', lectura: 'Reportaje escrito', equipo: 'Sobre nosotros',
};

export function generateStaticParams() {
  return sections.map(([section]) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: `${titles[section] || 'Página no encontrada'} | Reservas en rojo` };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.some(([id]) => id === section)) notFound();
  const current = sections.findIndex(([id]) => id === section);
  const next = sections[(current + 1) % sections.length];
  return <main id="contenido" className="detail-page">
    <div className="detail-heading">
      <h1 tabIndex={-1} data-reveal="text">{titles[section]}</h1>
      <p className="detail-deck" data-reveal="text">Una investigación multimedia sobre el acceso a la sangre en Piura, Perú.</p>
      <nav aria-label="Navegación de la sección"><Link className="return-link" href="/" data-reveal="row">← Volver a la portada</Link></nav>
    </div>
    <SectionContent section={section} />
    {section === 'reportaje' && <section className="section film-gallery light" aria-labelledby="gallery-title">
      <div className="section-intro"><h2 id="gallery-title" data-reveal="text">Registro fotográfico</h2><p data-reveal="text">Imágenes proporcionadas para el especial. Autoría y fechas pendientes de confirmación.</p></div>
      <div className="film-photos">{[
        ['procedimiento', 'Personal sanitario y material de extracción.'],
        ['prueba', 'Prueba realizada en el dedo de una persona.'],
        ['donacion', 'Bolsa de sangre en el equipo de extracción.'],
      ].map(([name, caption]) => <figure key={name} data-reveal="media"><Image src={`/media/${name}.webp`} alt={caption} width={1366} height={768} sizes="(max-width: 700px) 100vw, 50vw" /><figcaption data-reveal="row">{caption}</figcaption></figure>)}</div>
    </section>}
    <nav className="chapter-navigation" aria-label="Continuar la investigación">
      <Link href="/">Volver a la portada</Link>
      <Link href={`/${next[0]}`}>Continuar con {next[1].toLocaleLowerCase('es')} <span aria-hidden="true">→</span></Link>
    </nav>
  </main>;
}
