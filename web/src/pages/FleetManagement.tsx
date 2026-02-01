// web/src/pages/FleetManagement.tsx

import { useState, useEffect } from 'react';
import { 
  Plus, Search, RefreshCw, Anchor, Ship, MapPin, 
  Activity, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useWebTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import FleetMap from '../components/map/FleetMap';

// Aligned with Backend Vessel Model and Sequelize columns
interface Vessel {
  id: string;
  name: string;
  imoNumber: string; // Matches backend key
  status: string;
  lastSync: string;
  lat: number;
  lng: number;
  activePermitCount?: number; // Matches backend key
}

export default function FleetManagement() {
  const { isDark } = useWebTheme();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // --- API FETCH LOGIC ---
  const fetchFleet = async () => {
    try {
      setLoading(true);
      // Fetches from the PostgreSQL database via your Node backend
      const response = await axios.get('http://localhost:5000/api/vessels');
      setVessels(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch fleet data:", error);
      setLoading(false);
    }
  };

  // Initial fetch and set up interval for real-time updates
  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 5000); // Poll every 5 seconds for live feel
    return () => clearInterval(interval);
  }, []);

  // Filter logic for the sidebar search using the corrected imoNumber key
  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.imoNumber && v.imoNumber.includes(searchTerm))
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2.5 rounded-xl">
            <Anchor className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-foreground">Fleet Management</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1">Live Command Console</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchFleet} className="font-bold border-primary/20 text-primary hover:bg-primary/5">
            <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Now
          </Button>
          <Button size="sm" className="font-bold">
            <Plus size={14} className="mr-2" /> Add Vessel
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: LIVE FLEET LIST */}
        <div className="w-[400px] border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                className="pl-9 h-10 bg-muted/50 border-none text-sm" 
                placeholder="Filter fleet by name or IMO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredVessels.map((v) => (
              <Card key={v.id} className="border-border/60 hover:border-primary/40 transition-all cursor-pointer group shadow-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-[9px] font-black text-muted-foreground tracking-widest uppercase opacity-60">
                          IMO {v.imoNumber || 'N/A'}
                        </span>
                        <h3 className="font-black text-base group-hover:text-primary transition-colors text-foreground uppercase">
                          {v.name}
                        </h3>
                    </div>
                    
                    {/* UPDATED STATUS COLORS */}
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1.5 ${
                        v.status?.toUpperCase() === 'ONLINE' ? 'bg-green-500/10 text-green-600' : 
                        v.status?.toUpperCase() === 'OFFLINE' ? 'bg-red-500/10 text-red-600' : 
                        'bg-orange-500/10 text-orange-600'
                    }`}>
                        <div className={`w-1 h-1 rounded-full ${
                            v.status?.toUpperCase() === 'ONLINE' ? 'bg-green-500 animate-pulse' : 
                            v.status?.toUpperCase() === 'OFFLINE' ? 'bg-red-500' : 
                            'bg-orange-500'
                        }`} />
                        {v.status?.toUpperCase() || 'OFFLINE'}
                    </div>
                  </div>
                  
                  {/* LIVE DATA SECTION: PERMITS & HEARTBEAT */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-muted/40 p-2 rounded-md flex items-center gap-2 border border-border/40">
                        <ShieldCheck size={12} className="text-primary" />
                        <span className="text-[11px] font-bold text-foreground">
                          {v.activePermitCount || 0} Permits
                        </span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-md flex items-center gap-2 border border-border/40">
                        <Activity size={12} className="text-primary" />
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {v.lastSync ? new Date(v.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Waiting...'}
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredVessels.length === 0 && !loading && (
              <div className="text-center py-10 opacity-40 font-bold text-xs uppercase tracking-widest text-foreground">
                No vessels found in network
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: THE LIVE MAP */}
        <div className="flex-1 bg-muted relative">
          <FleetMap vessels={vessels} />
        </div>
      </main>
    </div>
  );
}