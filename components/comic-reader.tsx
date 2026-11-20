'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { comic } from '@/content/comic';
import { readProgress, writeProgress } from '@/lib/playback-progress';
import styles from './comic-reader.module.css';

/*
 * Comic pages are served by the Next image optimizer. `quality` values must be
 * allowlisted in `next.config.ts` (`images.qualities`), otherwise the optimizer
 * answers HTTP 400 for the generated srcset.
 */
const PROGRESS_KEY = 'comic-los-vampiros';
const PAGES = comic.pages;
const LAST_INDEX = PAGES.length - 1;
const COVER_PAGE = PAGES[0];
const COVER_SIZES = '(max-width: 700px) 92vw, (max-width: 1000px) 60vw, 460px';
const STAGE_SIZES = '(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 980px';
const SWIPE_MIN_DISTANCE = 60;
const SWIPE_MAX_MS = 700;
const SWIPE_AXIS_RATIO = 2;

type Gesture = { x: number; y: number; time: number };

function clampIndex(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(LAST_INDEX, Math.floor(value)));
}

function isZoomed(): boolean {
  const scale = window.visualViewport?.scale;
  return typeof scale === 'number' && scale > 1;
}

export function ComicCover() {
  return <figure className={`comic-cover ${styles.cover}`} data-reveal="media">
    <div className={styles.coverFrame}>
      <Image src={comic.cover} alt={COVER_PAGE.alt} width={COVER_PAGE.width} height={COVER_PAGE.height}
        sizes={COVER_SIZES} placeholder="blur" blurDataURL={COVER_PAGE.blurDataURL} quality={82} />
    </div>
    <figcaption><span>{comic.kind}</span><span>{PAGES.length} páginas</span></figcaption>
  </figure>;
}

export function ComicReader() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const [page, setPage] = useState(0);
  const [overview, setOverview] = useState(false);
  const [open, setOpen] = useState(false);

  const active = PAGES[page];
  const atEnd = page === LAST_INDEX;
  const neighbours = [page - 1, page + 1].filter(index => index >= 0 && index <= LAST_INDEX).map(index => PAGES[index]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function openReader() {
    setPage(clampIndex(readProgress(PROGRESS_KEY)));
    setOverview(false);
    setOpen(true);
    dialog.current?.showModal();
    stage.current?.scrollTo({ top: 0 });
    heading.current?.focus();
  }

  function go(next: number) {
    const index = clampIndex(next);
    setPage(index);
    writeProgress(PROGRESS_KEY, index);
    stage.current?.scrollTo({ top: 0 });
    const thumb = rail.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    thumb?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  return <>
    <button ref={trigger} type="button" className="button dark-button" onClick={openReader}>Explorar cómic</button>
    <dialog ref={dialog} className={styles.reader} aria-labelledby="comic-reader-title"
      onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); go(page + 1); }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); go(page - 1); }
        else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          go(event.key === 'Home' ? 0 : LAST_INDEX);
        }
      }}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headings}>
            <p className={styles.kicker}>Cómic periodístico</p>
            <div className={styles.titleRow}>
              <h2 ref={heading} id="comic-reader-title" tabIndex={-1}>{comic.title}</h2>
              <p className={styles.counter} aria-live="polite">Página {page + 1} de {PAGES.length}</p>
            </div>
            <p className={styles.subtitle}>{comic.subtitle}</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.mode} onClick={() => setOverview(!overview)}>{overview ? 'Ajustar al ancho' : 'Ver página completa'}</button>
            <button type="button" className={styles.close} aria-label="Cerrar lector" onClick={() => dialog.current?.close()}>Cerrar <span aria-hidden="true">×</span></button>
          </div>
        </header>
        <div ref={stage} className={`${styles.stage} ${overview ? styles.overview : styles.reading}`} data-comic-body
          onTouchStart={event => {
            gesture.current = event.touches.length === 1 && !isZoomed()
              ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: Date.now() }
              : null;
          }}
          onTouchMove={event => { if (event.touches.length !== 1) gesture.current = null; }}
          onTouchCancel={() => { gesture.current = null; }}
          onTouchEnd={event => {
            const start = gesture.current;
            gesture.current = null;
            if (!start || event.touches.length || event.changedTouches.length !== 1 || isZoomed()) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy) * SWIPE_AXIS_RATIO && Date.now() - start.time < SWIPE_MAX_MS) {
              go(page + (dx < 0 ? 1 : -1));
            }
          }}>
          <Image key={active.src} className={styles.page} src={active.src} alt={active.alt}
            width={active.width} height={active.height} sizes={STAGE_SIZES}
            placeholder="blur" blurDataURL={active.blurDataURL} quality={80} priority />
          <div className={styles.prefetch} aria-hidden="true">
            {neighbours.map(item => <Image key={item.page} src={item.src} alt="" width={item.width} height={item.height}
              sizes={STAGE_SIZES} quality={80} loading="eager" />)}
          </div>
        </div>
        <footer className={styles.dock}>
          <div className={styles.progressBar} aria-hidden="true"><div className={styles.progressFill} style={{ width: `${((page + 1) / PAGES.length) * 100}%` }} /></div>
          <div className={styles.dockInner}>
            <div ref={rail} className={styles.rail} role="group" aria-label="Páginas del cómic">
              {PAGES.map((item, index) => <button key={item.page} type="button" className={styles.thumb} data-thumb={index}
                aria-label={`Ir a la página ${item.page}`} aria-current={index === page ? 'page' : undefined} onClick={() => go(index)}>
                <Image src={item.src} alt="" width={item.width} height={item.height} sizes="42px" loading="lazy" />
              </button>)}
            </div>
            <div className={styles.nav}>
              <button type="button" className={styles.navButton} aria-label="Página anterior" disabled={page === 0} onClick={() => go(page - 1)}>← Anterior</button>
              <button type="button" className={styles.navButton} aria-label={atEnd ? 'Cerrar cómic' : 'Página siguiente'}
                onClick={() => { if (atEnd) dialog.current?.close(); else go(page + 1); }}>{atEnd ? 'Cerrar' : 'Siguiente →'}</button>
            </div>
          </div>
        </footer>
      </div>
    </dialog>
    <noscript>
      <section className={styles.fallback} aria-label="Cómic sin JavaScript">
        <p>El lector interactivo necesita JavaScript. Puedes abrir cada página como imagen.</p>
        <ul>{PAGES.map(item => <li key={item.page}><a href={item.src}>{item.alt}</a></li>)}</ul>
      </section>
    </noscript>
  </>;
}
