import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Permission, ROLE_LABELS, isStaffRole } from '../lib/roles';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  /**
   * Droit exigé pour voir l'écran.
   *
   * Sans lui, la garde se contente d'exiger un compte de l'administration —
   * c'est le cas du tableau de bord, qui s'adapte ensuite au profil.
   */
  permission?: Permission;
}

/**
 * Garde de navigation.
 *
 * Elle ne protège que l'affichage : c'est le serveur qui refuse les écritures
 * d'un compte sans droits, et lui seul fait autorité. Contourner cette garde
 * dans le navigateur ne donne accès qu'à des écrans vides et à des 403.
 *
 * Un compte connecté mais sans le droit demandé ne repart pas à l'accueil : on
 * lui dit lequel lui manque. Une redirection silencieuse ressemble à une panne.
 *
 * L'ancienne version relisait le rôle depuis localStorage pour éviter un
 * clignotement : cette valeur se modifiait depuis la console du navigateur.
 * On attend désormais la réponse du serveur.
 */
const ProtectedRoute: React.FC<Props> = ({ children, permission }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-graphite flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // `state` conserve la page demandée : après connexion, on y revient plutôt
  // que de retomber sur l'accueil.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  // Un supporter n'a rien à faire dans l'administration : retour à la vitrine.
  if (!isStaffRole(user.role)) return <Navigate to="/" replace />;

  if (permission && !user.permissions.includes(permission)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-graphite px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold uppercase text-white">Rubrique non autorisée</h1>
          <p className="mt-3 text-sm text-white/60">
            Votre profil ({ROLE_LABELS[user.role]}) n'a pas accès à cette partie de
            l'administration. Demandez le droit au super administrateur du club.
          </p>
          <Link to="/admin" className="btn-yellow mt-8">Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
