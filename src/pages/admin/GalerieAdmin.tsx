import React, { useMemo, useState } from 'react';
import { Images, Plus, Search, X } from 'lucide-react';
import useEditableResource from '../../hooks/useEditableResource';
import { gallery as galleryApi, GalleryItemRecord } from '../../services/site/content.service';
import { useMatches } from '../../hooks/useContent';
import { AdminEmpty, AdminError, AdminLoading } from '../../components/admin/AdminFeedback';
import ImageField from '../../components/admin/ImageField';
import { handleImageError } from '../../lib/imagePlaceholder';
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS, GalleryCategory } from '../../types';

const EMPTY_FORM = {
  image: '',
  title: '',
  description: '',
  category: 'match' as GalleryCategory,
  match: '',
  date: '',
};

const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';


const GalerieAdmin: React.FC = () => {
  const {
    items: photos,
    loading,
    error,
    actionError,
    saving,
    reload,
    create,
    update,
    remove,
  } = useEditableResource<GalleryItemRecord>(galleryApi);

  const { data: matches } = useMatches();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

 
  const matchOptions = useMemo(
    () => [...matches].sort((a, b) => b.date.localeCompare(a.date)),
    [matches]
  );

  const matchLabel = (id?: string | null) => {
    const match = matchOptions.find((entry) => String(entry.id) === String(id));
    if (!match) return null;
    const affiche =
      match.venue === 'Domicile'
        ? `ASC Cambérène — ${match.opponent}`
        : `${match.opponent} — ASC Cambérène`;
    return `${affiche} · ${formatDate(match.date)}`;
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return photos.filter((photo) => {
      const matchesQuery =
        !needle ||
        photo.title.toLowerCase().includes(needle) ||
        (photo.description ?? '').toLowerCase().includes(needle);
      return matchesQuery && (!categoryFilter || photo.category === categoryFilter);
    });
  }, [photos, query, categoryFilter]);

  const countByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    photos.forEach((photo) => counts.set(photo.category, (counts.get(photo.category) ?? 0) + 1));
    return counts;
  }, [photos]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (photo: GalleryItemRecord) => {
    setEditingId(photo.id);
    setForm({
      image: photo.image ?? '',
      title: photo.title,
      description: photo.description ?? '',
      category: photo.category,
      match: photo.match ?? '',
      date: photo.date ?? '',
    });
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      image: form.image,
      title: form.title,
      description: form.description,
      category: form.category,
     
     
      match: form.category === 'match' && form.match ? form.match : null,
      date: form.date,
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
            <Images size={20} className="text-club-yellow" />
            Galerie
          </h2>
          <p className="text-sm text-white/60">Photos du club ({filtered.length})</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <label htmlFor="gallery-search" className="sr-only">Rechercher une photo</label>
            <input
              id="gallery-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Titre, description…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none focus:border-club-yellow"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-full bg-club-yellow px-5 py-2.5 text-xs font-semibold text-black shadow hover:shadow-lg"
          >
            <Plus size={14} /> Ajouter une photo
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('')}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            categoryFilter === '' ? 'bg-club-yellow text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          Toutes ({photos.length})
        </button>
        {GALLERY_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategoryFilter(category)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              categoryFilter === category
                ? 'bg-club-yellow text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {GALLERY_CATEGORY_LABELS[category]} ({countByCategory.get(category) ?? 0})
          </button>
        ))}
      </div>

      <AdminError error={error ?? actionError} onRetry={reload} />

      {loading ? (
        <AdminLoading label="Chargement de la galerie…" />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          label={photos.length === 0 ? 'Aucune photo en base' : 'Aucune photo ne correspond'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl"
            >
              <img
                src={photo.image}
                alt=""
                onError={handleImageError}
                className="h-40 w-full object-cover"
              />
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 font-medium text-white">{photo.title}</p>
                  <span className="shrink-0 rounded-full bg-club-yellow/20 px-2 py-1 text-[10px] font-semibold text-club-yellow">
                    {GALLERY_CATEGORY_LABELS[photo.category]}
                  </span>
                </div>
                {photo.description && (
                  <p className="line-clamp-2 text-xs text-white/50">{photo.description}</p>
                )}
                <p className="text-[11px] text-white/40">
                  {matchLabel(photo.match) ?? formatDate(photo.date) ?? ''}
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEdit(photo)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                  >
                    Éditer
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(photo.id)}
                    className="rounded-full bg-red-500/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/40"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              {editingId ? 'Modifier la photo' : 'Ajouter une photo'}
            </h3>

            <form onSubmit={submit} className="space-y-4 text-xs">
              <ImageField
                value={form.image}
                onChange={(value) => setForm((f) => ({ ...f, image: value }))}
                label="Photo"
              />

              <div>
                <label htmlFor="gallery-title" className="mb-1 block text-white/60">Titre</label>
                <input
                  id="gallery-title"
                  required
                  value={form.title}
                  onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
                  placeholder="Le but de la victoire"
                  className={field}
                />
              </div>

              <textarea
                value={form.description}
                onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
                placeholder="Légende de la photo"
                rows={3}
                className={`${field} resize-none`}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="gallery-category" className="mb-1 block text-white/60">Onglet</label>
                  <select
                    id="gallery-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, category: event.target.value as GalleryCategory }))
                    }
                    className={field}
                  >
                    {GALLERY_CATEGORIES.map((category) => (
                      <option key={category} value={category} className="bg-graphite">
                        {GALLERY_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="gallery-date" className="mb-1 block text-white/60">
                    Date <span className="text-white/30">— facultatif</span>
                  </label>
                  <input
                    id="gallery-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((f) => ({ ...f, date: event.target.value }))}
                    className={field}
                  />
                </div>
              </div>

              {/* Le rattachement n'a de sens que pour une photo de match. */}
              {form.category === 'match' && (
                <div>
                  <label htmlFor="gallery-match" className="mb-1 block text-white/60">
                    Rencontre <span className="text-white/30">— regroupe les photos en album</span>
                  </label>
                  <select
                    id="gallery-match"
                    value={form.match}
                    onChange={(event) => setForm((f) => ({ ...f, match: event.target.value }))}
                    className={field}
                  >
                    <option value="" className="bg-graphite">Aucune rencontre</option>
                    {matchOptions.map((match) => (
                      <option key={String(match.id)} value={String(match.id)} className="bg-graphite">
                        {match.venue === 'Domicile'
                          ? `ASC Cambérène — ${match.opponent}`
                          : `${match.opponent} — ASC Cambérène`}{' '}
                        · {formatDate(match.date)}
                      </option>
                    ))}
                  </select>
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
                  {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-graphite/90 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-6">
            <h4 className="mb-2 text-sm font-semibold text-white">Supprimer la photo</h4>
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

export default GalerieAdmin;
