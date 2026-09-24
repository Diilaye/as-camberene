/**
 * Buts et passes décisives d'un match, reportés sur les fiches joueurs.
 *
 * La feuille de match fait foi : un but saisi sur un joueur de l'effectif lui
 * compte un but, une passe décisive une passe. Le report se fait par écart —
 * ce que le match apporte maintenant, moins ce qu'il apportait avant — si bien
 * que corriger une feuille (un buteur oublié, un passeur remplacé) ou supprimer
 * le match rectifie les compteurs sans jamais compter deux fois.
 *
 * Les compteurs restent modifiables à la main dans l'onglet « Statistiques » :
 * le report ajoute et retire, il n'écrase pas. Un compteur ne descend jamais
 * sous zéro, même si la saisie manuelle a été plus basse que les matchs.
 */

import mongoose from 'mongoose';
import Player from '../models/Player.model';

interface ScorerLike {
  player?: mongoose.Types.ObjectId | string | null;
  side?: string;
  assistPlayer?: mongoose.Types.ObjectId | string | null;
}

interface MatchLike {
  status?: string;
  scorers?: ScorerLike[];
}

type Tally = Map<string, { goals: number; assists: number }>;

/** Ce qu'une rencontre compte à chaque joueur. Rien tant qu'elle n'est pas jouée. */
export const tallyOf = (match: MatchLike | null | undefined): Tally => {
  const tally: Tally = new Map();
  if (!match || match.status !== 'Terminé') return tally;

  const add = (id: ScorerLike['player'], key: 'goals' | 'assists') => {
    if (!id) return;
    const entry = tally.get(String(id)) ?? { goals: 0, assists: 0 };
    entry[key] += 1;
    tally.set(String(id), entry);
  };

  (match.scorers ?? []).forEach((scorer) => {
    if (scorer.side !== 'club') return;
    add(scorer.player, 'goals');
    add(scorer.assistPlayer, 'assists');
  });
  return tally;
};

const increment = (field: string, delta: number) => ({
  $max: [0, { $add: [{ $ifNull: [`$${field}`, 0] }, delta] }],
});

/** Reporte sur les fiches l'écart entre l'ancienne et la nouvelle feuille. */
export const syncMatchStats = async (before: MatchLike | null, after: MatchLike | null): Promise<void> => {
  const old = tallyOf(before);
  const next = tallyOf(after);
  const ids = new Set([...old.keys(), ...next.keys()]);

  await Promise.all(
    [...ids].map((id) => {
      const goals = (next.get(id)?.goals ?? 0) - (old.get(id)?.goals ?? 0);
      const assists = (next.get(id)?.assists ?? 0) - (old.get(id)?.assists ?? 0);
      if (goals === 0 && assists === 0) return null;
      if (!mongoose.isValidObjectId(id)) return null;
      // Pipeline de mise à jour : le plancher à zéro se calcule côté base, en
      // une seule opération, sans lire la fiche d'abord.
      return Player.updateOne({ _id: id }, [
        {
          $set: {
            'stats.goals': increment('stats.goals', goals),
            'stats.assists': increment('stats.assists', assists),
          },
        },
      ]);
    })
  );
};
