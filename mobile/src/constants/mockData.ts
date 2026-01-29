// mobile/src/constants/mockData.ts

import { Permit } from '../types/permitTypes';

const DEFAULT_GAS_CONFIG = [
    { id: 'o2', name: 'O2', tlv: '20.9', unit: '%', top: '', mid: '', bot: '', isCustom: false },
    { id: 'h2s', name: 'H2S', tlv: '10', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'co', name: 'CO', tlv: '25', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'co2', name: 'CO2', tlv: '5000', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'ch4_vol', name: 'CH4 (Vol)', tlv: '0', unit: '%', top: '', mid: '', bot: '', isCustom: false },
    { id: 'ch4_lel', name: 'CH4 (LEL)', tlv: '0', unit: '%', top: '', mid: '', bot: '', isCustom: false },
];

export const MOCK_PERMITS: Permit[] = [
  {
    id: '1',
    permitId: 'PTW-2024-001',
    status: 'Active',
    location: 'Engine Room - Main Deck',
    workTypes: ['hot_work', 'working_aloft'],
    description: 'Welding on main pipe valve',
    checkFrequency: 5,
    createdAt: new Date(),
    expiresAt: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), 
    personnelCount: 2,
    attendant: 'Jack Sparrow',
    rescueTeam: ['Capt. James Hook', 'William Smee'],
    gasConfig: DEFAULT_GAS_CONFIG
  },
  {
    id: '2',
    permitId: 'PTW-2024-002',
    status: 'Suspended',
    location: 'Pump Room',
    workTypes: ['enclosed_space'],
    description: 'Routine inspection of pumps',
    checkFrequency: 20,
    createdAt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), 
    expiresAt: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
    personnelCount: 0,
    attendant: 'Davy Jones',
    rescueTeam: ['Edward Teach'],
    gasConfig: DEFAULT_GAS_CONFIG
  },
  {
    id: '3',
    permitId: 'PTW-2024-003',
    status: 'Completed',
    location: 'Bridge Wing Stbd',
    workTypes: ['working_aloft'],
    description: 'Radar maintenance',
    checkFrequency: 30,
    createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 
    expiresAt: new Date(),
    personnelCount: 0,
    gasConfig: []
  },
];