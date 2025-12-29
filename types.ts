
export enum Season {
  SPRING = 'Primăvară',
  SUMMER = 'Vară',
  AUTUMN = 'Toamnă',
  WINTER = 'Iarnă'
}

export type SoilType = 'Lutos' | 'Nisipos' | 'Argilos' | 'Calcaros' | 'Turbos';

export interface UserCrop {
  id: string;
  name: string;
  variety: string;
  plantedDate: string;
  soilType: SoilType;
  soilPH?: number;
  soilTexture?: string;
  area: number; // in square meters
  tasks: PlannedTask[];
  status: 'active' | 'harvested' | 'failed';
  lat?: number;
  lng?: number;
}

export interface PlannedTask {
  id: string;
  title: string;
  dueDate: string;
  category: 'irigare' | 'fertilizare' | 'tratamente' | 'recoltare';
  completed: boolean;
  notes?: string;
}

export interface AgriculturalTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'plantare' | 'întreținere' | 'recoltare' | 'pregătire';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface SeasonInfo {
  name: Season;
  icon: string;
  summary: string;
  keyActivities: string[];
}
