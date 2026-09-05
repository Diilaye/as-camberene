import React from 'react';
import TeamRosterView from '../components/TeamRosterView';

/** Route dédiée à la catégorie ; toute la mise en page vit dans la vue partagée. */
const EquipeU15: React.FC = () => <TeamRosterView teamId="equipe-u15" />;

export default EquipeU15;
