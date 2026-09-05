import React from 'react';
import { useParams } from 'react-router-dom';
import TeamRosterView from '../components/TeamRosterView';

/** Accès générique à une équipe par son identifiant, via `/teams/:teamId`. */
const TeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  return <TeamRosterView teamId={teamId ?? ''} />;
};

export default TeamDetail;
