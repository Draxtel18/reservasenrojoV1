'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './game-embed.module.css';

const GAME_URL = 'https://banco-sangre.devisesoftware.net/';

export function GameEmbed() {
  const stage = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const update = () => setExpanded(document.fullscreenElement === stage.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  async function toggle() {
    const element = stage.current;
    if (!element) return;
    try {
      if (document.fullscreenElement === element) await document.exitFullscreen();
      else await element.requestFullscreen();
    } catch {
      // The browser refused the change: leave the state untouched instead of faking success.
    }
  }

  return (
    <div ref={stage} className={styles.stage} data-expanded={expanded ? 'true' : undefined}>
      <iframe className={styles.frame} src={GAME_URL} title="Juego: Pulso Piura — Héroe de la Donación" loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      <div className={styles.actions}>
        <button type="button" className="button" onClick={toggle} aria-pressed={expanded}>{expanded ? 'Reducir el juego' : 'Ampliar el juego'}</button>
        <a className="text-link" href={GAME_URL} target="_blank" rel="noreferrer">Abrir en una pestaña nueva</a>
      </div>
    </div>
  );
}
