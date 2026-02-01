// web/src/pages/FleetManagement.tsx

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, RefreshCw, Anchor, Ship, 
  Activity, ShieldCheck, X, Clock, Zap, FileText,
  ChevronDown, ChevronUp, Compass, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useWebTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import FleetMap from '../components/map/FleetMap';

interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  status: string;
  lastSync: string;
  lat: any;
  lng: any;
  activePermitCount?: number;
}

interface ChecklistStep {
  permitName: string;
  question: string;
  sequence: number;
}

export default function FleetManagement() {
  const { isDark } = useWebTheme();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [activeChecklists, setActiveChecklists] = useState<ChecklistStep[]>([]);
  const [expandedPermits, setExpandedPermits] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vessels');
      setVessels(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch fleet data:", error);
      setLoading(false);
    }
  };

  const fetchChecklists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/checklists/vessel-active');
      setActiveChecklists(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
    }
  };

  useEffect(() => {
    fetchFleet();
    fetchChecklists();
    const interval = setInterval(fetchFleet, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredVessels = useMemo(() => {
    return (vessels || []).filter(v => 
      (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.imoNumber || '').includes(searchTerm)
    );
  }, [vessels, searchTerm]);

  const groupedChecklists = useMemo(() => {
    const data = Array.isArray(activeChecklists) ? activeChecklists : [];
    return data.reduce((acc, step) => {
      if (!step.permitName) return acc;
      if (!acc[step.permitName]) acc[step.permitName] = [];
      acc[step.permitName].push(step);
      return acc;
    }, {} as Record<string, ChecklistStep[]>);
  }, [activeChecklists]);

  const toggleAccordion = (name: string) => {
    setExpandedPermits(prev => ({ ...prev, [name]: !prev[name] }));
  };

  /**
   * Converts Decimal Degrees to Maritime Format: DD°MM.mm'H
   * Example: 1.2921 -> 01°17.53'N
   */
  const toMaritimeCoord = (decimal: any, isLongitude: boolean) => {
    const val = parseFloat(decimal);
    if (isNaN(val)) return isLongitude ? "000°00.00'E" : "00°00.00'N";

    const absolute = Math.abs(val);
    const degrees = Math.floor(absolute);
    const minutes = ((absolute - degrees) * 60).toFixed(2);
    
    let hemisphere = "";
    if (isLongitude) {
      hemisphere = val >= 0 ? "E" : "W";
    } else {
      hemisphere = val >= 0 ? "N" : "S";
    }

    const dStr = degrees.toString().padStart(isLongitude ? 3 : 2, '0');
    const mStr = parseFloat(minutes).toString().padStart(5, '0');

    return `${dStr}°${mStr}'${hemisphere}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      <header className="flex items-center justify-between px-8 py-4 bg-card border-b border-border shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#3194A0] p-2.5 rounded-xl">
            <Anchor className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Fleet Management</h1>
            <p className="text-[10px] font-bold text-[#3194A0] tracking-widest uppercase mt-1">Live Command Console</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchFleet} className="font-bold border-[#3194A0]/20 text-[#3194A0]">
            <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Now
          </Button>
          <Button size="sm" className="font-bold bg-[#3194A0]">
            <Plus size={14} className="mr-2" /> Add Vessel
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR LIST */}
        <div className="w-[400px] border-r border-border bg-card/50 flex flex-col z-10">
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                className="pl-9 h-10 bg-muted/50 border-none text-sm" 
                placeholder="Filter fleet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredVessels.map((v) => (
              <Card 
                key={v.id} 
                onClick={() => setSelectedVessel(v)}
                className={`border-border/60 hover:border-[#3194A0]/40 transition-all cursor-pointer shadow-none ${selectedVessel?.id === v.id ? 'ring-2 ring-[#3194A0] bg-[#3194A0]/5' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-[9px] font-black text-muted-foreground tracking-widest uppercase opacity-60">IMO {v.imoNumber || 'N/A'}</span>
                        <h3 className="font-black text-base text-foreground uppercase">{v.name}</h3>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1.5 ${v.status?.toUpperCase() === 'ONLINE' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        <div className={`w-1 h-1 rounded-full ${v.status?.toUpperCase() === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {v.status?.toUpperCase() || 'OFFLINE'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-muted/40 p-2 rounded-md flex items-center gap-2 border border-border/40">
                        <ShieldCheck size={12} className="text-[#3194A0]" />
                        <span className="text-[11px] font-bold text-foreground">{v.activePermitCount || 0} Permits</span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-md flex items-center gap-2 border border-border/40">
                        <Activity size={12} className="text-[#3194A0]" />
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {v.lastSync ? new Date(v.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Waiting...'}
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* MAP AREA */}
        <div className="flex-1 bg-muted relative">
          <FleetMap vessels={vessels} />
          
          <AnimatePresence>
            {selectedVessel && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-4 right-4 bottom-4 w-[450px] bg-card border border-border rounded-2xl shadow-2xl z-20 flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-border flex justify-between items-center bg-[#3194A0] text-white">
                  <div className="flex items-center gap-3">
                    <Ship size={24} />
                    <div>
                      <h2 className="text-xl font-black uppercase leading-none">{selectedVessel.name}</h2>
                      <p className="text-[9px] font-bold opacity-80 tracking-widest mt-1 uppercase">
                        Vessel Active Profile
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedVessel(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* MARITIME COORDINATES CARDS */}
                  <section>
                    <h4 className="text-[10px] font-black text-[#3194A0] tracking-widest mb-4 uppercase">Position (DMS Format)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col items-center text-center shadow-inner">
                        <Globe size={18} className="text-[#3194A0] mb-2" />
                        <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Latitude</p>
                        <p className="text-xl font-mono font-black text-[#3194A0]">{toMaritimeCoord(selectedVessel.lat, false)}</p>
                      </div>
                      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col items-center text-center shadow-inner">
                        <Compass size={18} className="text-[#3194A0] mb-2" />
                        <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">Longitude</p>
                        <p className="text-xl font-mono font-black text-[#3194A0]">{toMaritimeCoord(selectedVessel.lng, true)}</p>
                      </div>
                    </div>
                  </section>

                  {/* SYSTEM STATUS SECTION */}
                  <section>
                    <h4 className="text-[10px] font-black text-[#3194A0] tracking-widest mb-4 uppercase">System Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
                        <Zap size={16} className="text-[#3194A0] mb-2" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Sync Health</p>
                        <p className="text-lg font-black">{selectedVessel.status === 'ONLINE' ? '100%' : '0%'}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
                        <Clock size={16} className="text-[#3194A0] mb-2" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Last Seen</p>
                        <p className="text-lg font-black">
                          {selectedVessel.lastSync ? new Date(selectedVessel.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* CHECKLIST ACCORDION SECTION */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-[#3194A0] tracking-widest uppercase">Active Checklists</h4>
                      <span className="text-[9px] font-black bg-[#3194A0]/10 text-[#3194A0] px-2 py-0.5 rounded">SHORE-SYNC</span>
                    </div>
                    <div className="space-y-3">
                      {Object.keys(groupedChecklists).length > 0 ? (
                        Object.entries(groupedChecklists).map(([name, steps]) => (
                          <div key={name} className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                            <button 
                              onClick={() => toggleAccordion(name)}
                              className="w-full bg-muted p-3 flex justify-between items-center border-b border-border hover:bg-muted/80 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground uppercase">{name}</span>
                                <span className="text-[9px] font-bold text-white bg-[#3194A0] px-1.5 py-0.5 rounded-full">{steps.length} Qs</span>
                              </div>
                              {expandedPermits[name] ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                            </button>
                            
                            <AnimatePresence>
                              {expandedPermits[name] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 space-y-3 bg-card">
                                    {steps.map((step, index) => (
                                      <div key={`${name}-${index}`} className="flex gap-3 text-[11px] leading-relaxed border-b border-muted pb-2 last:border-0">
                                        <span className="text-[#3194A0] font-black w-4">{index + 1}.</span>
                                        <span className="text-muted-foreground font-medium">{step.question}</span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl opacity-50">
                          <FileText size={32} className="mx-auto text-muted-foreground mb-3" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Checklists Deployed</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}