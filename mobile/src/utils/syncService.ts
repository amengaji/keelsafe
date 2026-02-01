// mobile/src/utils/syncService.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * KeelSafe Mobile Sync Service v2.1
 * Handles Offline-First synchronization for Checklists and SimOps Rules.
 */

const API_BASE_URL = 'http://YOUR_SERVER_IP:5000/api'; // Replace with your actual server IP

export const performFullSync = async (vesselId: string) => {
  console.log('🚢 Starting Fleet Heartbeat Sync for Vessel:', vesselId);
  
  try {
    // 1. Fetch Data from Shore Server
    const [checklistRes, simopsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/checklists/vessel-active`),
      axios.get(`${API_BASE_URL}/simops/rules`)
    ]);

    // 2. Validate Response
    if (!checklistRes.data || !simopsRes.data) {
      throw new Error('Incomplete data received from Shore Console.');
    }

    // 3. Persist to Local Storage (Offline Source of Truth)
    await Promise.all([
      AsyncStorage.setItem('@keel_checklists', JSON.stringify(checklistRes.data)),
      AsyncStorage.setItem('@keel_simops_rules', JSON.stringify(simopsRes.data)),
      AsyncStorage.setItem('@last_sync_time', new Date().toISOString())
    ]);

    console.log(`✅ Sync Complete: ${checklistRes.data.length} Checkpoints, ${simopsRes.data.length} SimOps Rules.`);
    return { success: true, timestamp: new Date() };

  } catch (error: unknown) {
    // FIX: Handle 'unknown' type for TypeScript 4.0+
    let errorMessage = 'An unexpected sync error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('❌ Sync Failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Local Validation Engine
 * Used by the mobile UI to check conflicts before a crew member signs a permit.
 */
export const checkLocalSimOpsConflict = async (workType: string, zone: string, activePermits: any[]) => {
  try {
    const rulesRaw = await AsyncStorage.getItem('@keel_simops_rules');
    if (!rulesRaw) return { conflict: false };

    const rules = JSON.parse(rulesRaw);

    // Cross-reference current selection against active on-board permits
    for (const permit of activePermits) {
      // Only check permits in the same physical zone
      if (permit.zone === zone && permit.status === 'ACTIVE') {
        const violation = rules.find((r: any) => 
          (r.permitA === workType && r.permitB === permit.workType) ||
          (r.permitA === permit.workType && r.permitB === workType)
        );

        if (violation) {
          return {
            conflict: true,
            severity: violation.severity,
            message: `SIMOPS ALERT: ${workType.toUpperCase()} conflicts with ${permit.workType.toUpperCase()} in ${zone}.`
          };
        }
      }
    }
  } catch (e) {
    console.error('Local conflict check failed:', e);
  }

  return { conflict: false };
};