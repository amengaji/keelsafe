// web/src/pages/Dashboard.tsx

import { useState, useEffect } from 'react';
import { 
  Ship, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';

/**
 * Dashboard Component - Now purely focused on data visualization.
 * The Sidebar and Header are managed by the Shell layout.
 */
export default function Dashboard() {
  const { isDark } = useWebTheme();
  const [vessels, setVessels] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ totalActive: 0, totalPending: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const primaryColor = "#3194A0";

  // DATA FETCHING LOGIC - Connects to your Node.js Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vesselRes, statsRes, notifRes] = await Promise.all([
          fetch('http://localhost:5000/api/vessels'),
          fetch('http://localhost:5000/api/stats/dashboard'),
          fetch('http://localhost:5000/api/notifications')
        ]);
        
        const vesselData = await vesselRes.json();
        const statsData = await statsRes.json();
        const notifData = await notifRes.json();

        setVessels(vesselData);
        setDashboardStats(statsData);
        setNotifications(notifData);
      } catch (err) {
        console.error("Backend Sync Error:", err);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const colors = {
    surface: isDark ? '#1E293B' : '#FFFFFF',
    border: isDark ? '#334155' : '#E2E8F0',
    text: isDark ? '#F1F5F9' : '#0F172A',
    textMuted: isDark ? '#94A3B8' : '#64748B',
  };

  return (
    <div style={styles.overviewContainer}>
      {/* STATS SUMMARY TILES */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Active Vessels', val: vessels.length || '0', icon: <Ship color={primaryColor} /> },
          { label: 'Active Permits', val: dashboardStats.totalActive || '0', icon: <Activity color="#F59E0B" /> },
          { label: 'Safety Score', val: '98%', icon: <CheckCircle2 color="#10B981" /> },
          { label: 'Critical Risks', val: notifications.filter(n => n.category === 'CRITICAL').length || '0', icon: <AlertCircle color="#E11D48" /> }
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

      {/* RECENT ACTIVITY LOG */}
      <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border }}>
        <h3 style={{ ...styles.sectionHeader, color: colors.text }}>LATEST FLEET EVENTS</h3>
        {notifications.length > 0 ? (
          notifications.slice(0, 8).map((ev, i) => (
            <div key={i} style={{ ...styles.eventRow, borderBottomColor: colors.border }}>
              <span style={{ color: primaryColor, fontWeight: '800', width: '150px' }}>{ev.vesselName || 'FLEET'}</span>
              <span style={{ color: colors.text, flex: 1 }}>{ev.title} - {ev.message}</span>
              <span style={{ color: colors.textMuted, fontSize: '11px' }}>
                {new Date(ev.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          ))
        ) : (
          <div style={{ ...styles.eventRow, color: colors.textMuted }}>No recent activities recorded.</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overviewContainer: { padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  statCard: { padding: '24px', borderRadius: '16px', border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '10px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' },
  statValue: { fontSize: '24px', fontWeight: '800' },
  statIconBox: { padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.03)' },
  activitySection: { padding: '24px', borderRadius: '16px', border: '1px solid', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  sectionHeader: { fontSize: '11px', fontWeight: '900', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' },
  eventRow: { display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid', fontSize: '13px' },
};