import Image from 'next/image';
import Link from 'next/link';
import { comingSoonLabel, comingSoonNotes, editorial, isComingSoon, portals, sections } from '@/content/editorial';
import { ComicCover } from '@/components/comic-reader';

// Shared cover media for locked and published portals.
function PortalMedia({ portal }: { portal: (typeof portals)[number] }) {
  if (portal.image) return <figure className="portal-media" data-reveal="media"><div className="photo-frame"><Image src={`/media/${portal.image}.webp`} alt={portal.alt} width={1366} height={768} sizes="(max-width: 700px) 100vw, 65vw" /></div><figcaption>{portal.kind}</figcaption></figure>;
  if (portal.id === 'comic') return <ComicCover />;
  return <div className="team-invitation" data-reveal="media"><p>Un equipo.<br />Muchas miradas.</p><span>Conocelos a profundidad.</span></div>;
}

export default function Home() {
  return <main id="contenido">
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="hero-scene">
        <div className="hero-question" data-motion-enter="statement"><p>{editorial.lead}</p></div>
        <div className="hero-photo" data-motion-enter="hero-photo"><Image src="/media/extraccion.webp" alt="Personal sanitario manipula una bolsa durante una extracción de sangre" fill sizes="(max-width: 700px) 100vw, 72vw" priority /></div>
      </div>
      <h1 id="hero-title" tabIndex={-1}><span className="hero-word" data-motion-enter="title">Reservas</span>{' '}<span className="hero-word" data-motion-enter="title">en rojo</span></h1>
      <div className="hero-bottom">
        <p>Un proyecto periodístico sobre las dificultades de acceso a la sangre durante emergencias médicas en Piura, Perú.</p>
        <div className="hero-actions"><Link className="button" href="/reportaje">Ver reportaje <span aria-hidden="true">↗</span></Link><a className="text-link" href="#formatos">Explorar investigación</a></div>
      </div>
    </section>
    {portals.map((portal, index) => <section key={portal.id} id={portal.id} className={`portal portal-${portal.id} ${index % 2 ? 'light' : 'dark'}`} aria-labelledby={`portal-${portal.id}-title`}>
      {index === 0 && <nav id="formatos" className="portal-index" aria-label="Formatos de la investigación">{sections.map(([id, label]) => isComingSoon(id)
        ? <span key={id} className="portal-index-soon">{label} <span className="portal-pill">{comingSoonLabel}</span></span>
        : <Link key={id} href={`/${id}`}>{label}</Link>)}</nav>}
      {isComingSoon(portal.id)
        // Locked formats keep their card as a static block: no anchor, no focus, no arrow.
        ? <div className="portal-link is-coming-soon">
          <div className="portal-copy">
            <h2 id={`portal-${portal.id}-title`} data-reveal="text">{portal.title}</h2>
            <p data-reveal="text">{comingSoonNotes[portal.id]}</p>
            <span className="portal-pill" data-reveal="row">{comingSoonLabel}</span>
          </div>
          <PortalMedia portal={portal} />
        </div>
        : <Link className="portal-link" href={`/${portal.id}`} aria-label={portal.label}>
          <div className="portal-copy">
            <h2 id={`portal-${portal.id}-title`} data-reveal="text">{portal.title}</h2>
            <p data-reveal="text">{portal.description}</p>
            <span className="portal-action" data-reveal="row">{portal.label}<span className="portal-arrow" aria-hidden="true">↗</span></span>
          </div>
          <PortalMedia portal={portal} />
        </Link>}
    </section>)}
  </main>;
}
