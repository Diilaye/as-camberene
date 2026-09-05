/**
 * Identifiants de vidéos YouTube.
 *
 * Une diapositive de tête se configure avec ce que l'on a sous la main : un
 * identifiant nu, un lien de la barre d'adresse, un lien de partage `youtu.be`,
 * un lien `/embed/` ou `/shorts/`. Tous mènent au même identifiant de 11
 * caractères, seul format que l'API accepte.
 */

const ID_PATTERN = /^[\w-]{11}$/;

export const youtubeId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;
  if (ID_PATTERN.test(value)) return value;

  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1);
      return ID_PATTERN.test(id) ? id : null;
    }

    if (host.endsWith('youtube.com')) {
      const param = url.searchParams.get('v');
      if (param && ID_PATTERN.test(param)) return param;

      // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
      const segments = url.pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && ID_PATTERN.test(last)) return last;
    }
  } catch {
    // Chaîne qui n'est ni un identifiant ni une URL : on le dit à l'appelant.
  }

  return null;
};

/** `93` → `1:33`. Une durée inconnue s'affiche `0:00` plutôt que `NaN:NaN`. */
export const formatVideoTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
};

/* ------------------------------------------------------------------ *
 * Chargement de l'API IFrame
 * ------------------------------------------------------------------ */

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type { YouTubePlayer };

let pending: Promise<YouTubeApi> | null = null;

/**
 * Charge le script d'API une seule fois pour toute la page.
 *
 * YouTube n'expose qu'un seul point d'entrée global, `onYouTubeIframeAPIReady` :
 * deux composants qui l'écraseraient chacun de leur côté se voleraient le
 * signal. La promesse est donc partagée, et le rappel existant est préservé.
 */
export const loadYouTubeApi = (): Promise<YouTubeApi> => {
  if (pending) return pending;

  pending = new Promise<YouTubeApi>((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT as YouTubeApi);
    };

    if (!document.querySelector('script[data-youtube-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeApi = 'true';
      document.head.appendChild(script);
    }
  });

  return pending;
};
