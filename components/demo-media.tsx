'use client';

import { useRef, useState } from 'react';
import { comicPages, demoDisclosure, podcast } from '@/content/demo';
import styles from './demo-media.module.css';

function ComicArt({ scene }: { scene: number }) {
  return <svg viewBox="0 0 800 460" role="img" aria-label={`Ilustración ficticia: ${comicPages[scene].title}`} className={styles.art}>
    <rect width="800" height="460" fill="#f2f2f2" />
    <g stroke="#0d0d0d" strokeWidth="3" opacity=".12">{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 80 - 200} 0l460 460`} />)}</g>
    <rect x="36" y="36" width="728" height="388" fill="none" stroke="#0d0d0d" strokeWidth="5" />
    {scene === 0 && <><rect x="500" y="66" width="210" height="140" fill="#730202" /><path d="M605 66v140M500 136h210" stroke="#f2f2f2" strokeWidth="5" /><circle cx="120" cy="110" r="34" fill="#f2f2f2" stroke="#0d0d0d" strokeWidth="6" /><path d="M120 88v24l18 12" fill="none" stroke="#bf0b1a" strokeWidth="6" /></>}
    {scene === 1 && <><rect x="310" y="80" width="180" height="90" fill="#730202" /><path d="M335 110h130m-130 26h86" stroke="#f2f2f2" strokeWidth="7" /></>}
    {scene === 2 && <path d="M108 310Q400 430 692 310" fill="none" stroke="#bf0b1a" strokeWidth="14" />}
    {(scene === 1 ? [190, 610] : [220, 400, 580]).map((x, i) => <g key={x} transform={`translate(${x} ${scene === 1 ? 190 : 220})`}>
      <path d="M-35 140l-12 60m82-60 12 60" stroke="#0d0d0d" strokeWidth="20" />
      <path d="M-46 44q46-28 92 0l22 96H-68z" fill={i % 2 ? '#bf0b1a' : '#0d0d0d'} />
      <circle cy="-10" r="35" fill="#f2f2f2" stroke="#0d0d0d" strokeWidth="7" />
      <path d="M-35-17q0-51 59-24l14 28-26-10-37 7" fill="#0d0d0d" />
      <path d="M-9 4q9 8 18 0" fill="none" stroke="#0d0d0d" strokeWidth="3" />
    </g>)}
    {scene === 0 && <path d="M130 355h540m-510 0v48m480-48v48" stroke="#bf0b1a" strokeWidth="14" />}
    {scene === 1 && <><path d="M130 340h540m-480 0v70m420-70v70" stroke="#bf0b1a" strokeWidth="16" /><rect x="335" y="265" width="130" height="65" rx="2" fill="#f2f2f2" stroke="#0d0d0d" strokeWidth="4" /><path d="M355 283h90m-90 16h64" stroke="#0d0d0d" strokeWidth="3" /></>}
  </svg>;
}

export function DemoComicCover() {
  return <div className={`comic-cover ${styles.cover}`} data-reveal="media">
    <p className={styles.coverBrand}>Reservas en rojo</p><p className={`cover-name ${styles.coverTitle}`}>La espera</p>
    <ComicArt scene={0} /><p>Un relato ficticio en tres páginas.</p>
  </div>;
}

export function DemoComic() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = comicPages[page];
  function go(next: number) { setPage(Math.max(0, Math.min(comicPages.length - 1, next))); setZoom(false); }
  return <><button ref={trigger} className="button dark-button" onClick={() => { setPage(0); setZoom(false); dialog.current?.showModal(); }}>Explorar cómic</button>
    <dialog ref={dialog} className={styles.reader} aria-labelledby="demo-comic-title" onClose={() => trigger.current?.focus()}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); go(page + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); go(page - 1); }
      }}>
      <div className={styles.readerContent}>
        <button className="dialog-close" onClick={() => dialog.current?.close()} autoFocus>Cerrar lector</button>
        <h2 id="demo-comic-title">La espera</h2><p className={styles.notice}>{demoDisclosure}</p>
        <div className={styles.pageHeader}><p aria-live="polite">Página {page + 1} de {comicPages.length}</p><button className={styles.textButton} aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? 'Ajustar viñeta' : 'Ampliar viñeta'}</button></div>
        <h3>{current.title}</h3><div className={styles.artViewport}><div className={zoom ? styles.zoom : ''}><ComicArt scene={current.scene} /></div></div>
        <p className={styles.narration}>{current.narration}</p>
        <div className={styles.dialogue}>{current.dialogue.map(line => <p key={line}>{line}</p>)}</div>
        <nav className={styles.readerNav} aria-label="Páginas del cómic">
          <button className="button dark-button" disabled={page === 0} onClick={() => go(page - 1)} aria-label="Página anterior">← Anterior</button>
          <button className="button dark-button" onClick={() => page === comicPages.length - 1 ? dialog.current?.close() : go(page + 1)} aria-label={page === comicPages.length - 1 ? 'Cerrar cómic' : 'Página siguiente'}>{page === comicPages.length - 1 ? 'Cerrar' : 'Siguiente →'}</button>
        </nav>
      </div>
    </dialog>
    <noscript>El lector necesita JavaScript. Puedes leer la misma historia ficticia en el reportaje escrito de muestra.</noscript>
  </>;
}

export function DemoPodcast() {
  return <div className={styles.podcast}>
    <h3>{podcast.title}</h3><p className={styles.notice}>Voz sintética. Relato ficticio de demostración, no una entrevista real.</p>
    <audio controls preload="metadata" src="/demo/podcast-demo.wav" aria-label="Podcast de demostración: La espera">Tu navegador no admite audio. Usa el enlace de descarga o lee la transcripción.</audio>
    <a className="text-link" href="/demo/podcast-demo.wav" download>Descargar muestra WAV ↓</a>
    <details><summary>Transcripción</summary><div className={styles.transcript}>{podcast.transcript.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></details>
  </div>;
}
