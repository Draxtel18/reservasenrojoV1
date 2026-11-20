import Image from 'next/image';
import { Documentary } from '@/components/video-player';
import { ComicCover, ComicReader } from '@/components/comic-reader';
import { DemoPodcast } from '@/components/demo-media';
import { GameEmbed } from '@/components/game-embed';
import { documentary, editorial, readingMinutes, readingNotes, sections, timelineNotes } from '@/content/editorial';
import { demoTeam } from '@/content/demo';

function Photo({ name, alt }: { name: string; alt: string }) {
  return <Image src={`/media/${name}.webp`} alt={alt} width={1366} height={768} sizes="(max-width: 700px) 100vw, 65vw" className="editorial-photo" />;
}

export function SectionContent({ section }: { section: string }) {
  const content: Record<string, React.ReactNode> = {
    reportaje: (<section id="reportaje" className="documentary section dark" aria-labelledby="documentary-title">
        <div className="section-intro"><h2 id="documentary-title" data-reveal>La historia, de cerca</h2><p data-reveal>{documentary.description} Mira el reportaje completo.</p></div>
        <div data-reveal><Documentary /></div>
        <div className="media-caption"><span>Reservas en rojo. Reportaje audiovisual.</span></div>
        <nav id="formatos" className="format-index" aria-label="Formatos de la investigación">{sections.slice(1).map(([id, label]) => <a key={id} href={`/${id}`}>{label}<span aria-hidden="true">↘</span></a>)}</nav>
      </section>),
    comic: (<section id="comic" className="section comic light" aria-labelledby="comic-title">
        <div className="comic-copy">
          <h2 id="comic-title" data-reveal>Otra forma de mirar</h2>
          <p data-reveal>«Los vampiros» reconstruye la historia de Daniel, un joven de 24 años que paga por una sangre que nunca llega a su padre. Diez páginas ilustradas sobre la red que lucraba con la desesperación de las familias de Piura.</p>
          <ComicReader />
        </div>  
        <ComicCover />
      </section>),
    podcast: (<section id="podcast" className="section podcast deep" aria-labelledby="podcast-title">
        <div className="podcast-art" data-reveal><Photo name="procedimiento" alt="Detalle del trabajo del personal durante una extracción" /><span>La investigación<br />también se escucha.</span></div>
        <div className="podcast-copy"><h2 id="podcast-title" data-reveal>Escuchar para entender</h2><p data-reveal>Una narración que acompaña el relato ilustrado. Escucha, pausa o sigue la historia con su transcripción.</p><DemoPodcast /></div>
      </section>),
    participa: (<section id="participa" className="section participation-game light" aria-labelledby="game-title">
        <div className="game-head"><h2 id="game-title" data-reveal>Pulso Piura</h2></div>
        <GameEmbed />
      </section>),
    cronologia: (<section id="cronologia" className="section timeline dark" aria-labelledby="timeline-title">
        <div className="section-intro"><h2 id="timeline-title" data-reveal>Una historia en pasos</h2><p data-reveal>Diecisiete hitos de la historia de la transfusión y la donación de sangre, en el mundo y en el Perú.</p></div>
        <div className="timeline-layout"><ol className="demo-timeline">{timelineNotes.map(item => <li className="demo-timeline-item" key={item.label} data-reveal="row"><h3>{item.title}</h3><p className="timeline-date">{item.label}</p><p>{item.text}</p></li>)}</ol><figure data-reveal="media"><Photo name="donacion" alt="Una bolsa de sangre se encuentra en el equipo de extracción" /><figcaption>Fotografía proporcionada. Autoría y fecha pendientes.</figcaption></figure></div>
      </section>),
    lectura: (<section id="lectura" className="section written light" aria-labelledby="written-title">
        <div className="article-opening"><h2 id="written-title" data-reveal>Detrás de la urgencia</h2><p className="article-lead" data-reveal>{editorial.lead}</p></div>
        <div className="article-grid"><aside><p>Lectura del planteamiento</p><p>{readingMinutes} min de lectura estimada. Autoría y fecha pendientes.</p><nav className="article-index" aria-label="Índice del relato">{readingNotes.map((item, index) => <a href={`#demo-article-${index}`} key={item.title}>{item.title}</a>)}</nav></aside><article>{readingNotes.map((item, index) => <div key={item.title} id={`demo-article-${index}`} className="demo-article-part"><h3>{item.title}</h3><p>{item.text}</p>{index === 1 && <figure data-reveal="media"><Photo name="reserva" alt="Bolsa de sangre en una bandeja del equipo de extracción" /><figcaption>Fotografía proporcionada. Crédito pendiente.</figcaption></figure>}</div>)}<a className="text-link" href="/reportaje">Ver el reportaje original</a></article></div>
      </section>),
    equipo: (<section id="equipo" className="section team light" aria-labelledby="team-title">
        <div className="section-intro"><h2 id="team-title" data-reveal>Sobre nosotros</h2><p data-reveal>El equipo detrás de este proyecto.</p></div>
        <div className="team-grid">{demoTeam.map((person, index) => <div className="profile" key={person.name} aria-label={`${person.name}`} data-reveal="row"><svg className="portrait-demo" viewBox="0 0 240 220" role="img" aria-label={`Avatar ilustrado de ${person.name}`}><rect width="240" height="220" fill={index % 3 === 0 ? '#730202' : index % 3 === 1 ? '#bf0b1a' : '#0d0d0d'} /><circle cx="120" cy="86" r="38" fill="#f2f2f2" /><path d="M43 220v-20q0-74 77-74t77 74v20" fill="#f2f2f2" /><path d={`M78 78q8-${48 + index * 2} 75-20l12 26-87-6`} fill={index % 2 ? '#0d0d0d' : '#730202'} /></svg><h3 className="profile-name">{person.name}</h3><p>{person.role}</p><p className="profile-bio">{person.bio}</p></div>)}</div>
      </section>),
  };
  return content[section] ?? null;
}
