// web/src/pages/AuditLogs.tsx

import { useState } from 'react';
import { 
  FileText, Search, Filter, ArrowUpRight, 
  User, Shield, Clock, HardDrive
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  vessel: string;
  severity: 'Routine' | 'Warning' | 'Critical';
}

export default function AuditLogs() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  const [searchTerm, setSearchTerm] = useState('');

  const [logs] = useState<AuditEntry[]>([
    { id: '1', timestamp: '2026-02-01 07:45:10', user: 'Admin.Shore', action: 'Deployed New Checklist', target: 'Tank Cleaning', vessel: 'GLOBAL FLEET', severity: 'Routine' },
    { id: '2', timestamp: '2026-02-01 07:12:04', user: 'C/O oceanic.exp', action: 'Permit Authorized', target: 'Hot Work #88', vessel: 'MV OCEANIC', severity: 'Routine' },
    { id: '3', timestamp: '2026-02-01 06:30:45', user: 'System', action: 'Sync Conflict Detected', target: 'Hazard Library', vessel: 'MT STARLIGHT', severity: 'Warning' },
    { id: '4', timestamp: '2026-01-31 23:55:12', user: 'Admin.Shore', action: 'Deleted Permit Template', target: 'Obsolete Cold Work', vessel: 'OFFICE', severity: 'Critical' },
  ]);

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0'
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Critical': return { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.1)' };
      case 'Warning': return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
      default: return { color: '#3194A0', bg: 'rgba(49, 148, 160, 0.1)' };
    }
  };

  return (
    <div style={styles.container}>
      {/* HUD HEADER */}
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <FileText size={18} color="white" />
          </div>
          <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px' }}>FLEET AUDIT LEDGER</span>
        </div>
        <button style={{ ...styles.exportBtn, color: colors.text, borderColor: colors.border }}>
          <HardDrive size={14} /> EXPORT COMPLIANCE REPORT
        </button>
      </div>

      <div style={styles.mainContent}>
        {/* FILTER BAR */}
        <div style={{ ...styles.actionBar, backgroundColor: colors.card, borderBottomColor: colors.border }}>
          <div style={{ ...styles.searchBar, backgroundColor: colors.bg, borderColor: colors.border }}>
            <Search size={16} color={colors.muted} />
            <input 
              style={{ ...styles.searchInput, color: colors.text }} 
              placeholder="Search by User, Action or Vessel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={{ ...styles.filterBtn, color: colors.text, borderColor: colors.border }}>
            <Filter size={14} /> FILTER BY DATE
          </button>
        </div>

        {/* LOG TABLE */}
        <div style={styles.tableArea}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ ...styles.tableHead, borderBottomColor: colors.border }}>
                <th style={styles.th}>TIMESTAMP</th>
                <th style={styles.th}>SOURCE</th>
                <th style={styles.th}>USER</th>
                <th style={styles.th}>ACTION</th>
                <th style={styles.th}>TARGET</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ ...styles.tr, borderBottomColor: colors.border }}>
                  <td style={styles.td}>
                    <div style={styles.cellWithIcon}><Clock size={12} color={colors.muted} /> {log.timestamp}</div>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '700', color: primaryColor }}>{log.vessel}</td>
                  <td style={styles.td}>
                    <div style={styles.cellWithIcon}><User size={12} color={colors.muted} /> {log.user}</div>
                  </td>
                  <td style={{ ...styles.td, color: colors.text }}>{log.action}</td>
                  <td style={styles.td}>{log.target}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      ...styles.sevBadge, 
                      backgroundColor: getSeverityStyle(log.severity).bg, 
                      color: getSeverityStyle(log.severity).color 
                    }}>
                      <Shield size={10} /> {log.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  exportBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: '1px solid', fontSize: '11px', fontWeight: '800', background: 'none', cursor: 'pointer' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  actionBar: { padding: '15px 30px', borderBottom: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
  searchBar: { flex: 1, maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px', height: '40px', borderRadius: '8px', border: '1px solid' },
  searchInput: { border: 'none', background: 'none', fontSize: '13px', width: '100%', outline: 'none' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '11px', fontWeight: '800', background: 'none', cursor: 'pointer' },
  tableArea: { flex: 1, overflowY: 'auto', padding: '0 30px' },
  tableHead: { textAlign: 'left', borderBottom: '1px solid' },
  th: { padding: '20px 10px', fontSize: '10px', fontWeight: '900', color: '#94A3B8', letterSpacing: '1px' },
  tr: { borderBottom: '1px solid' },
  td: { padding: '16px 10px', fontSize: '12px' },
  cellWithIcon: { display: 'flex', alignItems: 'center', gap: '8px' },
  sevBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }
};