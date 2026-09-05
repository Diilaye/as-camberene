import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Target, Trophy, Users } from 'lucide-react';
import { players } from '../data/players';

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const player = players.find((entry) => String(entry.id) === String(id));

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-graphite px-4">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-extrabold uppercase text-white">Joueur introuvable</h1>
          <Link to="/players" className="btn-yellow">Retour à l'effectif</Link>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'Matchs joués', value: player.stats.matches },
    { icon: Target, label: 'Buts marqués', value: player.stats.goals },
    { icon: Trophy, label: 'Passes décisives', value: player.stats.assists },
  ];

  const facts = [
    { icon: MapPin, label: 'Nationalité', value: player.nationality },
    { icon: Calendar, label: 'Âge', value: `${player.age} ans` },
    { icon: Trophy, label: 'Au club depuis', value: String(player.joinedYear) },
    { icon: Users, label: 'Numéro', value: `#${player.number}` },
  ];

  return (
    <div className="bg-graphite">
      {/* Fiche : portrait à gauche, identité à droite sur la bande du club */}
      <section className="band-green">
        <div className="site-container pb-12 pt-28">
          <Link
            to="/players"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase text-white/70 transition-colors hover:text-club-yellow"
          >
            <ArrowLeft size={16} />
            Retour à l'effectif
          </Link>

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
            <div className="relative overflow-hidden rounded-[20px] border border-white/10">
              <img src={player.photo} alt={player.name} className="aspect-[3/4] w-full object-cover object-top" />
              <span className="absolute bottom-2 right-4 text-8xl font-extrabold leading-none text-white/25">
                {player.number}
              </span>
            </div>

            <div>
              <p className="text-xl font-bold uppercase text-club-yellow md:text-2xl">{player.position}</p>
              <h1 className="mt-1 text-4xl font-extrabold uppercase text-white md:text-6xl">{player.name}</h1>

              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/50">
                      <Icon size={13} className="text-club-yellow" />
                      {label}
                    </p>
                    <p className="mt-1 font-extrabold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques de la saison */}
      <section className="band-charcoal py-12">
        <div className="site-container grid gap-5 md:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="panel p-6 text-center">
              <Icon size={22} className="mx-auto text-club-yellow" />
              <p className="mt-3 text-4xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Biographie */}
      <section className="band-graphite py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-5 text-2xl font-extrabold uppercase text-white">Biographie</h2>
          <p className="leading-relaxed text-white/75">{player.biography}</p>
        </div>
      </section>
    </div>
  );
};

export default PlayerDetail;
