import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  /** Lien « tout voir », poussé à droite du titre. */
  linkLabel?: string;
  linkTo?: string;
  className?: string;
}

/**
 * En-tête de rubrique : titre capitalisé à gauche, lien de rubrique à droite.
 * C'est le seul gabarit de titre du modèle, réutilisé par toutes les bandes.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkLabel, linkTo, className = '' }) => (
  <header className={`flex items-center justify-between gap-4 ${className}`}>
    <h2 className="section-title">{title}</h2>
    {linkLabel && linkTo && (
      <Link to={linkTo} className="section-link">
        {linkLabel}
        <ArrowRight size={18} className="text-club-yellow" />
      </Link>
    )}
  </header>
);

export default SectionHeader;
