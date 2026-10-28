import Image from 'next/image';
import Link from 'next/link';
import { sections } from '@/content/editorial';
import { BackToTop } from './interactions';

export function Footer() {
  return <footer className="footer">
    <p className="footer-name" data-reveal="text">Reservas en rojo</p>
    <div className="footer-bottom">
      <Link href="/" aria-label="Reservas en rojo, volver al inicio"><Image src="/media/logo-transparent.webp" alt="Logo oficial de Reservas en rojo" width={151} height={101} /></Link>
      <div><p>Proyecto transmedia.<br />Piura, Perú.</p><p><strong>Créditos</strong><br />Reportaje y textos: [nombres].<br />Fotografía: [nombre].<br />Diseño e ilustraciones: [nombres].<br />Producción audiovisual y edición: [nombres].<br />Desarrollo web: [nombre o equipo].</p></div>
      <nav aria-label="Navegación del pie de página">{sections.map(([id, label]) => <Link key={id} href={`/${id}`}>{label}</Link>)}</nav>
      <div className="footer-connect">
        <section className="footer-social" aria-labelledby="social-heading">
          <h2 id="social-heading">Redes sociales</h2>
          <ul className="social-icons">
            <li><a href="https://www.facebook.com/reservas.en.rojo/" target="_blank" rel="noopener noreferrer" aria-label="Facebook (otra pestaña)"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.6v8z" /></svg></a></li>
            <li><a href="https://www.tiktok.com/@reserva.en.rojo?_r=1&amp;_t=ZS-9AuDf2ImlkL" target="_blank" rel="noopener noreferrer" aria-label="TikTok (otra pestaña)"><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 3c.3 2.4 1.6 3.8 4 4v3.2a9 9 0 0 1-4-1.2v6.6a6.2 6.2 0 1 1-5.4-6.2v3.3a2.9 2.9 0 1 0 2.2 2.8V3z" /></svg></a></li>
          </ul>
        </section>
        <BackToTop />
      </div>
    </div>
  </footer>;
}
