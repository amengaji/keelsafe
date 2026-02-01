// mobile/src/constants/mockData.ts

import { Permit } from '../types/permitTypes';

export const MOCK_PERMITS: Permit[] = [
  {
    id: '1',
    permitId: 'HW-2026-001',
    status: 'Active',
    location: 'Main Deck - Port Side',
    workTypes: ['hot_work', 'working_aloft'],
    description: 'Welding of railing and light fixture replacement.',
    checkFrequency: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    validFrom: new Date(),
    version: 1,
    personnelCount: 2,
    attendant: 'John Doe',
    rescueTeam: ['Mike Ross', 'Harvey Specter'],
    gasConfig: [
      { id: 'o2', name: 'Oxygen', tlv: '20.9', unit: '%', top: '', mid: '', bot: '', isCustom: false },
      { id: 'lel', name: 'LEL', tlv: '0', unit: '% LEL', top: '', mid: '', bot: '', isCustom: false }
    ],
    gasLogs: [],
    entryLogs: [],
    safetyCheckLogs: [],
    isolations: [], // Added to satisfy Permit type
    signatures: []  // Added to satisfy Permit type
  },
  {
    id: '2',
    permitId: 'ES-2026-005',
    status: 'Suspended',
    location: 'Ballast Tank 3C',
    workTypes: ['enclosed_space'],
    description: 'Internal inspection of tank coating.',
    checkFrequency: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    validFrom: new Date(),
    version: 1,
    personnelCount: 0,
    attendant: 'Sarah Connor',
    rescueTeam: ['Kyle Reese'],
    gasConfig: [
      { id: 'o2', name: 'Oxygen', tlv: '20.9', unit: '%', top: '', mid: '', bot: '', isCustom: false },
      { id: 'h2s', name: 'H2S', tlv: '10', unit: 'PPM', top: '', mid: '', bot: '', isCustom: false }
    ],
    gasLogs: [],
    entryLogs: [],
    safetyCheckLogs: [],
    isolations: [], // Added to satisfy Permit type
    signatures: []  // Added to satisfy Permit type
  },
  {
    id: '3',
    permitId: 'HW-2026-002',
    status: 'JobComplete',
    location: 'Engine Room',
    workTypes: ['hot_work'],
    description: 'Pipe bracket welding.',
    checkFrequency: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    validFrom: new Date(),
    version: 1,
    personnelCount: 0,
    attendant: 'Jim Beam',
    rescueTeam: [],
    gasConfig: [],
    gasLogs: [],
    entryLogs: [],
    safetyCheckLogs: [],
    isolations: [], // Added to satisfy Permit type
    signatures: []  // Added to satisfy Permit type
  }
];