import React from 'react';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../lib/imagePlaceholder';

interface ArticleCardProps {
  to: string;
  image: string;
  /** Point à garder visible au recadrage (`object-position`). */
  imagePosition?: string;
  /** Surtitre en capitales jaunes : rubrique, compétition, catégorie. */
  kicker: string;
  title: string;
  /** Date ISO, mise en forme en français à l'affichage. */
  date?: string;
  /** Mention poussée à droite de la date : temps de lecture, prix, statut. */
  note?: string;
  /** Format paysage, celui que le modèle donne à une carte sur trois. */
  wide?: boolean;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Carte éditoriale portrait, gabarit unique de tout le site.
 *
 * Image en haut, bloc de texte de hauteur fixe en bas, séparés par un filet
 * dégradé. Une carte sur trois passe en paysage pour casser la régularité du
 * rail — c'est le rôle de `wide`, que les rubriques appliquent au rang 3n.
 */
const ArticleCard: React.FC<ArticleCardProps> = ({ to, image, imagePosition, kicker, title, date, note, wide }) => (
  <Link to={to} className={`card-portrait group ${wide ? 'card-portrait--wide' : ''}`}>
    <div className="card-portrait__media">
      <img src={image} alt="" loading="lazy" onError={handleImageError} style={imagePosition ? { objectPosition: imagePosition } : undefined} />
    </div>
    <div className="card-portrait__body">
      <span className="card-portrait__kicker">{kicker}</span>
      <h3 className="card-portrait__title">{title}</h3>
      <div className="card-portrait__meta">
        {date && <span>{formatDate(date)}</span>}
        {note && <span className="font-bold italic uppercase text-club-yellow">{note}</span>}
      </div>
    </div>
  </Link>
);

export default ArticleCard;
