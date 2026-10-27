'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { documentary } from '@/content/editorial';
import { loadYouTubeApi, type VideoPlayer } from '@/lib/youtube-player';
import styles from './video-player.module.css';

function clock(value: number) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function Documentary() {
  const shell = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const player = useRef<VideoPlayer | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [status, setStatus] = useState('Preparando reproductor…');

  function sync() {
    const instance = player.current;
    if (!instance || typeof instance.getCurrentTime !== 'function') return;
    setPosition(Math.max(0, instance.getCurrentTime() || 0));
    setDuration(Math.max(0, instance.getDuration() || 0));
    setVolume(instance.getVolume());
    setMuted(instance.isMuted());
  }

  useEffect(() => {
    if (!origin) return;
    let active = true;
    let failed = false;
    const fail = () => {
      if (!active) return;
      failed = true;
      setReady(false); setPlaying(false);
      setStatus('No se pudo cargar el video. Puedes abrir el reportaje en YouTube.');
    };
    loadYouTubeApi().then(api => {
      if (!active || !iframe.current) return;
      const instance = new api.Player(iframe.current, { events: {
        onReady(event) {
          if (!active || failed) return;
          player.current = event.target;
          setReady(true); sync();
          setStatus('Listo para reproducir.');
          // Do not start late playback if the visitor has already scrolled away.
          const bounds = iframe.current?.getBoundingClientRect();
          const visible = bounds ? Math.max(0, Math.min(bounds.bottom, innerHeight) - Math.max(bounds.top, 0)) : 0;
          if (bounds && visible > bounds.height / 2 && document.visibilityState === 'visible') event.target.playVideo();
        },
        onStateChange(event) {
          if (!active || failed) return;
          setPlaying(event.data === 1 || event.data === 3);
          setStatus(event.data === 1 ? 'Reproduciendo' : event.data === 3 ? 'Cargando…' : event.data === 0 ? 'Finalizado' : 'En pausa');
          sync();
        },
        onError: fail,
        onAutoplayBlocked() { if (active && !failed) { setPlaying(false); setStatus('Selecciona Reproducir para iniciar el video.'); } },
      } });
      player.current = instance;
    }).catch(fail);
    return () => {
      active = false;
      const instance = player.current;
      player.current = null;
      instance?.destroy();
    };
  }, [origin]);

  useEffect(() => {
    if (!ready || !playing) return;
    const timer = window.setInterval(sync, 250);
    return () => window.clearInterval(timer);
  }, [ready, playing]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === shell.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  function togglePlayback() {
    if (!ready) return;
    if (playing) player.current?.pauseVideo(); else player.current?.playVideo();
  }
  function seek(value: number) {
    const next = Math.max(0, Math.min(duration, value));
    player.current?.seekTo(next, true); setPosition(next);
  }
  function changeVolume(value: number) {
    player.current?.setVolume(value);
    if (value === 0) player.current?.mute(); else player.current?.unMute();
    setVolume(value); setMuted(value === 0);
  }
  function toggleMute() {
    if (muted) {
      player.current?.unMute();
      if (volume === 0) changeVolume(80);
    } else player.current?.mute();
    setMuted(!muted);
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement === shell.current) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch { setStatus('Pantalla completa no disponible en este navegador.'); }
  }

  const source = origin ? `https://www.youtube-nocookie.com/embed/${documentary.id}?${new URLSearchParams({ autoplay: '0', rel: '0', controls: '0', enablejsapi: '1', playsinline: '1', origin, hl: 'es' })}` : '';
  return <div ref={shell} className={styles.player} role="region" aria-label="Reproductor del reportaje">
    <div className={`cinema ${styles.frame}`}>
      {origin ? <iframe ref={iframe} src={source} title="Reportaje audiovisual: Reservas en rojo" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>
        <Image src="/media/banco.webp" alt="Ingreso al banco de sangre y área de donantes" fill sizes="100vw" className="cinema-poster" />
        <button className="play-documentary" onClick={() => setOrigin(location.origin)}><span className="play-symbol" aria-hidden="true">▶</span><span>Reproducir reportaje</span></button>
      </>}
    </div>
    {origin && <div className={styles.controls}>
      <input className={styles.seek} type="range" aria-label="Posición del video" aria-valuetext={`${clock(position)} de ${clock(duration)}`} min="0" max={duration || 1} step="1" value={Math.min(position, duration || 1)} disabled={!ready || !duration} onChange={event => seek(Number(event.target.value))} />
      <div className={styles.controlRow}>
        <button disabled={!ready} onClick={togglePlayback} aria-label={playing ? 'Pausar video' : 'Reproducir video'} title={playing ? 'Pausar' : 'Reproducir'}><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span></button>
        <span className={styles.clock}>{clock(position)} / {duration ? clock(duration) : '--:--'}</span>
        <span className={styles.brand}>Reservas en rojo</span>
        <button disabled={!ready} onClick={toggleMute} aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d={muted ? 'm17 9 5 6m0-6-5 6' : 'M17 8q5 4 0 8'} fill="none" stroke="currentColor" strokeWidth="2" /></svg></button>
        <input className={styles.volume} type="range" aria-label="Volumen" min="0" max="100" step="1" value={muted ? 0 : volume} disabled={!ready} onChange={event => changeVolume(Number(event.target.value))} />
        <button disabled={!ready && !fullscreen} onClick={toggleFullscreen} aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} title="Pantalla completa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg></button>
      </div>
      <div className={styles.playerInfo}><p role="status">{status}</p><a href={`https://www.youtube.com/watch?v=${documentary.id}`} target="_blank" rel="noreferrer">Abrir en YouTube<span className="sr-only"> (otra pestaña)</span></a></div>
    </div>}
  </div>;
}
