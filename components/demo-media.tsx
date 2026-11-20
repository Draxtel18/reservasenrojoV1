'use client';

import { podcast } from '@/content/demo';
import { AudioPlayer } from './audio-player';
import styles from './demo-media.module.css';

export function DemoPodcast() {
  return <div className={styles.podcast}>
    <h3>{podcast.title}</h3><p className={styles.notice}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
    <AudioPlayer />
    <a className="text-link" href="/demo/podcast-demo.wav" download>Descargar muestra WAV ↓</a>
    <details><summary>Transcripción</summary><div className={styles.transcript}>{podcast.transcript.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></details>
  </div>;
}
