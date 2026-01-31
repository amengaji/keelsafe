// mobile/src/types/permitTypes.ts

export type PermitStatus = 'Draft' | 'Pending' | 'Active' | 'Suspended' | 'JobComplete' | 'Closed' | 'Expired';

export type WorkType = 'hot_work' | 'enclosed_space' | 'working_aloft' | 'electrical' | 'diving' | 'general';

export type UserRole = 'Master' | 'ChiefOfficer' | 'Pumpman' | 'Bosun' | 'Crew' | 'ShoreAdmin'| 'Issuing Authority';

export interface CrewMember {
    id: string;
    name: string;
    rank: string;
    role: UserRole;
    pin: string;
    avatarInitials: string;
}

export interface GasEntry {
  id: string;
  name: string;
  tlv: string;
  unit: string;
  top: string;
  mid: string;
  bot: string;
  isCustom: boolean;
}

export interface GasLog {
  id: string;
  timestamp: Date;
  performedBy: string;
  readings: GasEntry[];
  isSafe: boolean;
  notes?: string;
}

export interface IsolationPoint {
  id: string;
  tagNumber: string;
  equipment: string;
  location: string;
  method: string;
  status: 'Isolated' | 'De-Isolated';
  isolatedBy: string;
  isolatedAt: Date;
}

export interface Signature {
  role: string;
  name: string;
  signedAt: Date;
  digitalHash: string;
}

export interface EntryLog {
  id: string;
  timestamp: Date;
  name: string;
  direction: 'IN' | 'OUT';
}

export interface SafetyCheckLog {
  id: string;
  timestamp: Date;
  checkedBy: string;
  notes?: string;
}

export interface Permit {
  id: string;
  permitId: string;
  status: PermitStatus;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  version: number;

  location: string;
  description: string;
  workTypes: WorkType[];
  
  validFrom: Date;
  expiresAt: Date;
  checkFrequency: number;

  personnelCount: number;
  
  // ROLES
  attendant?: string;       // Enclosed Space Standby
  fireWatch?: string;       // Hot Work Fire Watch (NEW)
  rescueTeam?: string[];    // Enclosed Space Rescue
  fireFightingTeam?: string[]; // Hot Work Fire Squad (NEW)

  lastCheckAt?: Date;
  safetyCheckLogs: SafetyCheckLog[];
  
  gasConfig: GasEntry[];
  gasLogs: GasLog[];
  entryLogs: EntryLog[]; 
  isolations: IsolationPoint[];
  signatures: Signature[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  PermitWizard: undefined;
  ActivePermit: { permitId: string };
};

export type BottomTabParamList = {
  DashboardTab: undefined;
  MonitorTab: undefined;
};