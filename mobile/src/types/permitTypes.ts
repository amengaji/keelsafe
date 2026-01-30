// mobile/src/types/permitTypes.ts

// --- ENUMS & UNIONS (The Fixed Rules) ---

export type PermitStatus = 
  | 'Draft'       // Created, not yet active
  | 'Pending'     // Waiting for Master/Shore approval
  | 'Active'      // Live, work is happening
  | 'Suspended'   // Paused (e.g., alarm triggered, shift change)
  | 'Closed'      // Work finished, signed off
  | 'Expired';    // Time limit reached automatically

export type WorkType = 
  | 'hot_work' 
  | 'enclosed_space' 
  | 'working_aloft' 
  | 'electrical' 
  | 'diving' 
  | 'general';

export type UserRole = 'Master' | 'ChiefOfficer' | 'Pumpman' | 'Bosun' | 'Crew' | 'ShoreAdmin';

// --- SUB-OBJECTS (The Modules) ---

// 1. Who is involved?
export interface CrewMember {
  id: string;      // UUID
  name: string;
  role: UserRole;
  pinHash?: string; // Stored locally only
}

// 2. The Atmosphere (Critical Safety)
export interface GasEntry {
  id: string;      // e.g. 'o2', 'h2s'
  name: string;
  tlv: string;     // Threshold Limit Value
  unit: '%' | 'ppm';
  top: string;
  mid: string;
  bot: string;
  isCustom: boolean;
}

export interface GasLog {
  id: string;           // UUID
  timestamp: Date;
  performedBy: string;  // User Name/ID
  readings: GasEntry[]; // Snapshot of readings at that time
  isSafe: boolean;
  notes?: string;
}

// 3. Lock Out Tag Out (Isolation)
export interface IsolationPoint {
  id: string;
  tagNumber: string;
  equipment: string;
  location: string;
  method: 'Lock' | 'Tag' | 'Disconnect';
  status: 'Isolated' | 'De-Isolated';
  isolatedBy: string;   // User ID
  isolatedAt: Date;
}

// 4. The Signatures (Audit Trail)
export interface Signature {
  role: string;         // e.g. "Issuing Authority", "Performing Authority"
  name: string;         // "Capt. Hook"
  signedAt: Date;
  digitalHash: string;  // The cryptographic proof (PIN + Timestamp hash)
  scribbleUrl?: string; // The "pretty" signature for the PDF
}

// 5. Entry and Exit Logs
export interface EntryLog {
  id: string;
  timestamp: Date;
  name: string;
  direction: 'IN' | 'OUT';
}

// 6. Safety Check Logs
export interface SafetyCheckLog {
  id: string;
  timestamp: Date;
  checkedBy: string;
  notes?: string;
}

// --- THE CORE PERMIT OBJECT ---

export interface Permit {
  // Identification
  id: string;           // UUID (Generated on Tablet)
  permitId: string;     // Human Readable (e.g. PTW-2024-085)
  
  // Meta Data
  status: PermitStatus;
  createdAt: Date;
  updatedAt: Date;      // For Sync Logic
  syncedAt?: Date;      // Last time it touched the server
  version: number;      // Increment on every edit to handle conflicts

  // Scope
  location: string;
  description: string;
  workTypes: WorkType[];
  
  // Constraints
  validFrom: Date;
  expiresAt: Date;
  checkFrequency: number; // Minutes between required checks

  // Dynamic Data
  personnelCount: number; // Current people in the zone
  attendant?: string;     // Name of Standby Man
  rescueTeam?: string[];  // Array of names
  lastCheckAt?: Date;    // Last gas check time for reminders
  safetyCheckLogs: SafetyCheckLog[];  // Safety checks history
  
  // Data Modules
  gasConfig: GasEntry[];      // The required limits for this specific permit
  gasLogs: GasLog[];          // History of checks
  isolations: IsolationPoint[]; // LOTO records
  signatures: Signature[];    // Auth chain

  entryLogs: EntryLog[];      // Who went in/out and when
  
}

// --- NAVIGATION TYPES ---
export type RootStackParamList = {
  MainTabs: undefined;
  PermitWizard: undefined;
  ActivePermit: { permitId: string };
};

export type BottomTabParamList = {
  DashboardTab: undefined;
  MonitorTab: undefined;
};