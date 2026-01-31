// mobile/src/constants/crewData.ts

import { UserRole } from '../types/permitTypes';

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  role: UserRole;
  pin: string; 
  avatarInitials: string;
}

export const CREW_DATABASE: CrewMember[] = [
  // COMMAND
  { id: 'u1', name: 'Capt. Haddock', rank: 'Master', role: 'Master', pin: '0001', avatarInitials: 'CH' },
  { id: 'u2', name: 'Steve Zissou', rank: 'Chief Officer', role: 'ChiefOfficer', pin: '9999', avatarInitials: 'SZ' },
  { id: 'u3', name: 'Willy Wonka', rank: 'Chief Engineer', role: 'ShoreAdmin', pin: '5678', avatarInitials: 'WW' },
  { id: 'u4', name: 'Jack Sparrow', rank: '2nd Engineer', role: 'Issuing Authority', pin: '1234', avatarInitials: 'JS' },
  
  // DECK
  { id: 'u5', name: 'Bosun Gibbs', rank: 'Bosun', role: 'Bosun', pin: '1111', avatarInitials: 'BG' },
  { id: 'u6', name: 'AB Jones', rank: 'AB', role: 'Crew', pin: '2222', avatarInitials: 'AJ' },
  { id: 'u7', name: 'AB Smith', rank: 'AB', role: 'Crew', pin: '3333', avatarInitials: 'AS' },
  { id: 'u8', name: 'OS Pintel', rank: 'OS', role: 'Crew', pin: '4444', avatarInitials: 'OP' },
  
  // ENGINE
  { id: 'u9', name: 'Fitter Mike', rank: 'Fitter', role: 'Crew', pin: '5555', avatarInitials: 'FM' },
  { id: 'u10', name: 'Oiler Ragetti', rank: 'Oiler', role: 'Crew', pin: '6666', avatarInitials: 'OR' },
  { id: 'u11', name: 'Wiper Bobby', rank: 'Wiper', role: 'Crew', pin: '7777', avatarInitials: 'WB' },
  { id: 'u12', name: 'Pumpman Turner', rank: 'Pumpman', role: 'Pumpman', pin: '8888', avatarInitials: 'PT' },
];