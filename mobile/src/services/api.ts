// mobile/src/services/api.ts

import axios from 'axios';
import { Platform } from 'react-native';

/** * NETWORK CONFIGURATION
 * Replace '192.168.x.x' with the IPv4 Address you found in Step 1.
 */
const PC_IP = '192.168.86.247'; // <--- CHANGE THIS to your actual IP

const BASE_URL = Platform.select({
  android: `http://${PC_IP}:5000/api`,
  ios: `http://${PC_IP}:5000/api`,
  default: `http://${PC_IP}:5000/api`,
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendHeartbeat = async (vesselData: {
  name: string;
  imoNumber: string;
  lat: number;
  lng: number;
  status: string;
}) => {
  try {
    const response = await api.post('/vessels/heartbeat', vesselData);
    console.log('Shore Sync Successful');
    return response.data;
  } catch (error) {
    console.log(`Shore Sync Offline: Attempted to connect to ${BASE_URL}`);
    throw error;
  }
};

export default api;