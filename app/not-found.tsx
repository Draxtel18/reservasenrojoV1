import Link from 'next/link';
import { comingSoonLabel, isComingSoon, sections } from '@/content/editorial';

export default function NotFound() {
  return <main id="contenido" className="lost">
    <div className="lost-hero">
      <div className="lost-copy">
        <p className="lost-eyebrow" data-reveal="row">Error 404</p>
        <h1 tabIndex={-1} data-motion-enter="title">Página no encontrada</h1>
        <p className="lost-lead" data-reveal="text">La dirección que buscas no existe o ya no está disponible. La investigación sigue abierta desde la portada.</p>
        <Link className="lost-action" href="/" data-reveal="row">Volver a la portada<span aria-hidden="true">↗</span></Link>
      </div>
      <span className="lost-numeral" aria-hidden="true">404</span>
    </div>
    <nav className="lost-index" aria-labelledby="lost-index-title" data-reveal="text">
      <h2 id="lost-index-title">Formatos de la investigación</h2>
      <ul>{sections.map(([id, label]) => <li key={id}>{isComingSoon(id)
        ? <span className="lost-soon">{label}<span className="portal-pill">{comingSoonLabel}</span></span>
        : <Link href={`/${id}`}>{label}<span aria-hidden="true">↘</span></Link>}</li>)}</ul>
    </nav>
  </main>;
}
