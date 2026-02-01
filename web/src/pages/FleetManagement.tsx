// web/src/pages/FleetManagement.tsx

import { useState } from 'react';
import { 
  Ship, Plus, Search, MoreVertical, CheckCircle2, 
  RefreshCw, AlertCircle, Anchor, MapPin
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';

interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  lastSync: string;
  status: 'Online' | 'Offline' | 'Syncing';
  version: string;
}

export default function FleetManagement() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  const [searchTerm, setSearchTerm] = useState('');

  const [vessels] = useState<Vessel[]>([
    { id: '1', name: 'MV OCEANIC EXPLORER', imo: '9876543', type: 'VLCC', lastSync: '2026-02-01 06:30', status: 'Online', version: 'v2.4.0' },
    { id: '2', name: 'MT STARLIGHT', imo: '9123456', type: 'Suezmax', lastSync: '2026-01-31 22:15', status: 'Offline', version: 'v2.3.9' },
    { id: '3', name: 'MV FRONTIER SPIRIT', imo: '9554433', type: 'Aframax', lastSync: '2026-02-01 07:10', status: 'Syncing', version: 'v2.4.0' },
  ]);

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    panel: isDark ? '#0F172A' : '#F1F5F9'
  };

  return (
    <div style={styles.container}>
      {/* HUD HEADER */}
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <Anchor size={18} color="white" />
          </div>
          <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px' }}>FLEET COMMAND CONSOLE</span>
        </div>
        <button style={{ ...styles.addBtn, backgroundColor: primaryColor }}>
          <Plus size={14} /> REGISTER NEW VESSEL
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* SEARCH & FILTER BAR */}
        <div style={{ ...styles.actionBar, backgroundColor: colors.card, borderBottomColor: colors.border }}>
          <div style={{ ...styles.searchBar, backgroundColor: colors.bg, borderColor: colors.border }}>
            <Search size={16} color={colors.muted} />
            <input 
              style={{ ...styles.searchInput, color: colors.text }} 
              placeholder="Filter by Vessel Name, IMO or Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={{ ...styles.syncBtn, color: primaryColor, borderColor: primaryColor }}>
            <RefreshCw size={14} /> FORCE GLOBAL SYNC
          </button>
        </div>

        {/* VESSEL GRID */}
        <div style={styles.gridArea}>
          {vessels.map((v) => (
            <div key={v.id} style={{ ...styles.vesselCard, backgroundColor: colors.card, borderColor: colors.border }}>
              <div style={styles.cardHeader}>
                <div style={styles.vesselMeta}>
                  <div style={{ ...styles.statusIndicator, backgroundColor: v.status === 'Online' ? '#10B981' : v.status === 'Offline' ? '#E11D48' : '#F59E0B' }} />
                  <span style={{ color: colors.muted, fontSize: '10px', fontWeight: '800' }}>IMO: {v.imo}</span>
                </div>
                <MoreVertical size={16} color={colors.muted} cursor="pointer" />
              </div>

              <div style={styles.cardBody}>
                <h2 style={{ color: colors.text, fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>{v.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={10} color={primaryColor} />
                  <span style={{ color: colors.muted, fontSize: '11px' }}>{v.type} • {v.version}</span>
                </div>
              </div>

              <div style={{ ...styles.cardFooter, borderTopColor: colors.border }}>
                <div style={styles.syncStatus}>
                  {v.status === 'Online' ? <CheckCircle2 size={12} color="#10B981" /> : <AlertCircle size={12} color={colors.muted} />}
                  <span style={{ color: colors.text, fontSize: '10px', fontWeight: '700' }}>LAST SYNC: {v.lastSync}</span>
                </div>
                <button style={styles.viewBtn}>VIEW LOGS</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  hudHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 30px', borderBottom: '1px solid', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBox: { padding: '8px', borderRadius: '8px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  actionBar: { padding: '15px 30px', borderBottom: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
  searchBar: { flex: 1, maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px', height: '40px', borderRadius: '8px', border: '1px solid' },
  searchInput: { border: 'none', background: 'none', fontSize: '13px', width: '100%', outline: 'none' },
  syncBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '11px', fontWeight: '800', background: 'none', cursor: 'pointer' },
  gridArea: { flex: 1, padding: '30px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', alignContent: 'start' },
  vesselCard: { borderRadius: '12px', border: '1px solid', display: 'flex', flexDirection: 'column' },
  cardHeader: { padding: '15px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  vesselMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusIndicator: { width: '8px', height: '8px', borderRadius: '50%' },
  cardBody: { padding: '15px 20px 20px 20px' },
  cardFooter: { padding: '15px 20px', borderTop: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  syncStatus: { display: 'flex', alignItems: 'center', gap: '6px' },
  viewBtn: { background: 'none', border: 'none', color: '#3194A0', fontSize: '10px', fontWeight: '900', cursor: 'pointer' }
};