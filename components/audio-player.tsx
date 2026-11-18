'use client';

import { useEffect, useRef, useState } from 'react';
import { readProgress, writeProgress } from '@/lib/playback-progress';
import styles from './audio-player.module.css';

const progressKey = 'podcast-la-espera';
function clock(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function AudioPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const restored = useRef(false);
  const [enhanced, setEnhanced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);

  function metadata() {
    const media = audio.current;
    if (!media || !Number.isFinite(media.duration) || media.duration <= 0) return;
    setDuration(media.duration);
    if (!restored.current) {
      restored.current = true;
      const saved = readProgress(progressKey);
      // A completed or wildly out-of-range position starts a fresh listen.
      media.currentTime = saved < media.duration ? Math.max(0, saved) : 0;
      setPosition(media.currentTime);
    }
  }
  useEffect(() => {
    setEnhanced(true);
    const media = audio.current;
    if (media && media.readyState >= 1) metadata();
    return () => { media?.pause(); };
  }, []);

  function syncPosition() {
    const media = audio.current;
    if (!media || !restored.current) return;
    setPosition(media.currentTime);
    writeProgress(progressKey, media.currentTime);
  }
  function seek(next: number) {
    const media = audio.current;
    if (!media || !duration || !Number.isFinite(next)) return;
    media.currentTime = Math.min(duration, Math.max(0, next));
    syncPosition();
  }
  async function toggle() {
    const media = audio.current;
    if (!media) return;
    if (!media.paused) { media.pause(); return; }
    setError('');
    setBusy(true);
    try { await media.play(); }
    catch { setError('No se pudo reproducir el audio. Intenta de nuevo o descarga la muestra.'); }
    finally { setBusy(false); }
  }

  return <div className={styles.player}>
    <audio ref={audio} controls={!enhanced} preload="metadata" src="/demo/podcast-demo.wav" aria-label="Podcast de demostración: La espera"
      onLoadedMetadata={metadata} onDurationChange={metadata} onTimeUpdate={syncPosition}
      onPlay={() => { setPlaying(true); setError(''); }}
      onPlaying={() => setBusy(false)} onWaiting={() => setBusy(true)} onCanPlay={() => setBusy(false)}
      onPause={() => { setPlaying(false); setBusy(false); syncPosition(); }}
      onEnded={() => { setPlaying(false); setBusy(false); seek(0); writeProgress(progressKey, 0); }}
      onError={() => { setPlaying(false); setBusy(false); setError('No se pudo cargar el audio. Puedes descargar la muestra o leer la transcripción.'); }}
      onVolumeChange={() => { if (audio.current) { setVolume(audio.current.volume); setMuted(audio.current.muted); } }}
      onRateChange={() => { if (audio.current) setRate(audio.current.playbackRate); }}>
      Tu navegador no admite audio. Usa el enlace de descarga o lee la transcripción.
    </audio>
    {enhanced && <div className={styles.controls} aria-label="Reproductor de audio">
      <div className={styles.transport}>
        <button className={styles.play} onClick={toggle} aria-label={playing ? 'Pausar audio' : 'Reproducir audio'}>{playing ? 'Pausar' : 'Escuchar'} <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span></button>
        <button onClick={() => seek(position - 15)} disabled={!duration} aria-label="Retroceder 15 segundos">−15 s</button>
        <button onClick={() => seek(position + 15)} disabled={!duration} aria-label="Avanzar 15 segundos">+15 s</button>
        <output className={styles.time} aria-label="Tiempo del audio">{clock(position)} / {clock(duration)}</output>
      </div>
      <label className={styles.seek}>Posición del audio
        <input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(position, duration)} disabled={!duration} onChange={event => seek(Number(event.target.value))} aria-valuetext={`${clock(position)} de ${clock(duration)}`} />
      </label>
      <div className={styles.settings}>
        <button onClick={() => { if (audio.current) audio.current.muted = !muted; }} aria-label={muted ? 'Activar sonido del audio' : 'Silenciar audio'} aria-pressed={muted}>{muted ? 'Activar sonido' : 'Silenciar'}</button>
        <label className={styles.volume}>Volumen del audio<input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={event => { if (audio.current) { audio.current.volume = Number(event.target.value); audio.current.muted = false; } }} /></label>
        <label>Velocidad del audio<select value={rate} onChange={event => { if (audio.current) audio.current.playbackRate = Number(event.target.value); }}>{[.75, 1, 1.25, 1.5, 2].map(speed => <option key={speed} value={speed}>{speed}×</option>)}</select></label>
        <button className={styles.restart} onClick={() => seek(0)} disabled={!duration} aria-label="Volver al inicio del audio">Volver al inicio</button>
      </div>
      <p className={styles.status} role="status">{busy ? 'Cargando audio…' : duration ? 'El progreso se guarda en este dispositivo.' : 'Esperando los datos del audio…'}</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>}
  </div>;
}
