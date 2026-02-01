// web/src/pages/Settings.tsx

import { Lock, Radio, Phone, Zap, ShieldCheck, Database } from 'lucide-react';

interface SettingsProps {
  colors: any;
  primaryColor: string;
}

export default function Settings({ colors, primaryColor }: SettingsProps) {
  return (
    <div style={styles.overviewContainer}>
      <div style={styles.settingsLayout}>
        {/* SECTION 1: SECURITY */}
        <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border }}>
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
            <button style={{ ...styles.ghostBtn, color: primaryColor, border: `1px solid ${primaryColor}` }}>RESET PASSWORD</button>
          </div>
        </div>

        {/* SECTION 2: SIMOPS PARAMETERS */}
        <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border }}>
          <h3 style={{ ...styles.sectionHeader, color: colors.text }}><Radio size={14} /> SIMOPS PARAMETERS</h3>
          <div style={styles.settingsGrid}>
            <div style={styles.settingsGroup}>
              <label style={{ ...styles.label, color: colors.textMuted }}>PROXIMITY ALERT RADIUS (M)</label>
              <input type="number" style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} defaultValue="500" />
            </div>
            <div style={styles.settingsGroup}>
              <label style={{ ...styles.label, color: colors.textMuted }}>CONFLICT LOGIC</label>
              <select style={{ ...styles.select, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}>
                <option>Hard Stop (Block Auth)</option>
                <option>Warning Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: EMERGENCY & DATA */}
        <div style={{ ...styles.activitySection, backgroundColor: colors.surface, borderColor: colors.border }}>
          <h3 style={{ ...styles.sectionHeader, color: colors.text }}><Phone size={14} /> FLEET COMMS</h3>
          <div style={styles.settingsGrid}>
            <div style={styles.settingsGroup}>
              <label style={{ ...styles.label, color: colors.textMuted }}>24/7 DPA CONTACT</label>
              <input style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }} defaultValue="+44 20 7946 0000" />
            </div>
            <button style={{ ...styles.saveBtn, backgroundColor: primaryColor }}>DEPLOY SETTINGS</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overviewContainer: { padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', height: '100%', overflowY: 'auto' },
  settingsLayout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  activitySection: { padding: '24px', borderRadius: '12px', border: '1px solid' },
  sectionHeader: { fontSize: '11px', fontWeight: '900', marginBottom: '20px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' },
  settingsGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  settingsGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '10px', fontWeight: '900' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '13px' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '13px', cursor: 'pointer' },
  saveBtn: { padding: '12px 24px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  ghostBtn: { background: 'none', fontWeight: '800', fontSize: '10px', cursor: 'pointer', padding: '10px', borderRadius: '8px' }
};