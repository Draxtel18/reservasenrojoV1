import Image from 'next/image';
import { Quiz } from '@/components/interactions';
import { Documentary } from '@/components/video-player';
import { DemoComic, DemoComicCover, DemoPodcast } from '@/components/demo-media';
import { documentary, editorial, sections } from '@/content/editorial';
import { demoArticle, demoDisclosure, demoTeam, demoTimeline } from '@/content/demo';

function Photo({ name, alt }: { name: string; alt: string }) {
  return <Image src={`/media/${name}.webp`} alt={alt} width={1366} height={768} sizes="(max-width: 700px) 100vw, 65vw" className="editorial-photo" />;
}

export function SectionContent({ section }: { section: string }) {
  const content: Record<string, React.ReactNode> = {
    reportaje: (<section id="reportaje" className="documentary section dark" aria-labelledby="documentary-title">
        <div className="section-intro"><h2 id="documentary-title" data-reveal>La historia, de cerca</h2><p data-reveal>{documentary.description} Mira el reportaje completo.</p></div>
        <div data-reveal><Documentary /></div>
        <div className="media-caption"><span>Reservas en rojo. Reportaje audiovisual.</span><a href={`https://www.youtube.com/watch?v=${documentary.id}`} target="_blank" rel="noreferrer">Ver en YouTube <span className="sr-only">(abre en otra pestaña)</span></a></div>
        <nav id="formatos" className="format-index" aria-label="Formatos de la investigación">{sections.slice(1).map(([id, label]) => <a key={id} href={`/${id}`}>{label}<span aria-hidden="true">↘</span></a>)}</nav>
      </section>),
    comic: (<section id="comic" className="section comic light" aria-labelledby="comic-title">
        <div className="comic-copy"><h2 id="comic-title" data-reveal>Otra forma de mirar</h2><p data-reveal>La espera: tres páginas ilustradas sobre dos personajes que aprenden a ordenar sus preguntas. Explora las viñetas a tu ritmo.</p><p className="demo-disclosure" role="note">{demoDisclosure}</p><DemoComic /></div>
        <DemoComicCover />
      </section>),
    podcast: (<section id="podcast" className="section podcast deep" aria-labelledby="podcast-title">
        <div className="podcast-art" data-reveal><Photo name="procedimiento" alt="Detalle del trabajo del personal durante una extracción" /><span>La investigación<br />también se escucha.</span></div>
        <div className="podcast-copy"><h2 id="podcast-title" data-reveal>Escuchar para entender</h2><p data-reveal>Una narración de muestra que acompaña el relato ilustrado. Escucha, pausa o sigue la historia con su transcripción.</p><DemoPodcast /></div>
      </section>),
    participa: (<section id="participa" className="section participation light" aria-labelledby="quiz-title">
        <div className="quiz-intro"><h2 id="quiz-title" data-reveal>Leer. Mirar. Cuestionar.</h2><p data-reveal>Tres preguntas para acercarte al enfoque del especial y reflexionar sobre cómo nos informamos.</p><p className="small-copy">Basado en la presentación del proyecto. No incluye datos médicos ni afirmaciones no verificadas del documental.</p><Photo name="prueba" alt="Personal sanitario realiza una prueba en el dedo de una persona" /></div>
        <Quiz />
      </section>),
    cronologia: (<section id="cronologia" className="section timeline dark" aria-labelledby="timeline-title">
        <div className="section-intro"><h2 id="timeline-title" data-reveal>Una historia en pasos</h2><p data-reveal>Cinco jornadas de una secuencia narrativa ficticia. No representan fechas ni acontecimientos de la investigación real.</p></div>
        <p className="demo-disclosure" role="note">{demoDisclosure}</p>
        <div className="timeline-layout"><ol className="demo-timeline">{demoTimeline.map(item => <li className="demo-timeline-item" key={item.label} data-reveal="row"><h3>{item.title}</h3><p className="timeline-date">{item.label} · simulación</p><p>{item.text}</p></li>)}</ol><figure data-reveal="media"><Photo name="donacion" alt="Una bolsa de sangre se encuentra en el equipo de extracción" /><figcaption>Fotografía original del proyecto, independiente de la secuencia ficticia.</figcaption></figure></div>
      </section>),
    lectura: (<section id="lectura" className="section written light" aria-labelledby="written-title">
        <div className="article-opening"><h2 id="written-title" data-reveal>Detrás de la urgencia</h2><p className="article-lead" data-reveal>{editorial.lead}</p></div>
        <div className="article-grid"><aside><p>Lectura de demostración</p><p>Ficción editorial</p><nav className="article-index" aria-label="Índice del relato">{demoArticle.map((item, index) => <a href={`#demo-article-${index}`} key={item.title}>{item.title}</a>)}</nav></aside><article><p className="demo-disclosure" role="note">{demoDisclosure}</p>{demoArticle.map((item, index) => <div key={item.title} id={`demo-article-${index}`} className="demo-article-part"><h3>{item.title}</h3><p>{item.text}</p>{index === 1 && <figure data-reveal="media"><Photo name="reserva" alt="Bolsa de sangre en una bandeja del equipo de extracción" /><figcaption>Fotografía original: no documenta los personajes ni los hechos de esta ficción.</figcaption></figure>}</div>)}<a className="text-link" href="/reportaje">Ver el documental original</a></article></div>
      </section>),
    equipo: (<section id="equipo" className="section team light" aria-labelledby="team-title">
        <div className="section-intro"><h2 id="team-title" data-reveal>Un equipo de muestra</h2><p data-reveal>Nueve perfiles ficticios para visualizar los roles de un equipo multimedia. No son los autores reales del documental ni de las fotografías.</p></div>
        <div className="team-grid">{demoTeam.map((person, index) => <div className="profile" key={person.name} aria-label={`${person.name}, perfil ficticio`} data-reveal="row"><svg className="portrait-demo" viewBox="0 0 240 220" role="img" aria-label={`Avatar ilustrado de ${person.name}, personaje ficticio`}><rect width="240" height="220" fill={index % 3 === 0 ? '#730202' : index % 3 === 1 ? '#bf0b1a' : '#0d0d0d'} /><circle cx="120" cy="86" r="38" fill="#f2f2f2" /><path d="M43 220v-20q0-74 77-74t77 74v20" fill="#f2f2f2" /><path d={`M78 78q8-${48 + index * 2} 75-20l12 26-87-6`} fill={index % 2 ? '#0d0d0d' : '#730202'} /></svg><h3 className="profile-name">{person.name}</h3><p>{person.role}</p><p className="profile-bio">{person.bio}</p><p className="profile-demo-label">Perfil ficticio</p></div>)}</div>
      </section>),
  };
  return content[section] ?? null;
}
