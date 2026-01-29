// mobile/src/constants/mockData.ts

import { Permit } from '../types/permitTypes';

export const MOCK_PERMITS: Permit[] = [
  {
    id: '1',
    permitId: 'PTW-2024-001',
    status: 'Active',
    location: 'Engine Room - Main Deck',
    workTypes: ['hot_work', 'working_aloft'],
    description: 'Welding on main pipe valve',
    checkFrequency: 15,
    createdAt: new Date(),
    expiresAt: new Date(new Date().getTime() + 8 * 60 * 60 * 1000), // +8 hours
    personnelCount: 2,
  },
  {
    id: '2',
    permitId: 'PTW-2024-002',
    status: 'Suspended',
    location: 'Pump Room',
    workTypes: ['enclosed_space'],
    description: 'Routine inspection of pumps',
    checkFrequency: 20,
    createdAt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // -2 hours
    expiresAt: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
    personnelCount: 0,
  },
  {
    id: '3',
    permitId: 'PTW-2024-003',
    status: 'Completed',
    location: 'Bridge Wing Stbd',
    workTypes: ['working_aloft'],
    description: 'Radar maintenance',
    checkFrequency: 30,
    createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // Yesterday
    expiresAt: new Date(),
    personnelCount: 0,
  },
];