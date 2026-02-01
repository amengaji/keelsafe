// web/src/pages/SimopsManager.tsx

import { useState } from 'react';
import { 
  ShieldAlert, Flame, Box, Zap, Waves, Hammer, 
  CheckCircle2, AlertOctagon, Info, Save, ChevronRight,
  Fuel, Construction, Activity // 'Construction' used as Crane proxy in Lucide
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';

// Maritime Work Types - Precise Labels and Industry Icons
const WORK_TYPES = [
  { id: 'hot_work', label: 'HOT WORK', icon: <Flame size={16} /> },
  { id: 'enclosed_space', label: 'ENCLOSED SPACE', icon: <Box size={16} /> },
  { id: 'electrical', label: 'ELECTRICAL', icon: <Zap size={16} /> },
  { id: 'underwater', label: 'UNDERWATER OPS', icon: <Waves size={16} /> },
  { id: 'bunkering', label: 'BUNKERING', icon: <Fuel size={16} /> },
  { id: 'cargo', label: 'CARGO OPS', icon: <Construction size={16} /> }, // High-density Crane Icon
  { id: 'general', label: 'GENERAL', icon: <Hammer size={16} /> }
];

export default function SimopsManager() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  const [selectedA, setSelectedA] = useState(WORK_TYPES[0]);
  const [selectedB, setSelectedB] = useState(WORK_TYPES[1]);
  const [rule, setRule] = useState('office');

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  return (
    <div style={styles.container}>
      {/* 1. HUD COMMAND BAR */}
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <ShieldAlert size={18} color="white" />
          </div>
          <div>
            <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px', display: 'block' }}>SIMOPS COMMAND</span>
            <div style={styles.statusRow}>
              <Activity size={10} color="#10B981" />
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#10B981' }}>SYSTEM LIVE</span>
            </div>
          </div>
        </div>
        
        <div style={{ ...styles.pathway, backgroundColor: colors.bg, borderColor: colors.border }}>
            <span style={{ color: primaryColor }}>{selectedA.label}</span>
            <ChevronRight size={14} color={colors.text} style={{ opacity: 0.3 }} />
            <span style={{ color: primaryColor }}>{selectedB.label}</span>
        </div>

        <button style={{ ...styles.saveBtn, backgroundColor: primaryColor }}>
          <Save size={14} /> DEPLOY PROTOCOL
        </button>
      </div>

      {/* 2. TACTICAL CORE - High Density, No Scroll */}
      <div style={styles.core}>
        
        {/* PILLAR: PRIMARY */}
        <div style={{ ...styles.pillar, borderRightColor: colors.border }}>
          <div style={styles.pillarHead}>PRIMARY SELECTION</div>
          <div style={styles.list}>
            {WORK_TYPES.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedA(t)}
                style={{
                    ...styles.item,
                    backgroundColor: selectedA.id === t.id ? primaryColor : colors.card,
                    borderColor: colors.border,
                    color: selectedA.id === t.id ? 'white' : colors.text,
                }}
              >
                {t.icon} <span style={styles.itemLabel}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR: SIMOPS */}
        <div style={{ ...styles.pillar, borderRightColor: colors.border }}>
          <div style={styles.pillarHead}>SIMULTANEOUS SELECTION</div>
          <div style={styles.list}>
            {WORK_TYPES.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedB(t)}
                style={{
                    ...styles.item,
                    backgroundColor: selectedB.id === t.id ? primaryColor : colors.card,
                    borderColor: colors.border,
                    color: selectedB.id === t.id ? 'white' : colors.text,
                }}
              >
                {t.icon} <span style={styles.itemLabel}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOGIC HUB (CENTERED) */}
        <div style={{ ...styles.logicArea, backgroundColor: colors.bg }}>
          <div style={styles.pillarHead}>CONFLICT LOGIC ENGINE</div>
          
          <div style={styles.ruleStack}>
            {[
              { id: 'forbidden', label: 'FORBIDDEN', color: '#E11D48', icon: <AlertOctagon size={20} />, desc: 'Stops permit issuance.' },
              { id: 'office', label: 'OFFICE AUTH', color: primaryColor, icon: <Info size={20} />, desc: 'Requires Shore Admin sign-off.' },
              { id: 'allowed', label: 'ALLOWED', color: '#10B981', icon: <CheckCircle2 size={20} />, desc: 'Standard safety protocols.' }
            ].map((r) => (
              <div 
                key={r.id}
                onClick={() => setRule(r.id)}
                style={{ 
                    ...styles.ruleCard, 
                    borderLeftColor: r.color, 
                    backgroundColor: colors.card,
                    opacity: rule === r.id ? 1 : 0.3,
                    transform: rule === r.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ color: r.color }}>{r.icon}</div>
                <div style={styles.ruleInfo}>
                  <b style={{ color: colors.text, fontSize: '13px' }}>{r.label}</b>
                  <p style={{ color: colors.text, fontSize: '11px', margin: 0, opacity: 0.7 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.footerNote}>
            <p style={{ color: colors.text, opacity: 0.4, fontSize: '10px', textAlign: 'center' }}>
                PROTOCOL WILL BE PUSHED TO ALL VESSELS IN THE FLEET.
            </p>
          </div>
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
  statusRow: { display: 'flex', alignItems: 'center', gap: '4px' },
  pathway: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', borderRadius: '30px', border: '1px solid', fontSize: '11px', fontWeight: '900' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  core: { flex: 1, display: 'flex', minHeight: 0 },
  pillar: { width: '260px', borderRight: '1px solid', display: 'flex', flexDirection: 'column' },
  pillarHead: { padding: '15px 20px', fontSize: '9px', fontWeight: '900', color: '#94A3B8', letterSpacing: '1.5px' },
  list: { padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' },
  item: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', transition: '0.2s' },
  itemLabel: { fontSize: '12px', fontWeight: '700' },
  logicArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  ruleStack: { padding: '0 40px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' },
  ruleCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '8px', borderLeft: '5px solid', cursor: 'pointer', transition: '0.3s' },
  ruleInfo: { display: 'flex', flexDirection: 'column' },
  footerNote: { padding: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.05)' }
};