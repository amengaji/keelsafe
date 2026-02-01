// web/src/pages/ChecklistManager.tsx

import { useState, useMemo } from 'react';
import { 
  Upload, Save, Download, Plus, Settings, 
  ChevronRight, ChevronDown, Trash2, Edit2, X, Check,
  Search, Filter, MoveVertical, AlertCircle, Copy, FileSpreadsheet
} from 'lucide-react';
import { useWebTheme } from '../context/ThemeContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import axios from 'axios'; // Added for backend communication

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeploying, setIsDeploying] = useState(false); // New state for loading feedback
  
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
    input: isDark ? '#1E293B' : '#FFFFFF',
    accent: 'rgba(49, 148, 160, 0.1)'
  };

  const groupedPermits = useMemo(() => {
    return steps.reduce((acc, step) => {
      if (!acc[step.permitName]) acc[step.permitName] = [];
      acc[step.permitName].push(step);
      return acc;
    }, {} as Record<string, Step[]>);
  }, [steps]);

  const filteredDirectory = useMemo(() => {
    return Object.keys(groupedPermits).filter(name => 
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groupedPermits, searchQuery]);

  /**
   * BACKEND INTEGRATION: DEPLOY TO FLEET
   * Sends the current steps array to the Node.js API
   */
  const deployToFleet = async () => {
    if (steps.length === 0) {
      alert("No checklist data found to deploy.");
      return;
    }

    if (!window.confirm(`Deploy ${steps.length} steps to the entire fleet? This will update ship-side checklists immediately.`)) {
      return;
    }

    setIsDeploying(true);
    try {
      const response = await axios.post('http://localhost:5000/api/checklists/deploy', {
        steps: steps
      });

      if (response.data.success) {
        alert("🚀 FLEET DEPLOYMENT SUCCESSFUL: All ship tablets will sync on next heartbeat.");
      }
    } catch (error: any) {
      console.error("Deployment Failed:", error);
      alert(`❌ DEPLOYMENT FAILED: ${error.response?.data?.error || "Check backend logs."}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Checklist Template');
    
    // Add Metadata/Instructions Row
    worksheet.addRow(['INSTRUCTION: Fill the rows below. Do not change headers.']);
    worksheet.mergeCells('A1:F1');
    worksheet.getRow(1).font = { italic: true, size: 10, color: { argb: 'FF94A3B8' } };

    worksheet.getRow(2).values = ['Permit_ID', 'Permit_Name', 'Category', 'Step_Sequence', 'Question_Text', 'Capsule_Type'];
    worksheet.columns = [
      { key: 'id', width: 12 }, { key: 'name', width: 30 }, { key: 'category', width: 20 },
      { key: 'seq', width: 15 }, { key: 'question', width: 60 }, { key: 'capsule', width: 15 },
    ];

    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3194A0' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    for (let i = 3; i <= 500; i++) {
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
        if (i <= 2) return; // Skip instructions and headers
        const pName = row.getCell(2).value?.toString();
        if (!pName) return;
        imported.push({
          id: `imp-${i}-${Date.now()}`,
          permitName: pName,
          category: row.getCell(3).value?.toString() || 'general',
          sequence: Number(row.getCell(4).value) || i,
          question: row.getCell(5).value?.toString() || '',
          capsuleType: row.getCell(6).value?.toString() || 'YN'
        });
      });
      setSteps(prev => [...prev, ...imported]);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
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
    setSteps(prev => [...prev, s]);
    setNewStep({ text: '', category: 'general', type: 'YN' });
    setExpandedPermit(permitName);
  };

  const deletePermit = (name: string) => {
    if (window.confirm(`Delete all ${groupedPermits[name].length} steps for ${name}?`)) {
      setSteps(prev => prev.filter(s => s.permitName !== name));
      if (expandedPermit === name) setExpandedPermit(null);
    }
  };

  const saveEdit = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...editForm } : s));
    setEditingId(null);
  };

  const startEdit = (step: Step) => {
    setEditingId(step.id);
    setEditForm(step);
  };

  return (
    <div style={styles.container}>
      {/* HUD HEADER */}
      <div style={{ ...styles.hudHeader, borderBottomColor: colors.border, backgroundColor: colors.card }}>
        <div style={styles.brand}>
          <div style={{ ...styles.iconBox, backgroundColor: primaryColor }}>
            <FileSpreadsheet size={18} color="white" />
          </div>
          <div>
            <span style={{ color: colors.text, fontWeight: '900', fontSize: '14px', display: 'block' }}>PERMIT ARCHITECT</span>
            <span style={{ color: colors.muted, fontSize: '10px', fontWeight: '700' }}>v2.4 SHORE CONSOLE</span>
          </div>
        </div>
        <div style={styles.headerActions}>
           <button onClick={downloadTemplate} style={{ ...styles.ghostBtn, color: colors.muted }}>
             <Download size={14} /> TEMPLATE
           </button>
           <label style={{ ...styles.ghostBtn, color: primaryColor, cursor: 'pointer', border: `1px solid ${primaryColor}`, padding: '4px 12px', borderRadius: '4px' }}>
              <Upload size={14} /> IMPORT EXCEL
              <input type="file" hidden accept=".xlsx" onChange={handleFileUpload} />
           </label>
           <button 
             onClick={deployToFleet}
             disabled={isDeploying}
             style={{ ...styles.saveBtn, backgroundColor: primaryColor, opacity: isDeploying ? 0.6 : 1 }}
           >
             <Save size={14} /> {isDeploying ? 'DEPLOYING...' : 'DEPLOY TO FLEET'}
           </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* LEFT: CONFIGURATION PILLAR */}
        <div style={{ ...styles.configColumn, borderRightColor: colors.border, backgroundColor: colors.card }}>
          
          <div style={styles.section}>
            <label style={{ ...styles.label, color: colors.muted }}><Filter size={12} /> ACTIVE PROJECT</label>
            <div style={{ position: 'relative' }}>
              <input 
                style={{ ...styles.input, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, width: '100%' }}
                value={permitName}
                onChange={(e) => setPermitName(e.target.value)}
                placeholder="Permit Name (e.g. Hot Work)"
              />
              <Settings size={14} style={{ position: 'absolute', right: 10, top: 12, color: colors.muted }} />
            </div>
          </div>

          <div style={{ ...styles.section, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(49, 148, 160, 0.05)', padding: '15px', borderRadius: '12px', border: `1px dashed ${primaryColor}` }}>
            <label style={{ ...styles.label, color: primaryColor }}><Plus size={12} /> QUICK ADD STEP</label>
            <textarea 
              style={{ ...styles.textarea, backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
              value={newStep.text}
              onChange={(e) => setNewStep({ ...newStep, text: e.target.value })}
              placeholder="E.g. Is the area free of combustible materials?"
            />
            <div style={styles.inputRow}>
               <select 
                  style={{ ...styles.select, backgroundColor: colors.input, color: colors.text, borderColor: colors.border, flex: 1 }}
                  value={newStep.category}
                  onChange={(e) => setNewStep({ ...newStep, category: e.target.value })}
               >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase().replace('_', ' ')}</option>)}
               </select>
               <select 
                  style={{ ...styles.select, backgroundColor: colors.input, color: colors.text, borderColor: colors.border, flex: 1 }}
                  value={newStep.type}
                  onChange={(e) => setNewStep({ ...newStep, type: e.target.value })}
               >
                  {CAPSULES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
            <button onClick={addManualStep} style={{ ...styles.addBtn, backgroundColor: primaryColor }}>ADD TO {permitName.toUpperCase()}</button>
          </div>
          
          <div style={styles.pillarHead}>
            <span>DIRECTORY ({filteredDirectory.length})</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: 11, color: colors.muted }} />
            <input 
              placeholder="Search permits..." 
              style={{ ...styles.input, paddingLeft: '30px', fontSize: '11px', height: '32px', width: '100%', backgroundColor: colors.bg }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={styles.scrollList}>
            {filteredDirectory.map(name => (
              <div key={name} style={styles.directoryWrapper}>
                <div 
                  onClick={() => setExpandedPermit(expandedPermit === name ? null : name)}
                  style={{ 
                    ...styles.permitSummary, 
                    backgroundColor: expandedPermit === name ? colors.accent : colors.input, 
                    borderColor: expandedPermit === name ? primaryColor : colors.border 
                  }}
                >
                  {expandedPermit === name ? <ChevronDown size={14} color={primaryColor} /> : <ChevronRight size={14} />}
                  <span style={{ flex: 1, fontSize: '11px', fontWeight: '800', color: colors.text }}>{name}</span>
                  <span style={{ ...styles.badge, color: primaryColor }}>{groupedPermits[name].length}</span>
                </div>
                {expandedPermit === name && (
                   <button onClick={() => deletePermit(name)} style={styles.miniDelete}><Trash2 size={12} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DATA MANAGEMENT CONSOLE */}
        <div style={{ ...styles.reviewPillar, backgroundColor: colors.bg }}>
            <div style={styles.consoleHeader}>
              <div style={styles.pillarHead}>
                {expandedPermit ? `EDITING: ${expandedPermit.toUpperCase()}` : 'SELECT A PERMIT TO VIEW SEQUENCE'}
              </div>
              {expandedPermit && (
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button style={styles.toolBtn} onClick={() => window.alert("Re-sequencing logic triggered")}><MoveVertical size={14} /> REORDER</button>
                   <button style={styles.toolBtn}><Copy size={14} /> DUPLICATE</button>
                </div>
              )}
            </div>

            <div style={styles.gridArea}>
              {expandedPermit && groupedPermits[expandedPermit] ? (
                 groupedPermits[expandedPermit].map((step, idx) => (
                   <div key={step.id} style={{ ...styles.dataCard, backgroundColor: colors.card, borderColor: editingId === step.id ? primaryColor : colors.border }}>
                      <div style={styles.cardInfo}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: primaryColor, fontWeight: '900', fontSize: '10px', letterSpacing: '1px' }}>
                              STEP {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: colors.border }} />
                            <span style={{ fontSize: '9px', fontWeight: '800', color: colors.muted }}>ID: {step.id.slice(-5)}</span>
                         </div>
                         
                         {editingId === step.id ? (
                           <div style={styles.editForm}>
                             <textarea 
                               style={{ ...styles.textarea, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, fontSize: '13px' }}
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
                             <p style={{ color: colors.text, fontSize: '14px', margin: '8px 0', fontWeight: '500', lineHeight: '1.5' }}>
                               {step.question}
                             </p>
                             <div style={styles.tagRow}>
                                <span style={{ ...styles.miniTag, color: primaryColor, backgroundColor: colors.accent }}>
                                  <Check size={8} style={{ marginRight: 4 }} />{step.capsuleType}
                                </span>
                                <span style={{ ...styles.miniTag }}>
                                  <Settings size={8} style={{ marginRight: 4 }} />{step.category.toUpperCase()}
                                </span>
                             </div>
                           </>
                         )}
                      </div>
                      
                      <div style={styles.cardActions}>
                         {editingId === step.id ? (
                           <>
                             <button onClick={() => saveEdit(step.id)} style={styles.saveActionBtn}><Check size={16} /> SAVE</button>
                             <button onClick={() => setEditingId(null)} style={styles.cancelActionBtn}><X size={16} /></button>
                           </>
                         ) : (
                           <>
                             <button onClick={() => startEdit(step)} style={styles.actionBtn}><Edit2 size={16} color={primaryColor} /></button>
                             <button onClick={() => setSteps(steps.filter(s => s.id !== step.id))} style={styles.actionBtn}><Trash2 size={16} color="#E11D48" /></button>
                           </>
                         )}
                      </div>
                   </div>
                 ))
              ) : (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><AlertCircle size={40} /></div>
                    <h3 style={{ color: colors.text, fontWeight: '800', marginBottom: '8px' }}>No Permit Selected</h3>
                    <p style={{ color: colors.muted, maxWidth: '300px', margin: '0 auto' }}>
                      Select a template from the directory on the left or use the <strong>Active Project</strong> input to start building.
                    </p>
                    <button onClick={downloadTemplate} style={styles.outlineBtn}>DOWNLOAD HELP DOCUMENTATION</button>
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
  hudHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', borderBottom: '1px solid', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 10 },
  brand: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconBox: { padding: '10px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  headerActions: { display: 'flex', gap: '20px', alignItems: 'center' },
  ghostBtn: { background: 'none', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s opacity' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 24px', borderRadius: '6px', border: 'none', color: 'white', fontWeight: '900', fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 148, 160, 0.3)' },
  mainContent: { flex: 1, display: 'flex', minHeight: 0 },
  configColumn: { width: '360px', borderRight: '1px solid', padding: '25px', display: 'flex', flexDirection: 'column', gap: '25px', overflowY: 'auto' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '10px', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' },
  inputRow: { display: 'flex', gap: '10px', marginTop: '5px' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid', fontSize: '13px', minHeight: '80px', resize: 'none', outline: 'none', lineHeight: '1.4' },
  addBtn: { padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: '800', fontSize: '11px', cursor: 'pointer', marginTop: '10px', letterSpacing: '0.5px' },
  pillarHead: { fontSize: '10px', fontWeight: '900', color: '#94A3B8', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scrollList: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  directoryWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  permitSummary: { flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s transform' },
  badge: { fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(49, 148, 160, 0.1)' },
  miniDelete: { position: 'absolute', right: '-10px', top: '-5px', backgroundColor: '#E11D48', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  reviewPillar: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' },
  consoleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toolBtn: { background: 'none', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' },
  gridArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px' },
  dataCard: { padding: '20px', borderRadius: '12px', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '30px', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' },
  cardInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', width: '100%' },
  editRow: { display: 'flex', gap: '15px' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '12px', fontWeight: '800', cursor: 'pointer', outline: 'none' },
  tagRow: { display: 'flex', gap: '10px', marginTop: '5px' },
  miniTag: { fontSize: '9px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center' },
  cardActions: { display: 'flex', gap: '15px', alignItems: 'center' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', transition: '0.2s background' },
  saveActionBtn: { backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  cancelActionBtn: { backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.8 },
  emptyIcon: { color: '#3194A0', marginBottom: '20px', opacity: 0.3 },
  outlineBtn: { marginTop: '30px', backgroundColor: 'transparent', border: '2px solid #3194A0', color: '#3194A0', padding: '12px 24px', borderRadius: '30px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }
};