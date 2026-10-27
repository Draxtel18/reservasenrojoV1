import Image from 'next/image';
import Link from 'next/link';
import { sections } from '@/content/editorial';
import { BackToTop } from './interactions';

export function Footer() {
  return <footer className="footer">
    <p className="footer-name" data-reveal="text">Reservas en rojo</p>
    <div className="footer-bottom">
      <Link href="/" aria-label="Reservas en rojo, volver al inicio"><Image src="/media/logo-transparent.png" alt="Logo oficial de Reservas en rojo" width={151} height={101} /></Link>
      <p>Especial periodístico multimedia.<br />Piura, Perú.<br /><span>Créditos y autoría por confirmar.</span></p>
      <nav aria-label="Navegación del pie de página">{sections.map(([id, label]) => <Link key={id} href={`/${id}`}>{label}</Link>)}</nav>
      <div className="footer-connect">
        <section className="footer-social" aria-labelledby="social-heading">
          <h2 id="social-heading">Redes sociales</h2>
          <ul className="social-icons">
            <li><svg role="img" aria-label="Facebook (próximamente)" viewBox="0 0 24 24"><title>Facebook</title><path fill="currentColor" d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.6v8z" /></svg></li>
            <li><svg role="img" aria-label="Instagram (próximamente)" viewBox="0 0 24 24"><title>Instagram</title><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" /></svg></li>
          </ul>
          <p className="social-status">Próximamente</p>
        </section>
        <BackToTop />
        <div id="motion-control-slot" />
      </div>
    </div>
  </footer>;
}
