'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './game-embed.module.css';

const GAME_URL = 'https://banco-sangre.devisesoftware.net/';

// A phone held sideways leaves the inline frame too wide and short for the game, which crops it.
const SHORT_LANDSCAPE = '(hover: none) and (pointer: coarse) and (orientation: landscape) and (max-height: 620px)';

export function GameEmbed() {
  const stage = useRef<HTMLDivElement>(null);
  const onScreen = useRef(false);
  const rotatedIn = useRef(false);
  const expandedRef = useRef(false);
  const [expanded, setExpandedState] = useState(false);

  // Fullscreen events run outside React, so the current value is mirrored in a ref.
  function markExpanded(value: boolean) {
    expandedRef.current = value;
    setExpandedState(value);
  }

  async function expand(byRotation = false) {
    const element = stage.current;
    if (!element) return;
    rotatedIn.current = byRotation;
    try {
      await element.requestFullscreen();
    } catch {
      // A rotation carries no user gesture and iOS Safari has no element fullscreen:
      // the stage keeps its inline layout instead of pretending to be expanded.
    }
  }

  async function collapse() {
    rotatedIn.current = false;
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // The browser refused: the state stays as reported by the fullscreen event.
    }
  }

  useEffect(() => {
    const sync = () => markExpanded(stage.current !== null && document.fullscreenElement === stage.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      onScreen.current = true;
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) onScreen.current = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia(SHORT_LANDSCAPE);
    const sync = () => {
      // Only rotations expand, and only when the game is on screen, so turning the
      // phone while reading another section never takes the page over.
      if (query.matches) {
        if (onScreen.current && !expandedRef.current) void expand(true);
      } else if (rotatedIn.current) {
        void collapse();
      }
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <div ref={stage} className={styles.stage} data-expanded={expanded ? 'true' : undefined}>
      <iframe className={styles.frame} src={GAME_URL} title="Juego: Pulso Piura — Héroe de la Donación" loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      <div className={styles.actions}>
        <button type="button" className="button" onClick={() => (expanded ? void collapse() : void expand())} aria-pressed={expanded}>{expanded ? 'Reducir el juego' : 'Ampliar el juego'}</button>
        <a className="text-link" href={GAME_URL} target="_blank" rel="noreferrer">Abrir en una pestaña nueva</a>
      </div>
    </div>
  );
}
