import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionContent } from '@/components/section-content';
import { isComingSoon, publishedSections, sections } from '@/content/editorial';

const titles: Record<string, string> = {
  reportaje: 'Reportaje audiovisual', comic: 'Cómic periodístico', podcast: 'Podcast',
  participa: 'Experiencia periodística gamificada', cronologia: 'Cronología', lectura: 'Reportaje escrito', equipo: 'Sobre nosotros',
};

export function generateStaticParams() {
  return publishedSections.map(([section]) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  // Locked and unknown sections both answer with the not-found title.
  const title = isComingSoon(section) ? undefined : titles[section];
  return { title: `${title || 'Página no encontrada'} | Reservas en rojo` };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.some(([id]) => id === section)) notFound();
  if (isComingSoon(section)) notFound();
  const current = publishedSections.findIndex(([id]) => id === section);
  // Chapter navigation only walks published formats, so it never points at a locked route.
  const next = publishedSections[(current + 1) % publishedSections.length];
  return <main id="contenido" className="detail-page">
    <div className="detail-heading">
      <h1 tabIndex={-1} data-reveal="text">{titles[section]}</h1>
      <p className="detail-deck" data-reveal="text">Un proyecto transmedia sobre el acceso a la sangre en Piura, Perú.</p>
      <nav aria-label="Navegación de la sección"><Link className="return-link" href="/" data-reveal="row">← Volver a la portada</Link></nav>
    </div>
    <SectionContent section={section} />
    {section === 'reportaje' && <section className="section film-gallery light" aria-labelledby="gallery-title">
      <div className="section-intro"><h2 id="gallery-title" data-reveal="text">Registro fotográfico</h2><p data-reveal="text">Imágenes proporcionadas para el proyecto. Autoría y fechas pendientes de confirmación.</p></div>
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
