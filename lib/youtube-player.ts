export interface VideoPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  setVolume(value: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

interface PlayerEvents {
  onReady(event: { target: VideoPlayer }): void;
  onStateChange(event: { data: number }): void;
  onError(event: { data: number }): void;
  onAutoplayBlocked(): void;
}

interface YouTubeApi {
  Player: new (iframe: HTMLIFrameElement, options: { events: PlayerEvents }) => VideoPlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let pending: Promise<YouTubeApi> | null = null;

// Shared across route visits, but invoked only after the visitor activates the video.
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const script = document.createElement('script');
    const timeout = window.setTimeout(fail, 20000);
    function restore() {
      window.clearTimeout(timeout);
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous;
    }
    function fail() {
      restore(); script.remove(); pending = null;
      reject(new Error('YouTube player API unavailable'));
    }
    function ready() {
      restore();
      if (window.YT?.Player) resolve(window.YT); else { fail(); return; }
      previous?.();
    }
    window.onYouTubeIframeAPIReady = ready;
    script.async = true;
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return pending;
}
