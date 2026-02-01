// web/src/pages/Dashboard.tsx

import { useState } from 'react';
import { 
  LayoutDashboard, ClipboardCheck, AlertTriangle, Users, 
  LogOut, Ship, FileText, ShieldAlert, Sun, Moon 
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import SimopsManager from './SimopsManager';
import ChecklistManager from './ChecklistManager'; // <--- NEW IMPORT
import HazardLibrary from './HazardLibrary';

export default function Dashboard() {
  const { isDark, toggleTheme } = useWebTheme();
  const [activeView, setActiveView] = useState('overview');
  const primaryColor = "#3194A0";

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    textMuted: isDark ? '#94A3B8' : '#64748B',
    sidebar: isDark ? '#020617' : '#1E293B',
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'simops', icon: <ShieldAlert size={20} />, label: 'SIMOPS Rules' },
    { id: 'checklists', icon: <ClipboardCheck size={20} />, label: 'Checklist Manager' },
    { id: 'hazards', icon: <AlertTriangle size={20} />, label: 'Hazard Library' },
    { id: 'fleet', icon: <Users size={20} />, label: 'Fleet Management' },
    { id: 'logs', icon: <FileText size={20} />, label: 'Audit Logs' },
  ];

  return (
    <div style={{ ...styles.container, backgroundColor: colors.bg }}>
      <div style={{ ...styles.sidebar, backgroundColor: colors.sidebar }}>
        <div style={styles.sidebarHeader}>
          <div style={{ ...styles.logoIcon, backgroundColor: primaryColor }}>
            <Ship size={22} color="white" />
          </div>
          <span style={styles.logoText}>KEELSAFE</span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setActiveView(item.id)}
              style={{ 
                ...styles.navItem, 
                backgroundColor: activeView === item.id ? 'rgba(49, 148, 160, 0.15)' : 'transparent',
                color: activeView === item.id ? primaryColor : '#94A3B8',
                cursor: 'pointer'
              }}
            >
              {item.icon}
              <span style={{ fontWeight: activeView === item.id ? '600' : '400' }}>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div onClick={toggleTheme} style={{...styles.navItem, cursor: 'pointer'}}>
            {isDark ? <Sun size={20} color="#94A3B8" /> : <Moon size={20} color="#94A3B8" />}
            <span style={{ color: '#94A3B8' }}>{isDark ? 'Light' : 'Dark'}</span>
          </div>
          <div style={{...styles.navItem, cursor: 'pointer'}} onClick={() => window.location.href = '/'}>
            <LogOut size={20} color="#94A3B8" />
            <span style={{ color: '#94A3B8' }}>Sign Out</span>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        <header style={{ ...styles.header, backgroundColor: colors.surface, borderBottomColor: colors.border }}>
          <div>
            <h1 style={{ ...styles.pageTitle, color: colors.text }}>
                {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h1>
            <p style={{ ...styles.pageSub, color: colors.textMuted }}>Shore-side fleet management console.</p>
          </div>
        </header>

        <main style={styles.scrollArea}>
            {activeView === 'overview' && (
                <div style={{ padding: '40px', color: colors.text }}>Overview dashboard under construction.</div>
            )}
            {activeView === 'simops' && <SimopsManager />}
            {activeView === 'checklists' && <ChecklistManager />}
            {activeView === 'hazards' && <HazardLibrary />}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' },
  sidebar: { width: '240px', display: 'flex', flexDirection: 'column', color: 'white' },
  sidebarHeader: { padding: '30px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { padding: '8px', borderRadius: '8px' },
  logoText: { fontSize: '1.1rem', fontWeight: '800', letterSpacing: '1px' },
  nav: { flex: 1, padding: '0 12px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px' },
  sidebarFooter: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scrollArea: { flex: 1, overflowY: 'hidden' }, // <--- FORCE NO SCROLL
  header: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: '1px', borderBottomStyle: 'solid' },
  pageTitle: { fontSize: '1.3rem', fontWeight: '700', margin: 0 },
  pageSub: { margin: '4px 0 0 0', fontSize: '0.8rem' }
};