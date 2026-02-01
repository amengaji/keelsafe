// web/src/components/Shell.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ClipboardCheck, AlertTriangle, Users, 
  LogOut, Ship, FileText, ShieldAlert, Sun, Moon, 
  Bell, Settings as SettingsIcon, User
} from 'lucide-react';
import { useWebTheme } from '../../context/ThemeContext';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useWebTheme();
  const location = useLocation();
  const navigate = useNavigate();
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
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/simops', icon: <ShieldAlert size={20} />, label: 'SIMOPS Rules' },
    { path: '/checklists', icon: <ClipboardCheck size={20} />, label: 'Checklist Manager' },
    { path: '/hazards', icon: <AlertTriangle size={20} />, label: 'Hazard Library' },
    { path: '/fleet', icon: <Users size={20} />, label: 'Fleet Management' },
    { path: '/auditlogs', icon: <FileText size={20} />, label: 'Audit Logs' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: colors.bg }}>
      {/* PERSISTENT SIDEBAR */}
      <div style={{ width: '240px', backgroundColor: colors.sidebar, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '30px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: primaryColor }}>
            <Ship size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', letterSpacing: '1px' }}>KEELSAFE</span>
        </div>

        <nav style={{ flex: 1, padding: '0 12px' }}>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', marginBottom: '4px',
                backgroundColor: location.pathname === item.path ? 'rgba(49, 148, 160, 0.15)' : 'transparent',
                color: location.pathname === item.path ? primaryColor : '#94A3B8'
              }}>
                {item.icon}
                <span style={{ fontWeight: location.pathname === item.path ? '600' : '400' }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
              backgroundColor: location.pathname === '/settings' ? 'rgba(49, 148, 160, 0.15)' : 'transparent',
              color: location.pathname === '/settings' ? primaryColor : '#94A3B8'
            }}>
              <SettingsIcon size={20} />
              <span>Settings</span>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', color: '#94A3B8' }} onClick={() => navigate('/login')}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: colors.text }}>Commander Console</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div onClick={toggleTheme} style={{ cursor: 'pointer' }}>
              {isDark ? <Sun size={20} color={colors.textMuted} /> : <Moon size={20} color={colors.textMuted} />}
            </div>
            <Bell size={20} color={colors.textMuted} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <User size={16} color={primaryColor} />
              <span style={{ color: colors.text, fontSize: '12px', fontWeight: '700' }}>ADMIN</span>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: colors.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}