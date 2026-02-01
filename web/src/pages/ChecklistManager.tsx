// web/src/pages/ChecklistManager.tsx

import { useState, useMemo } from 'react';
import { 
  Upload, Save, Download, Plus, Settings, 
  ChevronRight, ChevronDown, ListPlus, Trash2, Edit2, X, Check
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Step {
  id: string;
  permitName: string;
  category: string;
  sequence: number;
  question: string;
  capsuleType: string;
}

const CATEGORIES = ['hot_work', 'enclosed_space', 'electrical', 'underwater', 'bunkering', 'cargo', 'general'];
const CAPSULES = ['YN', 'YNNA', 'YNNSNA'];

export default function ChecklistManager() {
  const { isDark } = useWebTheme();
  const primaryColor = "#3194A0";
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [permitName, setPermitName] = useState('New Safety Permit');
  
  // New Step Form State
  const [newStep, setNewStep] = useState({
    text: '',
    category: 'general',
    type: 'YN'
  });

  const [expandedPermit, setExpandedPermit] = useState<string | null>(null);
  
  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Step>>({});

  const colors = {
    bg: isDark ? '#0F172A' : '#F8FAFC',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F1F5F9' : '#0F172A',
    muted: isDark ? '#94A3B8' : '#64748B',
    border: isDark ? '#334155' : '#E2E8F0',
    panel: isDark ? '#0F172A' : '#F1F5F9',
    input: isDark ? '#1E293B' : '#FFFFFF'
  };

  const groupedPermits = useMemo(() => {
    return steps.reduce((acc, step) => {
      if (!acc[step.permitName]) acc[step.permitName] = [];
      acc[step.permitName].push(step);
      return acc;
    }, {} as Record<string, Step[]>);
  }, [steps]);

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Checklist Template');
    worksheet.columns = [
      { header: 'Permit_ID', key: 'id', width: 12 },
      { header: 'Permit_Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Step_Sequence', key: 'seq', width: 15 },
      { header: 'Question_Text', key: 'question', width: 50 },
      { header: 'Capsule_Type', key: 'capsule', width: 15 },
    ];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3194A0' } };
    });
    for (let i = 2; i <= 500; i++) {
      worksheet.getCell(i, 3).dataValidation = { type: 'list', formulae: [`"${CATEGORIES.join(',')}"`] };
      worksheet.getCell(i, 6).dataValidation = { type: 'list', formulae: [`"${CAPSULES.join(',')}"`] };
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'KeelSafe_Import_Template.xlsx');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      await workbook.xlsx.load(buffer);
      const ws = workbook.getWorksheet(1);
      const imported: Step[] = [];
      ws?.eachRow((row, i) => {
        if (i === 1) return;
        imported.push({
          id: `imp-${i}-${Date.now()}`,
          permitName: row.getCell(2).value?.toString() || 'Unnamed',
          category: row.getCell(3).value?.toString() || 'general',
          sequence: Number(row.getCell(4).value) || i,
          question: row.getCell(5).value?.toString() || '',
          capsuleType: row.getCell(6).value?.toString() || 'YN'
        });
      });
      setSteps([...steps, ...imported]);
    };
    reader.readAsArrayBuffer(file);
  };

  const addManualStep = () => {
    if (!newStep.text.trim()) return;
    const s: Step = { 
      id: Date.now().toString(), 
      permitName, 
      category: newStep.category, 
      sequence: (groupedPermits[permitName]?.length || 0) + 1, 
      question: newStep.text, 
      capsuleType: newStep.type 
    };
    setSteps([...steps, s]);
    setNewStep({ text: '', category: 'general', type: 'YN' });
    setExpandedPermit(permitName);
  };

  const saveEdit = (id: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...editForm } : s));
    setEditingId(null);
  };

  const startEdit = (step: Step) => {
    setEditingId(step.id);
    setEditForm(step);
  };

  return (
    <div style={styles.container}>
      {/* HUD HEADER */}
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <ListPlus size={18} color="white" />
          </div>
          <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px' }}>PERMIT MANAGER</span>
        </div>
        <div style={styles.headerActions}>
           <button onClick={downloadTemplate} style={{ ...styles.ghostBtn, color: colors.muted }}><Download size={14} /> TEMPLATE</button>
           <label style={{ ...styles.ghostBtn, color: primaryColor, cursor: 'pointer' }}>
              <Upload size={14} /> IMPORT EXCEL
              <input type="file" hidden accept=".xlsx" onChange={handleFileUpload} />
           </label>
           <button style={{ ...styles.saveBtn, backgroundColor: primaryColor }}><Save size={14} /> DEPLOY ALL</button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* LEFT: FULL CONFIGURATION PILLAR */}
        <div style={{ ...styles.configColumn, borderRightColor: colors.border }}>
          <div style={styles.section}>
            <label style={{ ...styles.label, color: colors.muted }}><Settings size={12} /> PERMIT TARGET</label>
            <input 
              style={{ ...styles.input, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={permitName}
              onChange={(e) => setPermitName(e.target.value)}
            />
          </div>

          <div style={{ ...styles.section, backgroundColor: 'rgba(49, 148, 160, 0.05)', padding: '15px', borderRadius: '10px' }}>
            <label style={{ ...styles.label, color: primaryColor }}><Plus size={12} /> CONFIGURE NEW STEP</label>
            <textarea 
              style={{ ...styles.textarea, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={newStep.text}
              onChange={(e) => setNewStep({ ...newStep, text: e.target.value })}
              placeholder="Enter safety requirement..."
            />
            <div style={styles.inputRow}>
               <select 
                  style={{ ...styles.select, backgroundColor: colors.input, color: colors.text, borderColor: colors.border, flex: 1 }}
                  value={newStep.category}
                  onChange={(e) => setNewStep({ ...newStep, category: e.target.value })}
               >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
               </select>
               <select 
                  style={{ ...styles.select, backgroundColor: colors.input, color: colors.text, borderColor: colors.border, flex: 1 }}
                  value={newStep.type}
                  onChange={(e) => setNewStep({ ...newStep, type: e.target.value })}
               >
                  {CAPSULES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <button onClick={addManualStep} style={{ ...styles.addBtn, backgroundColor: primaryColor }}>APPEND TO LIST</button>
          </div>
          
          <div style={styles.pillarHead}>DIRECTORY</div>
          <div style={styles.scrollList}>
            {Object.keys(groupedPermits).map(name => (
              <div 
                key={name} 
                onClick={() => setExpandedPermit(expandedPermit === name ? null : name)}
                style={{ ...styles.permitSummary, backgroundColor: expandedPermit === name ? 'rgba(49, 148, 160, 0.1)' : colors.input, borderColor: colors.border }}
              >
                {expandedPermit === name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span style={{ flex: 1, fontSize: '11px', fontWeight: '700', color: colors.text }}>{name}</span>
                <span style={styles.badge}>{groupedPermits[name].length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DATA MANAGEMENT CONSOLE */}
        <div style={{ ...styles.reviewPillar, backgroundColor: colors.bg }}>
           <div style={styles.pillarHead}>MANAGEMENT CONSOLE</div>
           <div style={styles.gridArea}>
              {expandedPermit && groupedPermits[expandedPermit] ? (
                 groupedPermits[expandedPermit].map((step) => (
                   <div key={step.id} style={{ ...styles.dataCard, backgroundColor: colors.card, borderColor: editingId === step.id ? primaryColor : colors.border }}>
                      <div style={styles.cardInfo}>
                         <span style={{ color: primaryColor, fontWeight: '900', fontSize: '10px' }}>STEP {step.sequence}</span>
                         
                         {editingId === step.id ? (
                           <div style={styles.editForm}>
                             <textarea 
                               style={{ ...styles.textarea, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                               value={editForm.question}
                               onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                             />
                             <div style={styles.editRow}>
                                <select 
                                  style={{ ...styles.select, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                  {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                                <select 
                                  style={{ ...styles.select, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                                  value={editForm.capsuleType}
                                  onChange={(e) => setEditForm({ ...editForm, capsuleType: e.target.value })}
                                >
                                  {CAPSULES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                           </div>
                         ) : (
                           <>
                             <p style={{ color: colors.text, fontSize: '13px', margin: '4px 0', fontWeight: '600' }}>{step.question}</p>
                             <div style={styles.tagRow}>
                                <span style={styles.miniTag}>{step.capsuleType}</span>
                                <span style={styles.miniTag}>{step.category.toUpperCase()}</span>
                             </div>
                           </>
                         )}
                      </div>
                      
                      <div style={styles.cardActions}>
                         {editingId === step.id ? (
                           <>
                             <button onClick={() => saveEdit(step.id)} style={styles.actionBtn} title="Save Changes"><Check size={18} color="#10B981" /></button>
                             <button onClick={() => setEditingId(null)} style={styles.actionBtn} title="Cancel"><X size={18} color={colors.muted} /></button>
                           </>
                         ) : (
                           <>
                             <button onClick={() => startEdit(step)} style={styles.actionBtn} title="Edit Context"><Edit2 size={16} color={primaryColor} /></button>
                             <button onClick={() => setSteps(steps.filter(s => s.id !== step.id))} style={styles.actionBtn} title="Delete Step"><Trash2 size={16} color="#E11D48" /></button>
                           </>
                         )}
                      </div>
                   </div>
                 ))
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: colors.muted, fontSize: '13px' }}>
                   Select a permit from the list to manage question logic and response types.
                </div>
              )}
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
  configColumn: { width: '340px', borderRight: '1px solid', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '10px', fontWeight: '900', letterSpacing: '1px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid', fontSize: '13px' },
  inputRow: { display: 'flex', gap: '10px', marginTop: '4px' },
  textarea: { padding: '10px', borderRadius: '6px', border: '1px solid', fontSize: '12px', minHeight: '60px', resize: 'none' },
  addBtn: { padding: '10px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '700', fontSize: '11px', cursor: 'pointer', marginTop: '8px' },
  pillarHead: { fontSize: '9px', fontWeight: '900', color: '#94A3B8', letterSpacing: '1.5px', marginTop: '10px' },
  scrollList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  permitSummary: { padding: '12px', borderRadius: '8px', border: '1px solid', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  badge: { fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.1)' },
  reviewPillar: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' },
  gridArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  dataCard: { padding: '16px', borderRadius: '8px', border: '1px solid', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', transition: '0.2s' },
  cardInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' },
  editRow: { display: 'flex', gap: '10px' },
  select: { padding: '8px', borderRadius: '6px', border: '1px solid', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  tagRow: { display: 'flex', gap: '8px' },
  miniTag: { fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.05)', opacity: 0.6 },
  cardActions: { display: 'flex', gap: '12px', marginTop: '10px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }
};