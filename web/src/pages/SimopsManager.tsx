// web/src/pages/SimopsManager.tsx

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Flame, Box, Zap, Waves, Hammer, 
  AlertOctagon, Save, 
  Fuel, Construction, Lock, ShieldCheck, 
  Trash2
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import axios from 'axios';

const WORK_TYPES = [
  { id: 'hot_work', label: 'HOT WORK', icon: <Flame size={18} /> },
  { id: 'enclosed_space', label: 'ENCLOSED SPACE', icon: <Box size={18} /> },
  { id: 'electrical', label: 'ELECTRICAL', icon: <Zap size={18} /> },
  { id: 'underwater', label: 'UNDERWATER OPS', icon: <Waves size={18} /> },
  { id: 'bunkering', label: 'BUNKERING', icon: <Fuel size={18} /> },
  { id: 'cargo', label: 'CARGO OPS', icon: <Construction size={18} /> },
  { id: 'general', label: 'GENERAL', icon: <Hammer size={18} /> }
];

const PROTOCOLS = [
  { id: 'forbidden', label: 'FORBIDDEN', color: '#E11D48', icon: <AlertOctagon size={24} /> },
  { id: 'office', label: 'OFFICE AUTH', color: '#3194A0', icon: <Lock size={24} /> },
  { id: 'allowed', label: 'ALLOWED', color: '#10B981', icon: <ShieldCheck size={24} /> }
];

export default function SimopsManager() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  
  const [primary, setPrimary] = useState(WORK_TYPES[0]);
  const [secondary, setSecondary] = useState(WORK_TYPES[4]);
  const [activeProtocol, setActiveProtocol] = useState(PROTOCOLS[0]);
  const [stagedRules, setStagedRules] = useState<any[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch existing rules on load
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/simops/rules');
        const formatted = res.data.map((r: any) => ({
          permitA: r.permitA,
          permitB: r.permitB,
          severity: r.severity.toLowerCase()
        }));
        setStagedRules(formatted);
      } catch (err) { console.error(err); }
    };
    fetchRules();
  }, []);

  const addRule = () => {
    if (primary.id === secondary.id) return;
    const exists = stagedRules.find(r => 
      (r.permitA === primary.id && r.permitB === secondary.id) ||
      (r.permitA === secondary.id && r.permitB === primary.id)
    );
    if (exists) return;

    setStagedRules([...stagedRules, {
      permitA: primary.id,
      permitB: secondary.id,
      severity: activeProtocol.id
    }]);
  };

  const deployRules = async () => {
    setIsDeploying(true);
    try {
      await axios.post('http://localhost:5000/api/simops/rules/sync', { rules: stagedRules });
      alert("🚢 PROTOCOLS DEPLOYED: All vessels will now enforce these conflicts.");
    } catch (err) {
      alert("Deployment failed.");
    } finally { setIsDeploying(false); }
  };

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    border: isDark ? '#334155' : '#E2E8F0',
    muted: isDark ? '#94A3B8' : '#64748B'
  };

  return (
    <div style={{ ...styles.container, backgroundColor: colors.bg }}>
      <header style={{ ...styles.header, borderBottomColor: colors.border, backgroundColor: colors.card }}>
        <div style={styles.brandGroup}>
          <div style={{ ...styles.logo, backgroundColor: primaryColor }}><ShieldAlert size={20} color="white" /></div>
          <div>
            <h1 style={{ ...styles.title, color: colors.text }}>SimOps Rule Engine</h1>
            <div style={styles.statusBadge}><div style={styles.pulseDot} /><span style={{ color: '#10B981', fontSize: '9px', fontWeight: '900' }}>FLEET SYNC ACTIVE</span></div>
          </div>
        </div>

        <button 
          onClick={deployRules} 
          disabled={isDeploying}
          style={{ ...styles.deployBtn, backgroundColor: primaryColor, opacity: isDeploying ? 0.7 : 1 }}
        >
          <Save size={14} /> {isDeploying ? 'SYNCING...' : 'DEPLOY TO FLEET'}
        </button>
      </header>

      <div style={styles.matrixContainer}>
        {/* LEFT PILLAR */}
        <div style={styles.pillar}>
          <div style={styles.pillarHeader}>PRIMARY PERMIT</div>
          <div style={styles.scrollList}>
            {WORK_TYPES.map(type => (
              <div key={type.id} onClick={() => setPrimary(type)} style={{ ...styles.selectorCard, backgroundColor: primary.id === type.id ? primaryColor : colors.card, borderColor: primary.id === type.id ? primaryColor : colors.border, color: primary.id === type.id ? 'white' : colors.text }}>
                {type.icon}<span style={styles.typeLabel}>{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER HUB */}
        <div style={styles.bridgeArea}>
          <div style={{ ...styles.protocolCard, backgroundColor: colors.card, borderColor: colors.border }}>
            <div style={{ ...styles.protocolHexagon, backgroundColor: activeProtocol.color }}>{activeProtocol.icon}</div>
            <h2 style={{ color: activeProtocol.color, fontWeight: '900', fontSize: '18px', margin: '15px 0 5px' }}>{activeProtocol.label}</h2>
            <div style={styles.protocolGrid}>
              {PROTOCOLS.map(p => (
                <button key={p.id} onClick={() => setActiveProtocol(p)} style={{ ...styles.protocolBtn, backgroundColor: activeProtocol.id === p.id ? p.color : 'transparent', borderColor: activeProtocol.id === p.id ? p.color : colors.border, color: activeProtocol.id === p.id ? 'white' : colors.muted }}>{p.label}</button>
              ))}
            </div>
            <button onClick={addRule} style={{ ...styles.addRuleBtn, backgroundColor: colors.text, color: colors.bg }}>ADD CONFLICT RULE</button>
          </div>
          
          <div style={styles.ruleDisplay}>
            <h4 style={{ fontSize: '10px', fontWeight: '900', color: colors.muted, marginBottom: '10px' }}>STAGED CONFLICTS ({stagedRules.length})</h4>
            <div style={styles.stagedList}>
              {stagedRules.map((r, i) => (
                <div key={i} style={{ ...styles.stagedItem, borderLeftColor: PROTOCOLS.find(p => p.id === r.severity)?.color }}>
                   <span style={{ fontSize: '10px', fontWeight: '800' }}>{r.permitA} x {r.permitB}</span>
                   <Trash2 size={12} cursor="pointer" onClick={() => setStagedRules(stagedRules.filter((_, idx) => idx !== i))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PILLAR */}
        <div style={styles.pillar}>
          <div style={{ ...styles.pillarHeader, textAlign: 'right' }}>SECONDARY PERMIT</div>
          <div style={styles.scrollList}>
            {WORK_TYPES.map(type => (
              <div key={type.id} onClick={() => setSecondary(type)} style={{ ...styles.selectorCard, backgroundColor: secondary.id === type.id ? primaryColor : colors.card, borderColor: secondary.id === type.id ? primaryColor : colors.border, color: secondary.id === type.id ? 'white' : colors.text, flexDirection: 'row-reverse' }}>
                {type.icon}<span style={{ ...styles.typeLabel, marginRight: '12px', marginLeft: 0 }}>{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', borderBottom: '1px solid' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  logo: { padding: '10px', borderRadius: '10px' },
  title: { fontSize: '16px', fontWeight: '900', margin: 0 },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '6px' },
  pulseDot: { width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' },
  deployBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  matrixContainer: { flex: 1, display: 'flex', padding: '20px 40px', gap: '20px' },
  pillar: { width: '280px', display: 'flex', flexDirection: 'column' },
  pillarHeader: { fontSize: '10px', fontWeight: '900', color: '#94A3B8', marginBottom: '15px' },
  scrollList: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' },
  selectorCard: { display: 'flex', alignItems: 'center', padding: '15px 20px', borderRadius: '10px', border: '1px solid', cursor: 'pointer' },
  typeLabel: { flex: 1, fontSize: '12px', fontWeight: '800', marginLeft: '12px' },
  bridgeArea: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  protocolCard: { width: '320px', padding: '25px', borderRadius: '20px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  protocolHexagon: { width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  protocolGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', marginBottom: '15px' },
  protocolBtn: { padding: '8px 5px', borderRadius: '6px', border: '1px solid', fontSize: '8px', fontWeight: '900', cursor: 'pointer' },
  addRuleBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '900', fontSize: '10px', cursor: 'pointer' },
  ruleDisplay: { width: '100%', maxWidth: '400px', flex: 1, overflowY: 'auto' },
  stagedList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  stagedItem: { padding: '10px', backgroundColor: 'rgba(0,0,0,0.02)', borderLeft: '4px solid', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};