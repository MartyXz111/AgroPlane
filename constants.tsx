
import React from 'react';
import { Season, SeasonInfo } from './types';

export const SEASONS_DATA: SeasonInfo[] = [
  {
    name: Season.SPRING,
    icon: '🌱',
    summary: 'Sezonul renașterii. Momentul ideal pentru semănatul legumelor timpurii și pregătirea intensă a solului.',
    keyActivities: ['Pregătirea patului germinativ', 'Semănat mazăre și spanac', 'Plantare pomi fructiferi', 'Fertilizare inițială']
  },
  {
    name: Season.SUMMER,
    icon: '☀️',
    summary: 'Perioada de creștere maximă și întreținere. Irigarea corectă este vitală pentru supraviețuirea culturilor.',
    keyActivities: ['Irigare controlată', 'Combaterea dăunătorilor', 'Prășit', 'Recoltarea cerealelor de toamnă']
  },
  {
    name: Season.AUTUMN,
    icon: '🍂',
    summary: 'Sezonul recoltei și al pregătirii pentru iarnă. Se adună roadele și se însămânțează culturile de toamnă.',
    keyActivities: ['Recoltare fructe și legume', 'Arături de toamnă', 'Semănat grâu și orz', 'Depozitarea recoltei']
  },
  {
    name: Season.WINTER,
    icon: '❄️',
    summary: 'Timpul pentru planificare și mentenanță. Solul se odihnește, iar utilajele sunt revizuite.',
    keyActivities: ['Verificarea depozitelor', 'Mentenanță utilaje', 'Planificarea rotației culturilor', 'Achiziție semințe']
  }
];
