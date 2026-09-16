import React, { useMemo, useState } from 'react';
import { CalendarDays, Plus, Search, X } from 'lucide-react';
import useEditableResource from '../../hooks/useEditableResource';
import { matches as matchesApi, MatchRecord } from '../../services/site/content.service';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/admin/AdminFeedback';
import ImageField from '../../components/admin/ImageField';
import { MATCH_STATUSES, MATCH_VENUES, MatchStatus, MatchVenue } from '../../types';
import { handleImageError } from '../../lib/imagePlaceholder';

/** Le jour même, au format que `<input type="date">` attend. */
const today = (): string => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  opponent: '',
  date: today(),
  time: '16:00',
  venue: 'Domicile' as MatchVenue,
  competition: 'Ligue 1 Sénégal',
  status: 'À venir' as MatchStatus,
  image: '',
  scoreHome: '',
  scoreAway: '',
};

const formatDate = (value: string): string =>
  new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const STATUS_STYLES: Record<MatchStatus, string> = {
  'À venir': 'bg-club-yellow/20 text-club-yellow',
  'En cours': 'bg-green-500/20 text-green-300',
  Terminé: 'bg-white/10 text-white/60',
};

/**
 * Calendrier des matchs.
 *
 * Alimente la page d'accueil : les rencontres à venir d'un côté, les derniers
 * résultats de l'autre. C'est le contenu qui vieillit le plus vite du site —
 * il était jusqu'ici figé dans le code, et le club annonçait donc des matchs
 * déjà joués.
 *
 * Le score n'apparaît que sur une rencontre terminée. Repasser un match « À
 * venir » efface le sien : un score sur une rencontre qui n'a pas eu lieu est
 * une faute de saisie, et le formulaire ne la laisse pas s'installer.
 *
 * `Domicile` / `Extérieur` dit où le club joue, mais le score suit l'affiche :
 * à l'extérieur, les buts de Cambérène sont ceux de l'équipe visiteuse. C'est
 * la convention des données d'origine, et le formulaire l'affiche en toutes
 * lettres plutôt que de laisser deviner.
 */
const CalendrierAdmin: React.FC = () => {
  const {
    items: matches,
    loading,
    error,
    actionError,
    saving,
    reload,
    create,
    update,
    remove,
  } = useEditableResource<MatchRecord>(matchesApi, { sort: 'date time' });

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return matches.filter((match) => {
      const matchesQuery =
        !needle ||
        match.opponent.toLowerCase().includes(needle) ||
        (match.competition ?? '').toLowerCase().includes(needle) ||
        match.date.includes(needle);
      return matchesQuery && (!statusFilter || match.status === statusFilter);
    });
  }, [matches, query, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: today() });
    setModalOpen(true);
  };

  const openEdit = (match: MatchRecord) => {
    setEditingId(match.id);
    setForm({
      opponent: match.opponent,
      date: match.date,
      time: match.time || '16:00',
      venue: match.venue,
      competition: match.competition ?? '',
      status: match.status,
      image: match.image ?? '',
      scoreHome: match.result ? String(match.result.home) : '',
      scoreAway: match.result ? String(match.result.away) : '',
    });
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    /*
      Le score n'accompagne que les rencontres jouées. `null` plutôt qu'absent :
      une mise à jour partielle ignore un champ manquant, et l'ancien score
      resterait collé au match qu'on vient de remettre « À venir ».
    */
    const hasScore =
      form.status === 'Terminé' && form.scoreHome !== '' && form.scoreAway !== '';

    const payload = {
      opponent: form.opponent,
      date: form.date,
      time: form.time,
      venue: form.venue,
      competition: form.competition,
      status: form.status,
      image: form.image,
      result: hasScore
        ? { home: Number(form.scoreHome), away: Number(form.scoreAway) }
        : null,
    };

    const saved = editingId ? await update(editingId, payload) : await create(payload);
    if (saved) setModalOpen(false);
  };

  const confirmRemoval = async () => {
    if (!confirmDelete) return;
    if (await remove(confirmDelete)) setConfirmDelete(null);
  };

  const field =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-club-yellow outline-none';

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
            <CalendarDays size={20} className="text-club-yellow" />
            Calendrier
          </h2>
          <p className="text-sm text-white/60">Matchs et résultats ({filtered.length})</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <label htmlFor="match-search" className="sr-only">Rechercher un match</label>
            <input
              id="match-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Adversaire, compétition…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none focus:border-club-yellow"
            />
          </div>
          <label htmlFor="match-status" className="sr-only">Filtrer par état</label>
          <select
            id="match-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-club-yellow"
          >
            <option value="">Tous les matchs</option>
            {MATCH_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-graphite">{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-full bg-club-yellow px-5 py-2.5 text-xs font-semibold text-black shadow hover:shadow-lg"
          >
            <Plus size={14} /> Nouveau match
          </button>
        </div>
      </div>

      <AdminError error={error ?? actionError} onRetry={reload} />

      {loading ? (
        <AdminLoading label="Chargement du calendrier…" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-4 py-3 text-left">Affiche</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Adversaire</th>
                <th className="px-4 py-3 text-left">Lieu</th>
                <th className="px-4 py-3 text-left">Compétition</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">État</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {filtered.map((match) => (
                <tr key={match.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    {match.image ? (
                      <img
                        src={match.image}
                        alt=""
                        onError={handleImageError}
                        className="h-10 w-16 rounded-lg border border-white/10 object-cover"
                      />
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-white">{formatDate(match.date)}</p>
                    <p className="text-[11px] text-white/40">{match.time}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{match.opponent}</td>
                  <td className="px-4 py-3 text-xs">{match.venue}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{match.competition}</td>
                  <td className="px-4 py-3">
                    {match.result ? (
                      <span className="font-mono font-semibold text-club-yellow">
                        {match.result.home} – {match.result.away}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${STATUS_STYLES[match.status]}`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(match)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                    >
                      Éditer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(match.id)}
                      className="rounded-full bg-red-500/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/40"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminEmpty
                      label={
                        matches.length === 0
                          ? 'Aucun match en base — l’accueil affiche le calendrier d’origine'
                          : 'Aucun match ne correspond à la recherche'
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-graphite/90 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="mb-4 text-lg font-semibold text-white">
              {editingId ? 'Modifier le match' : 'Nouveau match'}
            </h3>

            <form onSubmit={submit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="match-opponent" className="mb-1 block text-white/60">Adversaire</label>
                <input
                  id="match-opponent"
                  required
                  value={form.opponent}
                  onChange={(event) => setForm((f) => ({ ...f, opponent: event.target.value }))}
                  placeholder="ASC Jaraaf"
                  className={field}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="match-date" className="mb-1 block text-white/60">Date</label>
                  <input
                    id="match-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => setForm((f) => ({ ...f, date: event.target.value }))}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="match-time" className="mb-1 block text-white/60">Coup d’envoi</label>
                  <input
                    id="match-time"
                    type="time"
                    required
                    value={form.time}
                    onChange={(event) => setForm((f) => ({ ...f, time: event.target.value }))}
                    className={field}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="match-venue" className="mb-1 block text-white/60">Lieu</label>
                  <select
                    id="match-venue"
                    value={form.venue}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, venue: event.target.value as MatchVenue }))
                    }
                    className={field}
                  >
                    {MATCH_VENUES.map((venue) => (
                      <option key={venue} value={venue} className="bg-graphite">{venue}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="match-status-input" className="mb-1 block text-white/60">État</label>
                  <select
                    id="match-status-input"
                    value={form.status}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, status: event.target.value as MatchStatus }))
                    }
                    className={field}
                  >
                    {MATCH_STATUSES.map((status) => (
                      <option key={status} value={status} className="bg-graphite">{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="match-competition" className="mb-1 block text-white/60">Compétition</label>
                <input
                  id="match-competition"
                  value={form.competition}
                  onChange={(event) => setForm((f) => ({ ...f, competition: event.target.value }))}
                  placeholder="Ligue 1 Sénégal"
                  className={field}
                />
              </div>

              <ImageField
                value={form.image}
                onChange={(value) => setForm((f) => ({ ...f, image: value }))}
                label="Affiche du match"
              />

              {/* Le score n'a de sens qu'une fois la rencontre jouée. */}
              {form.status === 'Terminé' && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-3 text-white/60">
                    Score —{' '}
                    <span className="text-white/40">
                      {form.venue === 'Domicile'
                        ? 'Cambérène reçoit : ses buts sont ceux de l’équipe à domicile'
                        : 'Cambérène se déplace : ses buts sont ceux de l’équipe visiteuse'}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="match-score-home" className="mb-1 block text-white/60">
                        Domicile
                      </label>
                      <input
                        id="match-score-home"
                        type="number"
                        min={0}
                        max={99}
                        value={form.scoreHome}
                        onChange={(event) => setForm((f) => ({ ...f, scoreHome: event.target.value }))}
                        className={field}
                      />
                    </div>
                    <div>
                      <label htmlFor="match-score-away" className="mb-1 block text-white/60">
                        Extérieur
                      </label>
                      <input
                        id="match-score-away"
                        type="number"
                        min={0}
                        max={99}
                        value={form.scoreAway}
                        onChange={(event) => setForm((f) => ({ ...f, scoreAway: event.target.value }))}
                        className={field}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    Laisser vide tant que le score n’est pas connu.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full bg-white/5 px-4 py-2 text-white/70 hover:bg-white/10"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-club-yellow px-5 py-2 font-semibold text-black disabled:opacity-60"
                >
                  {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-graphite/90 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h4 className="mb-2 text-sm font-semibold text-white">Supprimer le match</h4>
            <p className="mb-4 text-xs text-white/60">
              Confirmez-vous la suppression ? Cette action est définitive.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                disabled={saving}
                className="rounded-full bg-red-500/30 px-4 py-1.5 text-xs text-red-200 hover:bg-red-500/40 disabled:opacity-60"
              >
                {saving ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendrierAdmin;
