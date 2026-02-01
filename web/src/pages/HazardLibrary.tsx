// web/src/pages/HazardLibrary.tsx

import { useState } from 'react';
import { 
  AlertTriangle, Trash2, Save, 
  ShieldAlert, Search, Download, Upload, Link as LinkIcon, X
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Hazard {
  id: string;
  name: string;
  category: string;
  mitigation: string;
  mappedPermits: string[]; 
}

const CATEGORIES = ['Physical', 'Chemical', 'Environmental', 'Electrical'];

// Mock existing permits - replace with your actual state or API data
const EXISTING_PERMITS = ['Hot Work', 'Enclosed Space', 'Cold Work', 'Electrical Isolation', 'Bunkering'];

export default function HazardLibrary() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [newHazard, setNewHazard] = useState({ 
    name: '', 
    category: 'Physical', 
    mitigation: '', 
    mappedPermits: [] as string[] 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    input: isDark ? '#1E293B' : '#FFFFFF',
    panel: isDark ? '#0F172A' : '#F1F5F9'
  };

  const togglePermitLink = (permit: string) => {
    setNewHazard(prev => ({
      ...prev,
      mappedPermits: prev.mappedPermits.includes(permit)
        ? prev.mappedPermits.filter(p => p !== permit)
        : [...prev.mappedPermits, permit]
    }));
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hazard Template');
    worksheet.columns = [
      { header: 'Hazard_Name', key: 'name', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Mapped_Permits_Comma_Separated', key: 'permits', width: 40 },
      { header: 'Mitigation_Instructions', key: 'mitigation', width: 40 },
    ];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3194A0' } };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'KeelSafe_Multi_Mapping_Template.xlsx');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      await workbook.xlsx.load(buffer);
      const ws = workbook.getWorksheet(1);
      const imported: Hazard[] = [];
      ws?.eachRow((row, i) => {
        if (i === 1) return;
        imported.push({
          id: `haz-${i}-${Date.now()}`,
          name: row.getCell(1).value?.toString() || '',
          category: row.getCell(2).value?.toString() || 'Physical',
          mappedPermits: row.getCell(3).value?.toString().split(',').map(s => s.trim()) || [],
          mitigation: row.getCell(4).value?.toString() || ''
        });
      });
      setHazards([...hazards, ...imported]);
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredHazards = hazards.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.mappedPermits.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <AlertTriangle size={18} color="white" />
          </div>
          <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px' }}>HAZARD MAPPING CONSOLE</span>
        </div>
        <div style={styles.headerActions}>
           <button onClick={downloadTemplate} style={{ ...styles.ghostBtn, color: colors.muted }}><Download size={14} /> TEMPLATE</button>
           <label style={{ ...styles.ghostBtn, color: primaryColor, cursor: 'pointer' }}>
              <Upload size={14} /> IMPORT
              <input type="file" hidden accept=".xlsx" onChange={handleImport} />
           </label>
           <button style={{ ...styles.saveBtn, backgroundColor: primaryColor }}><Save size={14} /> DEPLOY</button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={{ ...styles.configColumn, borderRightColor: colors.border }}>
          <div style={styles.section}>
            <label style={styles.label}>HAZARD NAME</label>
            <input style={{ ...styles.input, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={newHazard.name} onChange={(e) => setNewHazard({ ...newHazard, name: e.target.value })} />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>CATEGORY</label>
            <select 
              style={{ ...styles.select, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={newHazard.category}
              onChange={(e) => setNewHazard({ ...newHazard, category: e.target.value })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>LINK TO PERMITS</label>
            <div style={{ ...styles.multiSelectBox, backgroundColor: colors.input, borderColor: colors.border }}>
               {EXISTING_PERMITS.map(permit => (
                 <div 
                  key={permit} 
                  onClick={() => togglePermitLink(permit)}
                  style={{ 
                    ...styles.permitTag, 
                    backgroundColor: newHazard.mappedPermits.includes(permit) ? primaryColor : 'rgba(0,0,0,0.05)',
                    color: newHazard.mappedPermits.includes(permit) ? 'white' : colors.text
                  }}
                 >
                   {permit}
                   {newHazard.mappedPermits.includes(permit) && <X size={10} style={{ marginLeft: '4px' }} />}
                 </div>
               ))}
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>MITIGATION</label>
            <textarea style={{ ...styles.textarea, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={newHazard.mitigation} onChange={(e) => setNewHazard({ ...newHazard, mitigation: e.target.value })} />
          </div>
          <button onClick={() => setHazards([...hazards, { ...newHazard, id: Date.now().toString() } as Hazard])} 
            style={{ ...styles.addBtn, backgroundColor: primaryColor }}>
             LINK TO {newHazard.mappedPermits.length} PERMITS
          </button>
        </div>

        <div style={{ ...styles.reviewPillar, backgroundColor: colors.bg }}>
           <div style={{ ...styles.searchBar, backgroundColor: colors.panel, borderColor: colors.border }}>
              <Search size={16} color={colors.muted} />
              <input style={{ ...styles.searchInner, color: colors.text }} placeholder="Search hazards..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>

           <div style={styles.gridArea}>
              {filteredHazards.map((h) => (
                <div key={h.id} style={{ ...styles.hazardCard, backgroundColor: colors.card, borderColor: colors.border }}>
                   <div style={styles.hazardInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <ShieldAlert size={14} color={primaryColor} />
                         <b style={{ color: colors.text, fontSize: '13px' }}>{h.name}</b>
                      </div>
                      <div style={styles.tagCloud}>
                        {h.mappedPermits.map(p => (
                          <div key={p} style={styles.miniLinkTag}><LinkIcon size={8} /> {p.toUpperCase()}</div>
                        ))}
                      </div>
                      <p style={{ color: colors.muted, fontSize: '11px', marginTop: '6px' }}>{h.mitigation}</p>
                   </div>
                   <button style={styles.iconBtn} onClick={() => setHazards(hazards.filter(item => item.id !== h.id))}><Trash2 size={16} color="#E11D48" /></button>
                </div>
              ))}
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
  headerActions: { display: 'flex', gap: '15px' },
  ghostBtn: { background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  mainContent: { flex: 1, display: 'flex', minHeight: 0 },
  configColumn: { width: '340px', borderRight: '1px solid', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '10px', fontWeight: '900', color: '#94A3B8', letterSpacing: '1px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid', fontSize: '13px' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid', fontSize: '13px', cursor: 'pointer' },
  multiSelectBox: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', borderRadius: '8px', border: '1px solid', minHeight: '80px' },
  permitTag: { padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid', fontSize: '12px', minHeight: '60px', resize: 'none' },
  addBtn: { padding: '14px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '700', fontSize: '12px', cursor: 'pointer' },
  reviewPillar: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px', height: '45px', borderRadius: '10px', border: '1px solid' },
  searchInner: { border: 'none', background: 'none', fontSize: '13px', width: '100%', outline: 'none' },
  gridArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  hazardCard: { display: 'flex', padding: '16px', borderRadius: '10px', border: '1px solid', alignItems: 'flex-start', justifyContent: 'space-between' },
  hazardInfo: { flex: 1 },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' },
  miniLinkTag: { fontSize: '8px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(49, 148, 160, 0.1)', color: '#3194A0', display: 'flex', alignItems: 'center', gap: '4px' },
  cardActions: { display: 'flex', gap: '5px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }
};