import React from 'react';
import { Link } from 'react-router-dom';
import { handleImageError } from '../../lib/imagePlaceholder';

interface ArticleCardProps {
  to: string;
  image: string;
  imagePosition?: string;
  kicker: string;
  title: string;
  date?: string;
  note?: string;
  wide?: boolean;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

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
