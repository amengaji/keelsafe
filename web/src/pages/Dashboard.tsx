// web/src/pages/Dashboard.tsx

import { useState } from 'react';
import { 
  LayoutDashboard, ClipboardCheck, AlertTriangle, Users, 
  LogOut, Ship, FileText, ShieldAlert, Sun, Moon, 
  Activity, CheckCircle2, AlertCircle, Bell, Settings as SettingsIcon, User,
  ShieldCheck, Database, Zap, Lock, Radio, Phone, X
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import SimopsManager from './SimopsManager';
import ChecklistManager from './ChecklistManager';
import HazardLibrary from './HazardLibrary';
import FleetManagement from './FleetManagement';
import AuditLogs from './AuditLogs';

// Modular Settings Component
const SettingsPage = ({ colors, primaryColor }: any) => (
  <div style={styles.overviewContainer}>
    <div style={styles.settingsLayout}>
      {/* SECURITY & PASSWORD */}
      <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border, flex: '1 1 300px' }}>
        <h3 style={{ ...styles.sectionHeader, color: colors.text }}><Lock size={14} /> SECURITY & IDENTITY</h3>
        <div style={styles.settingsGrid}>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>CURRENT PASSWORD</label>
            <input type="password" style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} placeholder="••••••••" />
          </div>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>NEW PASSWORD</label>
            <input type="password" style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} />
          </div>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>CONFIRM NEW PASSWORD</label>
            <input type="password" style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} />
          </div>
          <button style={{ ...styles.ghostBtn, color: primaryColor, border: `1px solid ${primaryColor}`, padding: '10px', borderRadius: '8px' }}>UPDATE PASSWORD</button>
        </div>
      </div>

      {/* SIMOPS & SAFETY */}
      <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border, flex: '1 1 300px' }}>
        <h3 style={{ ...styles.sectionHeader, color: colors.text }}><Radio size={14} /> SIMOPS THRESHOLDS</h3>
        <div style={styles.settingsGrid}>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>PROXIMITY ALERT RADIUS (METERS)</label>
            <input type="number" style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} defaultValue="500" />
          </div>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>VESSEL API AUTH TOKEN</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input disabled style={{ ...styles.input, backgroundColor: colors.bg, color: colors.textMuted, borderColor: colors.border, flex: 1 }} value="ks_live_9928374..." />
              <button style={{ ...styles.ghostBtn, color: primaryColor, border: `1px solid ${primaryColor}`, padding: '0 12px', borderRadius: '8px' }}>REGEN</button>
            </div>
          </div>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>CONFLICT LOGIC</label>
            <select style={{ ...styles.select, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
              <option>Hard Stop (Block Auth)</option>
              <option>Soft Warning Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* EMERGENCY & SYSTEM */}
      <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border, flex: '1 1 300px' }}>
        <h3 style={{ ...styles.sectionHeader, color: colors.text }}><Phone size={14} /> SYSTEM CONFIGURATION</h3>
        <div style={styles.settingsGrid}>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>24/7 DPA EMERGENCY CONTACT</label>
            <input style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} defaultValue="+44 20 7946 0000" />
          </div>
          <div style={styles.settingsGroup}>
            <label style={{ ...styles.label, color: colors.textMuted }}>DATA RETENTION POLICY</label>
            <select style={{ ...styles.select, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
              <option>5 Years (Standard)</option>
              <option>10 Years (Extended)</option>
            </select>
          </div>
          <button style={{ ...styles.saveBtn, backgroundColor: primaryColor }}>DEPLOY GLOBAL SETTINGS</button>
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { isDark, toggleTheme } = useWebTheme();
  const [activeView, setActiveView] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const primaryColor = "#3194A0";

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    surface: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    textMuted: isDark ? '#94A3B8' : '#64748B',
    sidebar: isDark ? '#020617' : '#1E293B',
    panel: isDark ? '#1E293B' : '#FFFFFF',
  };

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'simops', icon: <ShieldAlert size={20} />, label: 'SIMOPS Rules' },
    { id: 'checklists', icon: <ClipboardCheck size={20} />, label: 'Checklist Manager' },
    { id: 'hazards', icon: <AlertTriangle size={20} />, label: 'Hazard Library' },
    { id: 'fleet', icon: <Users size={20} />, label: 'Fleet Management' },
    { id: 'logs', icon: <FileText size={20} />, label: 'Audit Logs' },
  ];

  const Overview = () => (
    <div style={styles.overviewContainer}>
      <div style={styles.statsGrid}>
        {[
          { label: 'Active Vessels', val: '12', icon: <Ship color={primaryColor} /> },
          { label: 'Pending Permits', val: '45', icon: <Activity color="#F59E0B" /> },
          { label: 'Safety Score', val: '98%', icon: <CheckCircle2 color="#10B981" /> },
          { label: 'Critical Risks', val: '02', icon: <AlertCircle color="#E11D48" /> }
        ].map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, backgroundColor: colors.surface, borderColor: colors.border }}>
            <div style={styles.statInfo}>
              <span style={{ ...styles.statLabel, color: colors.textMuted }}>{stat.label}</span>
              <span style={{ ...styles.statValue, color: colors.text }}>{stat.val}</span>
            </div>
            <div style={styles.statIconBox}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 style={{ ...styles.sectionHeader, color: colors.text }}>LATEST FLEET EVENTS</h3>
        {[
          { vessel: 'MV OCEANIC', event: 'Hot Work Permit Created', time: '10m ago' },
          { vessel: 'MT STARLIGHT', event: 'Enclosed Space Entry Completed', time: '1h ago' },
          { vessel: 'MV FRONTIER', event: 'SimOps Conflict Detected', time: '3h ago' }
        ].map((ev, i) => (
          <div key={i} style={{ ...styles.eventRow, borderBottomColor: colors.border }}>
            <span style={{ color: primaryColor, fontWeight: '800', width: '120px' }}>{ev.vessel}</span>
            <span style={{ color: colors.text, flex: 1 }}>{ev.event}</span>
            <span style={{ color: colors.textMuted, fontSize: '11px' }}>{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.container, backgroundColor: colors.bg }}>
      {/* SIDEBAR */}
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
          <div 
            onClick={() => setActiveView('settings')}
            style={{ 
              ...styles.navItem, 
              backgroundColor: activeView === 'settings' ? 'rgba(49, 148, 160, 0.15)' : 'transparent',
              color: activeView === 'settings' ? primaryColor : '#94A3B8',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            <SettingsIcon size={20} />
            <span style={{ fontWeight: activeView === 'settings' ? '600' : '400' }}>Settings</span>
          </div>

          <div style={{...styles.navItem, cursor: 'pointer'}} onClick={() => window.location.href = '/'}>
            <LogOut size={20} color="#94A3B8" />
            <span style={{ color: '#94A3B8' }}>Sign Out</span>
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {/* HEADER */}
        <header style={{ ...styles.header, backgroundColor: colors.surface, borderBottomColor: colors.border }}>
          <div>
            <h1 style={{ ...styles.pageTitle, color: colors.text }}>
                {activeView === 'settings' ? 'System Settings' : menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h1>
            <p style={{ ...styles.pageSub, color: colors.textMuted }}>Shore-side fleet management console.</p>
          </div>

          <div style={styles.topBarActions}>
            <div onClick={toggleTheme} style={styles.iconButton}>
              {isDark ? <Sun size={20} color={colors.textMuted} /> : <Moon size={20} color={colors.textMuted} />}
            </div>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowNotifications(!showNotifications)} style={styles.iconButton}>
                <Bell size={20} color={colors.textMuted} />
                <div style={styles.notificationDot} />
              </div>
              
              {/* NOTIFICATION FEED POPUP */}
              {showNotifications && (
                <div style={{ ...styles.notifDropdown, backgroundColor: colors.surface, borderColor: colors.border }}>
                  <div style={styles.notifHeader}>
                    <span style={{ color: colors.text, fontWeight: '800', fontSize: '12px' }}>NOTIFICATIONS</span>
                    <X size={14} color={colors.textMuted} cursor="pointer" onClick={() => setShowNotifications(false)} />
                  </div>
                  <div style={styles.notifList}>
                    {[
                      { title: 'Critical SIMOPS Alert', vessel: 'MV Frontier', time: '2m ago' },
                      { title: 'Checklist Deployed', vessel: 'Fleet Global', time: '1h ago' }
                    ].map((n, i) => (
                      <div key={i} style={{ ...styles.notifItem, borderBottomColor: colors.border }}>
                        <div style={{ color: colors.text, fontWeight: '700', fontSize: '11px' }}>{n.title}</div>
                        <div style={{ color: colors.textMuted, fontSize: '10px' }}>{n.vessel} • {n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ ...styles.profileBox, borderColor: colors.border }}>
              <User size={16} color={primaryColor} />
              <span style={{ color: colors.text, fontSize: '12px', fontWeight: '700' }}>ADMIN</span>
            </div>
          </div>
        </header>

        <main style={styles.scrollArea}>
            {activeView === 'overview' && <Overview />}
            {activeView === 'simops' && <SimopsManager />}
            {activeView === 'checklists' && <ChecklistManager />}
            {activeView === 'hazards' && <HazardLibrary />}
            {activeView === 'fleet' && <FleetManagement />}
            {activeView === 'logs' && <AuditLogs />}
            {activeView === 'settings' && <SettingsPage colors={colors} primaryColor={primaryColor} />}
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
  sidebarFooter: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  scrollArea: { flex: 1, overflowY: 'hidden' }, 
  header: { padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: '1px', borderBottomStyle: 'solid' },
  topBarActions: { display: 'flex', alignItems: 'center', gap: '20px' },
  iconButton: { cursor: 'pointer', padding: '8px', position: 'relative' },
  notificationDot: { position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#E11D48', borderRadius: '50%', border: '2px solid white' },
  notifDropdown: { position: 'absolute', top: '45px', right: '0', width: '280px', borderRadius: '12px', border: '1px solid', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 1000, padding: '15px' },
  notifHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  notifList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  notifItem: { paddingBottom: '10px', borderBottom: '1px solid' },
  profileBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '20px', border: '1px solid' },
  pageTitle: { fontSize: '1.2rem', fontWeight: '800', margin: 0 },
  pageSub: { margin: '2px 0 0 0', fontSize: '0.75rem' },
  overviewContainer: { padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', height: '100%', overflowY: 'auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  statCard: { padding: '20px', borderRadius: '12px', border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '10px', fontWeight: '900', letterSpacing: '1px' },
  statValue: { fontSize: '20px', fontWeight: '800' },
  statIconBox: { padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.03)' },
  activitySection: { padding: '24px', borderRadius: '12px', border: '1px solid' },
  sectionHeader: { fontSize: '11px', fontWeight: '900', marginBottom: '20px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' },
  eventRow: { display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid', fontSize: '13px' },
  settingsLayout: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  settingsGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  settingsGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '10px', fontWeight: '900' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '13px' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '13px', cursor: 'pointer' },
  saveBtn: { padding: '12px 24px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer', marginTop: '10px' },
  ghostBtn: { background: 'none', fontWeight: '800', fontSize: '10px', cursor: 'pointer' }
};