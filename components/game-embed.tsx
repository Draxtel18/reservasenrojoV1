'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './game-embed.module.css';

const GAME_URL = 'https://banco-sangre.devisesoftware.net/';

// A phone held sideways leaves the inline frame too wide and short for the game, which crops it.
const SHORT_LANDSCAPE = '(hover: none) and (pointer: coarse) and (orientation: landscape) and (max-height: 620px)';
// Key of the history entry the overlay pushes so the native back button closes the game.
const OVERLAY_ENTRY = 'game-embed-overlay';

type Mode = 'inline' | 'fullscreen' | 'overlay';

export function GameEmbed() {
  const stage = useRef<HTMLDivElement>(null);
  const toggleButton = useRef<HTMLButtonElement>(null);
  const onScreen = useRef(false);
  const rotatedIn = useRef(false);
  const [mode, setModeState] = useState<Mode>('inline');
  const modeRef = useRef<Mode>('inline');

  // The DOM events below run outside React, so the current mode is kept in a ref as well.
  const setMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setModeState(next);
  }, []);

  const expanded = mode !== 'inline';

  const enter = useCallback(
    async (byRotation = false) => {
      const element = stage.current;
      if (!element) return;
      rotatedIn.current = byRotation;
      try {
        await element.requestFullscreen();
        return;
      } catch {
        // iOS Safari has no element fullscreen and a rotation carries no user gesture:
        // an overlay filling the viewport gives the game the same room as native fullscreen.
      }
      if (modeRef.current === 'inline') setMode('overlay');
    },
    [setMode],
  );

  const leave = useCallback(async () => {
    rotatedIn.current = false;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        return;
      } catch {
        // Fall through: an overlay still has to be released.
      }
    }
    if (modeRef.current === 'overlay') setMode('inline');
  }, [setMode]);

  useEffect(() => {
    const sync = () => {
      const element = stage.current;
      if (element !== null && document.fullscreenElement === element) setMode('fullscreen');
      else if (modeRef.current === 'fullscreen') setMode('inline');
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [setMode]);

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
      // Only rotations expand: an already expanded stage, or a game scrolled out of view, stays untouched.
      if (query.matches) {
        if (onScreen.current && modeRef.current === 'inline') void enter(true);
      } else if (rotatedIn.current) {
        void leave();
      }
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [enter, leave]);

  useEffect(() => {
    if (mode !== 'overlay') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // The overlay stands in for native fullscreen, so back has to close the game, not the page.
    window.history.pushState({ [OVERLAY_ENTRY]: true }, '');
    const close = () => {
      rotatedIn.current = false;
      setMode('inline');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('popstate', close);
    window.addEventListener('keydown', onKeyDown);
    // The control is hidden inside the game, so keyboard focus has to land on the stage instead.
    stage.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('popstate', close);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      toggleButton.current?.focus({ preventScroll: true });
      // Leaving the overlay by rotation or Escape must not leave its entry behind.
      if (window.history.state?.[OVERLAY_ENTRY]) window.history.back();
    };
  }, [mode, setMode]);

  function toggle() {
    if (expanded) void leave();
    else void enter();
  }

  return (
    <div
      ref={stage}
      className={styles.stage}
      tabIndex={mode === 'overlay' ? -1 : undefined}
      data-expanded={expanded ? 'true' : undefined}
      data-overlay={mode === 'overlay' ? 'true' : undefined}
    >
      <iframe className={styles.frame} src={GAME_URL} title="Juego: Pulso Piura — Héroe de la Donación" loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      <div className={styles.actions}>
        <button ref={toggleButton} type="button" className="button" onClick={toggle} aria-pressed={expanded}>{expanded ? 'Reducir el juego' : 'Ampliar el juego'}</button>
        <a className="text-link" href={GAME_URL} target="_blank" rel="noreferrer">Abrir en una pestaña nueva</a>
      </div>
    </div>
  );
}
