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
}

// 1. Define what screens are inside the Bottom Tabs
export type BottomTabParamList = {
  DashboardTab: undefined;
  MonitorTab: { permitId: string };
};

// 2. Define the Main Stack (which contains the Tabs AND the full-screen Wizard)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>; // <--- This connects Tabs to Stack
  Dashboard: undefined; 
  PermitWizard: undefined;
  ActivePermit: { permitId: string };
};