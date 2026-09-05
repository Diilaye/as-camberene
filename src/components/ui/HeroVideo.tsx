import React, { useEffect, useRef, useState } from 'react';
import { YouTubePlayer, loadYouTubeApi } from '../../lib/youtube';

interface HeroVideoProps {
  videoId: string;
  /** Seule la diapositive visible joue : les autres restent en pause. */
  active: boolean;
  playing: boolean;
  muted: boolean;
  /** Position de lecture, remontée pour la barre de progression du carrousel. */
  onTime?: (current: number, duration: number) => void;
  /** Fin de la vidéo : le carrousel enchaîne sur la diapositive suivante. */
  onEnded?: () => void;
  /**
   * Vidéo injouable : supprimée, privée, ou dont le propriétaire interdit
   * l'intégration. Le carrousel retombe alors sur la photo de la diapositive.
   */
  onUnavailable?: () => void;
}

/**
 * Vidéo YouTube en fond de diapositive.
 *
 * Le lecteur natif est masqué (`controls: 0`) : les commandes sont celles du
 * carrousel, pour que l'habillage reste celui du site. La vidéo démarre coupée
 * — les navigateurs refusent toute lecture automatique avec le son — et le
 * visiteur le rétablit d'un clic.
 *
 * Le cadrage suit la règle du modèle : la vidéo garde son ratio 16/9 et déborde
 * du cadre plutôt que de laisser des bandes noires, comme le ferait
 * `object-fit: cover` sur une image.
 */
const HeroVideo: React.FC<HeroVideoProps> = ({
  videoId,
  active,
  playing,
  muted,
  onTime,
  onEnded,
  onUnavailable,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);

  // Les rappels changent à chaque rendu du parent ; les garder dans une
  // référence évite de reconstruire le lecteur à chaque fois.
  const onTimeRef = useRef(onTime);
  const onEndedRef = useRef(onEnded);
  const onUnavailableRef = useRef(onUnavailable);
  const stateRef = useRef({ active, playing });
  onTimeRef.current = onTime;
  onEndedRef.current = onEnded;
  onUnavailableRef.current = onUnavailable;
  stateRef.current = { active, playing };

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    loadYouTubeApi().then((api) => {
      if (cancelled || !mountRef.current) return;

      playerRef.current = new api.Player(mountRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          // `loop` exige que la vidéo soit aussi sa propre liste de lecture.
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (event: { target: YouTubePlayer }) => {
            // La lecture automatique n'est tolérée que muette : on coupe le son
            // avant de lancer, quitte à le rétablir juste après si l'appelant
            // le demande — le navigateur mettra alors sa propre pause.
            event.target.mute();
            if (stateRef.current.active && stateRef.current.playing) event.target.playVideo();
            setReady(true);
          },
          // 2 = identifiant invalide, 5 = lecture HTML5 impossible,
          // 100 = vidéo introuvable, 101/150 = intégration refusée.
          onError: () => {
            onUnavailableRef.current?.();
          },
          onStateChange: (event: { data: number }) => {
            // 0 = terminée. Avec `loop`, YouTube relance seul ; le rappel sert
            // aux carrousels qui préfèrent enchaîner sur la diapositive suivante.
            if (event.data === 0) onEndedRef.current?.();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
    };
  }, [videoId]);

  /** Lecture, pause et son suivent l'état tenu par le carrousel. */
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;

    if (muted) player.mute();
    else player.unMute();

    if (active && playing) player.playVideo();
    else player.pauseVideo();
  }, [ready, active, playing, muted]);

  /**
   * YouTube ne notifie pas la progression : on l'interroge quatre fois par
   * seconde, et seulement pour la diapositive à l'écran.
   */
  useEffect(() => {
    if (!active || !onTime) return undefined;

    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player || !ready) return;
      onTimeRef.current?.(player.getCurrentTime(), player.getDuration());
    }, 250);

    return () => clearInterval(timer);
  }, [ready, active, onTime]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/*
        Le conteneur est remplacé par l'iframe au montage du lecteur. Il couvre
        le cadre en conservant le ratio 16/9 : la plus grande des deux
        dimensions déborde, aucune bande noire n'apparaît.
      */}
      <div
        ref={mountRef}
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default HeroVideo;
