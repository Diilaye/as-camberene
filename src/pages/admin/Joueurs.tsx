import React, { useMemo, useState } from 'react';
import { ExternalLink, Info, Search } from 'lucide-react';
import { getClubRoster } from '../../services/fconnect/members.service';
import { fromStaticPlayers, toPlayers, ApiPlayer } from '../../adapters';
import { players as staticPlayers } from '../../data/players';
import useApiResource from '../../hooks/useApiResource';
import { isFconnectConfigured } from '../../config/env';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/admin/AdminFeedback';

/**
 * Effectif — consultation.
 *
 * L'effectif appartient à fconnect : c'est là que le club inscrit ses membres,
 * leur donne un numéro, les rattache à une équipe. Le site le lit et l'affiche,
 * il ne l'écrit pas — deux endroits où modifier le même joueur finiraient par
 * se contredire, et c'est fconnect qui fait foi.
 *
 * L'administration du site reste donc éditoriale : actualités et boutique s'y
 * modifient, l'effectif s'y consulte.
 */
const Joueurs: React.FC = () => {
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const { data: players, loading, error, reload, source } = useApiResource<ApiPlayer[]>(
    (signal) => getClubRoster({}, signal).then(toPlayers),
    // Repli : l'effectif écrit en dur, du temps où le site n'avait pas de source.
    fromStaticPlayers(staticPlayers),
    { enabled: isFconnectConfigured() }
  );

  const positions = useMemo(
    () => Array.from(new Set(players.map((p) => p.position))).sort(),
    [players]
  );

  const filtered = useMemo(
    () =>
      players.filter((p) => {
        const q = query.toLowerCase();
        const okQ =
          !q ||
          p.name.toLowerCase().includes(q) ||
          String(p.number).includes(q) ||
          p.position.toLowerCase().includes(q);
        const okPos = !positionFilter || p.position === positionFilter;
        return okQ && okPos;
      }),
    [players, query, positionFilter]
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Effectif</h2>
          <p className="text-sm text-white/60">Lecture seule ({filtered.length})</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Recherche joueur..." className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-club-yellow" />
          </div>
          <select value={positionFilter} onChange={e=>setPositionFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white focus:outline-none focus:border-club-yellow">
            <option value="">Tous postes</option>
            {positions.map(p=> <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-club-yellow/20 bg-club-yellow/5 px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0 text-club-yellow" />
        <div className="text-xs text-white/70">
          <p className="font-semibold text-white">L’effectif se gère dans fconnect</p>
          <p className="mt-1 text-white/60">
            Inscrire un joueur, changer son numéro ou son équipe se fait depuis le tableau de bord
            fconnect du club. Le site affiche ce qui y est saisi.
            {source === 'fallback' && !isFconnectConfigured() && (
              <> Aucun club n’est encore relié : <code>VITE_CLUB_ID</code> est vide, la liste
              ci-dessous vient des données de démonstration.</>
            )}
          </p>
        </div>
        <a
          href="https://fconnect.sn"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white hover:bg-white/20"
        >
          fconnect <ExternalLink size={12} />
        </a>
      </div>

      <AdminError error={error} onRetry={reload} />

      {loading ? (
        <AdminLoading label="Chargement de l’effectif…" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <table className="min-w-full text-sm">
            <thead className="text-white/60 uppercase tracking-wide text-xs">
              <tr>
                <th className="py-3 px-4 text-left">Joueur</th>
                <th className="py-3 px-4 text-left">Poste</th>
                <th className="py-3 px-4 text-left">Âge</th>
                <th className="py-3 px-4 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/85">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-white/40">#{p.number || '—'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{p.position}</td>
                  <td className="py-3 px-4">{p.age || '—'}</td>
                  <td className="py-3 px-4 text-xs capitalize">{p.status ?? '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-0">
                    <AdminEmpty label={players.length === 0 ? 'Aucun joueur dans fconnect' : 'Aucun joueur ne correspond à la recherche'} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Joueurs;
