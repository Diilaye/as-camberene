import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { players as staticPlayers } from '../data/players';
import { getClubRoster } from '../services/fconnect/members.service';
import { fromStaticPlayers, toPlayers, ApiPlayer } from '../adapters';
import useApiResource from '../hooks/useApiResource';
import { isFconnectConfigured } from '../config/env';
import PageHero from '../components/ui/PageHero';
import PlayerCard from '../components/ui/PlayerCard';
import teamHero from '../../assets/img/asc-camberene-equipe-2025.webp';

const POSITIONS = ['Tous', 'Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Ailier'];

/**
 * Effectif, tel que le club le tient dans fconnect.
 *
 * Même source que l'écran « Effectif » de l'administration : deux listes
 * alimentées différemment finiraient par se contredire.
 */
const Players: React.FC = () => {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('Tous');

  const { data: players } = useApiResource<ApiPlayer[]>(
    (signal) => getClubRoster({}, signal).then(toPlayers),
    fromStaticPlayers(staticPlayers),
    { enabled: isFconnectConfigured() }
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return players.filter((player) => {
      // La nationalité n'est pas publiée par fconnect : la recherche porte alors
      // sur le seul nom, sans se plaindre d'un champ vide.
      const matchesSearch =
        !needle ||
        player.name.toLowerCase().includes(needle) ||
        (player.nationality ?? '').toLowerCase().includes(needle);
      const matchesPosition = position === 'Tous' || player.position === position;
      return matchesSearch && matchesPosition;
    });
  }, [players, position, search]);

  return (
    <div className="bg-graphite">
      <PageHero
        kicker="Saison 2025"
        title="Effectif"
        description="Les joueuses et joueurs qui portent les couleurs de l'ASC Cambérène."
        image={teamHero}
      />

      {/* Filtres */}
      <section className="border-b border-white/10 bg-charcoal">
        <div className="site-container flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPosition(item)}
                className={`rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  position === item
                    ? 'bg-club-yellow text-black'
                    : 'bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <label htmlFor="player-search" className="sr-only">Rechercher un joueur</label>
            <input
              id="player-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un joueur"
              className="field pl-11"
            />
          </div>
        </div>
      </section>

      {/* Grille de l'effectif */}
      <section className="band-green py-12">
        <div className="site-container">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((player) => (
                <PlayerCard
                  key={String(player.id)}
                  to={`/players/${player.id}`}
                  photo={player.photo}
                  name={player.name}
                  position={player.position}
                  number={player.number}
                  meta={[player.nationality, player.age ? `${player.age} ans` : null]
                    .filter(Boolean)
                    .join(' · ')}
                />
              ))}
            </div>
          ) : (
            <div className="panel p-12 text-center">
              <h2 className="text-xl font-extrabold uppercase text-white">Aucun joueur trouvé</h2>
              <p className="mt-2 text-sm text-white/60">Modifiez le poste ou vos termes de recherche.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Players;
