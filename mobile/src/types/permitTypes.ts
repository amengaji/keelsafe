// mobile/src/types/permitTypes.ts

import { NavigatorScreenParams } from '@react-navigation/native';

export type PermitStatus = 'Active' | 'Completed' | 'Suspended' | 'Cancelled';

export type WorkType = 
  | 'hot_work' 
  | 'enclosed_space' 
  | 'working_aloft' 
  | 'electrical' 
  | 'underwater' 
  | 'general';

export type GasEntry = {
    id: string;
    name: string;
    tlv: string;
    unit: string;
    top: string;
    mid: string;
    bot: string;
    isCustom: boolean;
};

export interface Permit {
  id: string;
  permitId: string;
  status: PermitStatus;
  location: string;
  workTypes: WorkType[];
  description: string;
  checkFrequency: number;
  createdAt: Date;
  expiresAt: Date;
  personnelCount: number;
  
  // New: Crew Roles
  attendant?: string; // Standby Man
  rescueTeam?: string[]; // List of names
  
  // New: Gas Config Snapshot
  gasConfig: GasEntry[];
}

export type BottomTabParamList = {
  DashboardTab: undefined;
  MonitorTab: { permitId: string };
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Dashboard: undefined;
  PermitWizard: undefined;
  ActivePermit: { permitId: string };
};