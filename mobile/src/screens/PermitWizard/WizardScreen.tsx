// mobile/src/screens/PermitWizard/WizardScreen.tsx

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, ProgressBar, Chip, useTheme, Divider, Surface, Icon, IconButton, Modal as PaperModal, Portal } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, GasEntry, WorkType, GasLog, IsolationPoint } from '../../types/permitTypes';

// Context
import { usePermits } from '../../context/PermitContext';

// Components
import SimopsWarning from '../../components/common/SimopsWarning';
import YesNoCapsule from '../../components/common/YesNoCapsule';
import CheckboxBox from '../../components/common/CheckboxBox'; 
import TimeInputField from '../../components/inputs/TimeInputField';
import GasTable from '../../components/common/GasTable'; 
import PinPad from '../../components/common/PinPad';

import { WORK_TYPES } from '../../constants/permitData';
import { HAZARD_DATABASE } from '../../constants/hazardsData';
import { CREW_DATABASE, CrewMember } from '../../constants/crewData'; 

type Props = NativeStackScreenProps<RootStackParamList, 'PermitWizard'>;

const DEPARTMENTS = ['Deck', 'Engine', 'Catering', 'Electrical'];
const RANKS = ['Master', 'Chief Officer', 'Chief Engineer', '2nd Engineer'];

// DEFAULT MANDATORY GASES
const DEFAULT_GASES: GasEntry[] = [
    { id: 'o2', name: 'O2', tlv: '20.9', unit: '%', top: '', mid: '', bot: '', isCustom: false },
    { id: 'h2s', name: 'H2S', tlv: '10', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'co', name: 'CO', tlv: '25', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'co2', name: 'CO2', tlv: '5000', unit: 'ppm', top: '', mid: '', bot: '', isCustom: false },
    { id: 'ch4_vol', name: 'CH4 (Vol)', tlv: '0', unit: '%', top: '', mid: '', bot: '', isCustom: false },
    { id: 'ch4_lel', name: 'CH4 (LEL)', tlv: '0', unit: '%', top: '', mid: '', bot: '', isCustom: false },
];

export default function WizardScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { createPermit } = usePermits(); 
  
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1: Info
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('15');
  const [duration, setDuration] = useState('8');

  // Step 2: Work Types
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);

  // Step 3: Roles & Risks
  const [attendant, setAttendant] = useState(''); 
  const [fireWatch, setFireWatch] = useState(''); 
  const [rescueTeam, setRescueTeam] = useState<string[]>([]);
  const [fireFightingTeam, setFireFightingTeam] = useState<string[]>([]); 
  const [checklistResponses, setChecklistResponses] = useState<Record<string, boolean>>({});

  // Step 4: Gas & Iso
  const [gasTestTime, setGasTestTime] = useState<Date | null>(new Date());
  const [gasEntries, setGasEntries] = useState<GasEntry[]>(DEFAULT_GASES);
  const [gasLogs, setGasLogs] = useState<GasLog[]>([]);
  const [isolations, setIsolations] = useState<IsolationPoint[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newEquip, setNewEquip] = useState('');
  
  const [selectedHistoryLog, setSelectedHistoryLog] = useState<GasLog | null>(null);

  // Step 5: Auth
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [showPinPad, setShowPinPad] = useState(false);

  // Logic
  const isEnclosed = selectedWorkTypes.includes('enclosed_space');
  const isHotWork = selectedWorkTypes.includes('hot_work');
  const showGasSection = isEnclosed || isHotWork; 
  const showLotoSection = selectedWorkTypes.includes('electrical') || isHotWork; 
  const gasRefText = isEnclosed ? "Ref: MSC.581(110)" : "Ref: ISGOTT 11.4";

  // --- HELPERS ---
  const getDisplayDuration = () => { const val = parseFloat(duration); return (isNaN(val) || duration === '') ? '8' : duration; };
  const getCalculatedDuration = () => { const val = parseFloat(duration); return (isNaN(val) || val <= 0) ? 8 : val; };

  // --- HANDLERS ---
  
  // NEW: Clamp Duration on Blur
  const handleDurationBlur = () => {
      const val = parseFloat(duration);
      if (!isNaN(val) && val > 8) {
          setDuration('8'); // Snap back to max limit
          Alert.alert("Limit Reached", "Maximum permit duration is 8 hours.");
      }
  };

  const isCrewAvailable = (name: string, context: 'attendant' | 'fireWatch' | 'rescue' | 'fireTeam') => {
      if (context !== 'attendant' && attendant === name) return false;
      if (context !== 'fireWatch' && fireWatch === name) return false;
      if (context !== 'rescue' && rescueTeam.includes(name)) return false;
      if (context !== 'fireTeam' && fireFightingTeam.includes(name)) return false;
      return true;
  };

  const getCrewCurrentRole = (name: string): string | null => {
      if (attendant === name) return 'Attendant';
      if (fireWatch === name) return 'Fire Watch';
      if (rescueTeam.includes(name)) return 'Rescue Team';
      if (fireFightingTeam.includes(name)) return 'Fire Fighting Team';
      return null;
  };

  const handleCrewSelection = (name: string, targetRole: 'attendant' | 'fireWatch' | 'rescue' | 'fireTeam') => {
      const currentRole = getCrewCurrentRole(name);

      // Case 1: Deselecting (Removing from current role)
      if (targetRole === 'attendant' && attendant === name) { setAttendant(''); return; }
      if (targetRole === 'fireWatch' && fireWatch === name) { setFireWatch(''); return; }
      if (targetRole === 'rescue' && rescueTeam.includes(name)) { 
          setRescueTeam(prev => prev.filter(n => n !== name)); return; 
      }
      if (targetRole === 'fireTeam' && fireFightingTeam.includes(name)) { 
          setFireFightingTeam(prev => prev.filter(n => n !== name)); return; 
      }

      // Case 2: Already has a DIFFERENT role -> Block it
      if (currentRole) {
          Alert.alert("Crew Unavailable", `${name} is already assigned as ${currentRole}. Deselect them from that role first.`);
          return;
      }

      // Case 3: Assigning new role
      if (targetRole === 'attendant') setAttendant(name);
      if (targetRole === 'fireWatch') setFireWatch(name);
      if (targetRole === 'rescue') setRescueTeam(prev => [...prev, name]);
      if (targetRole === 'fireTeam') setFireFightingTeam(prev => [...prev, name]);
  };

  const toggleRescueMember = (name: string) => handleCrewSelection(name, 'rescue'); // Legacy wrapper for compatibility if needed
  const toggleFireTeamMember = (name: string) => handleCrewSelection(name, 'fireTeam'); // Legacy wrapper

  const toggleWorkType = (id: string) => { const typeId = id as WorkType; if (selectedWorkTypes.includes(typeId)) setSelectedWorkTypes(prev => prev.filter(t => t !== typeId)); else setSelectedWorkTypes(prev => [...prev, typeId]); };
  const handleChecklistChange = (req: string, val: boolean) => setChecklistResponses(prev => ({ ...prev, [req]: val }));
  const updateGasEntry = (id: string, field: keyof GasEntry, value: string) => setGasEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  const addCustomGas = () => setGasEntries(prev => [...prev, { id: `custom_${Date.now()}`, name: '', tlv: '0', unit: 'ppm', top: '', mid: '', bot: '', isCustom: true }]);
  
  const isFormSafe = useMemo(() => !gasEntries.some(g => {
      const check = (val: string, tlv: string, id: string) => { if(!val) return false; const v = parseFloat(val); const t = parseFloat(tlv); if(isNaN(v)) return false; if(id === 'o2') return v < 20.9 || v > 23.5; if(!isNaN(t) && t > 0) return v > t; return false; }
      return check(g.top, g.tlv, g.id) || check(g.mid, g.tlv, g.id) || check(g.bot, g.tlv, g.id);
  }), [gasEntries]);
  
  const isFormEmpty = useMemo(() => gasEntries.some(g => !g.isCustom && (!g.top || !g.mid || !g.bot)), [gasEntries]);
  
  const recordGasReading = () => {
      if (!gasTestTime) return Alert.alert("Time Required", "Please select a time.");
      const newLog: GasLog = { id: Date.now().toString(), timestamp: gasTestTime, performedBy: "Draft User", readings: JSON.parse(JSON.stringify(gasEntries)), isSafe: isFormSafe };
      setGasLogs(prev => [newLog, ...prev]);
  };

  const addIsolation = () => { if (newEquip) { setIsolations(prev => [...prev, { id: Date.now().toString(), tagNumber: newTag, equipment: newEquip, location: location, method: 'Lock', status: 'Isolated', isolatedBy: 'Draft User', isolatedAt: new Date() }]); setNewTag(''); setNewEquip(''); } };
  const removeIsolation = (id: string) => setIsolations(prev => prev.filter(i => i.id !== id));
  
  const combinedData = useMemo(() => {
    const hazards = new Set<string>(); const ppe = new Set<string>(); const requirements = new Set<string>();
    selectedWorkTypes.forEach(typeId => { const entry = HAZARD_DATABASE.find(h => h.workTypeId === typeId); if (entry) { entry.hazards.forEach(h => hazards.add(h)); entry.ppe.forEach(p => ppe.add(p)); entry.requirements.forEach(r => requirements.add(r)); } });
    if (selectedWorkTypes.length > 0) { const general = HAZARD_DATABASE.find(h => h.workTypeId === 'general'); if (general) { general.hazards.forEach(h => hazards.add(h)); general.ppe.forEach(p => ppe.add(p)); general.requirements.forEach(r => requirements.add(r)); } }
    return { hazards: Array.from(hazards), ppe: Array.from(ppe), requirements: Array.from(requirements) };
  }, [selectedWorkTypes]);

  const canProceed = () => {
    if (step === 1) return department && location.length > 2 && description.length > 5;
    if (step === 2) return selectedWorkTypes.length > 0;
    if (step === 3) {
        const checklistDone = combinedData.requirements.every(req => checklistResponses[req] !== undefined);
        const attendantSet = isEnclosed ? attendant.length > 0 : true;
        const fireWatchSet = isHotWork ? fireWatch.length > 0 : true;
        const rescueSet = isEnclosed ? (rescueTeam.length > 0 && rescueTeam.length % 2 === 0) : true;
        const fireTeamSet = isHotWork ? (fireFightingTeam.length > 0 && fireFightingTeam.length % 2 === 0) : true;
        return checklistDone && attendantSet && fireWatchSet && rescueSet && fireTeamSet;
    }
    if (step === 4) return showGasSection ? (gasLogs.length > 0 && gasLogs[0].isSafe) : true;
    if (step === 5) return declarationAccepted;
    return true;
  };

  const handleMainButton = () => { if (step === TOTAL_STEPS) setShowPinPad(true); else setStep(step + 1); };

  const handlePinSuccess = (user: CrewMember) => {
      setShowPinPad(false);
      const newPermitId = `PTW-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const now = new Date();
      const validityHours = getCalculatedDuration(); 
      const expiresAt = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

      createPermit({
            id: Date.now().toString(),
            permitId: newPermitId,
            status: 'Active',
            createdAt: now,
            updatedAt: now,
            validFrom: now,
            expiresAt: expiresAt,
            version: 1,
            location,
            workTypes: selectedWorkTypes,
            description,
            checkFrequency: parseInt(frequency) || 15,
            personnelCount: 0,
            attendant,
            fireWatch, 
            rescueTeam: isEnclosed ? rescueTeam : [], 
            fireFightingTeam: isHotWork ? fireFightingTeam : [], 
            gasConfig: showGasSection ? gasEntries : [],
            gasLogs: showGasSection ? gasLogs : [], 
            isolations: isolations,
            signatures: [{ role: 'Issuing Authority', name: user.name, signedAt: now, digitalHash: `PIN_VERIFIED_${user.id}_${now.getTime()}` }],
            entryLogs: [],
            safetyCheckLogs: []
      });

      setTimeout(() => { Alert.alert("Permit Issued", `Signed by: ${user.name} (${user.rank})\nPermit ${newPermitId} is Active.`, [{ text: "Go to Dashboard", onPress: () => navigation.navigate('MainTabs' as any) }]); }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={step / TOTAL_STEPS} color={theme.colors.primary} style={{ height: 4 }} />
      <View style={styles.stepHeader}><Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Step {step}: {getStepTitle(step)}</Text><Text variant="bodySmall">Step {step} of {TOTAL_STEPS}</Text></View>
      <Divider />

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (<View><TextInput mode="outlined" label="Specific Location *" value={location} onChangeText={setLocation} style={styles.input} /><SimopsWarning currentLocation={location} /><TextInput mode="outlined" label="Description of Work *" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={styles.input} /><Divider style={{ marginVertical: 16 }} /><Text variant="labelLarge" style={styles.label}>Department</Text><View style={styles.chipRow}>{DEPARTMENTS.map(dept => (<Chip key={dept} selected={department === dept} onPress={() => setDepartment(dept)} style={styles.chip} showSelectedOverlay>{dept}</Chip>))}</View>
            <View style={{flexDirection: 'row', gap: 16}}>
                <TextInput 
                    mode="outlined" 
                    label="Duration (Hours)" 
                    value={duration} 
                    onChangeText={setDuration} 
                    onBlur={handleDurationBlur} // <--- ATTACHED BLUR HANDLER
                    keyboardType="numeric" 
                    style={[styles.input, {flex: 1}]} 
                    right={<TextInput.Affix text="hrs" />} 
                />
                <TextInput mode="outlined" label="Check Freq (Mins)" value={frequency} onChangeText={setFrequency} keyboardType="number-pad" style={[styles.input, {flex: 1}]} right={<TextInput.Affix text="min" />} />
            </View>
        </View>)}
        {step === 2 && (<View><Text style={styles.helperText}>Select all types of work involved.</Text><View style={styles.grid}>{WORK_TYPES.map((type) => { const isSelected = selectedWorkTypes.includes(type.id as WorkType); return (<Surface key={type.id} style={[styles.card, { backgroundColor: isSelected ? (type.isCritical ? '#FFEBEE' : '#E0F2F1') : theme.colors.surface, borderWidth: isSelected ? 2 : 0, borderColor: isSelected ? (type.isCritical ? theme.colors.error : theme.colors.primary) : 'transparent' }]} elevation={1}><TouchableOpacity onPress={() => toggleWorkType(type.id)} style={styles.cardTouch}><Icon source={type.icon} size={32} color={type.isCritical ? theme.colors.error : theme.colors.primary} /><Text variant="labelLarge" style={styles.cardTitle}>{type.label}</Text>{type.isCritical && <View style={styles.criticalBadge}><Text style={styles.badgeText}>CRITICAL</Text></View>}</TouchableOpacity></Surface>); })}</View></View>)}
        
        {step === 3 && (
            <View>
                <Surface style={styles.sectionCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Required Personnel</Text>
                    
                    {/* Attendant (Enclosed Space) */}
                    {isEnclosed && (
                        <>
                            <Text style={styles.label}>Attendant (Entrance Standby)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                                {CREW_DATABASE.map(c => {
                                    const role = getCrewCurrentRole(c.name);
                                    const isSelected = attendant === c.name;
                                    // Disable if they have a role AND it's not this one
                                    const disabled = !!role && !isSelected;
                                    
                                    return (
                                        <Chip 
                                            key={c.id} 
                                            selected={isSelected} 
                                            onPress={() => handleCrewSelection(c.name, 'attendant')} 
                                            disabled={disabled} 
                                            style={[styles.chip, { opacity: disabled ? 0.4 : 1 }]} 
                                            showSelectedOverlay
                                        >
                                            {c.name}
                                        </Chip>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                    {/* Fire Watch (Hot Work) */}
                    {isHotWork && (
                        <>
                            <Text style={styles.label}>Fire Watch (Spark Watch)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                                {CREW_DATABASE.map(c => {
                                    const role = getCrewCurrentRole(c.name);
                                    const isSelected = fireWatch === c.name;
                                    const disabled = !!role && !isSelected;

                                    return (
                                        <Chip 
                                            key={c.id} 
                                            selected={isSelected} 
                                            onPress={() => handleCrewSelection(c.name, 'fireWatch')} 
                                            disabled={disabled}
                                            style={[styles.chip, { opacity: disabled ? 0.4 : 1 }]} 
                                            showSelectedOverlay
                                        >
                                            {c.name}
                                        </Chip>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                    {/* Rescue Team (Pairs) */}
                    {isEnclosed && (
                        <>
                            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                <Text style={styles.label}>Rescue Team (Must be pairs)</Text>
                                <Text style={{color: rescueTeam.length > 0 && rescueTeam.length % 2 !== 0 ? theme.colors.error : theme.colors.primary, fontWeight:'bold'}}>{rescueTeam.length} Selected</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                                {CREW_DATABASE.map(c => {
                                    const role = getCrewCurrentRole(c.name);
                                    const isSelected = rescueTeam.includes(c.name);
                                    const disabled = !!role && !isSelected;

                                    return (
                                        <Chip 
                                            key={c.id} 
                                            selected={isSelected} 
                                            onPress={() => handleCrewSelection(c.name, 'rescue')} 
                                            disabled={disabled}
                                            style={[styles.chip, { opacity: disabled ? 0.4 : 1 }]} 
                                            showSelectedOverlay
                                        >
                                            {c.name}
                                        </Chip>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                    {/* Fire Fighting Team (Pairs) */}
                    {isHotWork && (
                        <>
                            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                <Text style={styles.label}>Fire Fighting Team (Must be pairs)</Text>
                                <Text style={{color: fireFightingTeam.length > 0 && fireFightingTeam.length % 2 !== 0 ? theme.colors.error : theme.colors.primary, fontWeight:'bold'}}>{fireFightingTeam.length} Selected</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                                {CREW_DATABASE.map(c => {
                                    const role = getCrewCurrentRole(c.name);
                                    const isSelected = fireFightingTeam.includes(c.name);
                                    const disabled = !!role && !isSelected;

                                    return (
                                        <Chip 
                                            key={c.id} 
                                            selected={isSelected} 
                                            onPress={() => handleCrewSelection(c.name, 'fireTeam')} 
                                            disabled={disabled}
                                            style={[styles.chip, { opacity: disabled ? 0.4 : 1 }]} 
                                            showSelectedOverlay
                                        >
                                            {c.name}
                                        </Chip>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                </Surface>
                <Text variant="titleMedium" style={styles.sectionTitle}>Identified Hazards</Text>
                <View style={styles.chipRow}>{combinedData.hazards.map(h => <Chip key={h} icon="alert" style={{ backgroundColor: '#FFF3E0' }}>{h}</Chip>)}</View>
                <Text variant="titleMedium" style={styles.sectionTitle}>Required PPE</Text>
                <View style={styles.chipRow}>{combinedData.ppe.map(p => <Chip key={p} icon="account-hard-hat" style={{ backgroundColor: '#E3F2FD' }}>{p}</Chip>)}</View>
                <Divider style={{ marginVertical: 16 }} />
                <Text variant="titleMedium" style={styles.sectionTitle}>Safety Checklist</Text>
                {combinedData.requirements.map((req, index) => (<View key={index} style={[styles.checkRow, { borderBottomColor: theme.colors.outline }]}><Text style={styles.checkText}>{req}</Text><YesNoCapsule value={checklistResponses[req]} onChange={(val) => handleChecklistChange(req, val)} /></View>))}
            </View>
        )}
        
        {step === 4 && (<View>
            {showGasSection ? (<Surface style={styles.sectionCard} elevation={1}><View style={styles.cardHeaderRow}><Icon source="gas-cylinder" size={24} color={theme.colors.primary} /><View style={{ marginLeft: 8 }}><Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Atmosphere Tests</Text><Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{gasRefText}</Text></View></View><View style={{ marginBottom: 16 }}><TimeInputField label="Time of Reading" value={gasTestTime} onChange={setGasTestTime} required /></View><View style={{ marginTop: 8 }}><GasTable entries={gasEntries} onUpdate={updateGasEntry} /></View><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}><Button mode="outlined" icon="plus" onPress={addCustomGas} compact>Add Gas</Button><Button mode="contained" icon="content-save" onPress={recordGasReading} disabled={isFormEmpty} buttonColor={!isFormSafe ? theme.colors.error : theme.colors.primary}>{!isFormSafe ? "Record Unsafe" : "Record Safe"}</Button></View>
            {gasLogs.length > 0 && (<View style={{ marginTop: 16 }}><Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Readings History</Text>{gasLogs.map((log) => (
                <TouchableOpacity key={log.id} onPress={() => setSelectedHistoryLog(log)}>
                    <Surface style={[styles.logItem, { borderLeftColor: log.isSafe ? '#4CAF50' : theme.colors.error }]} elevation={1}><View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center'}}><Text style={{fontWeight: 'bold'}}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text><Chip compact icon={log.isSafe ? "check" : "alert-circle"} style={{ backgroundColor: log.isSafe ? '#E8F5E9' : '#FFEBEE' }} textStyle={{ fontSize: 11, color: log.isSafe ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>{log.isSafe ? "SAFE" : "UNSAFE"}</Chip></View><Text variant="labelSmall" style={{color: theme.colors.primary}}>Tap to view details</Text></Surface>
                </TouchableOpacity>
            ))}</View>)}</Surface>) : (<View style={{padding: 24, alignItems:'center', opacity:0.6, marginBottom: 24}}><Icon source="gas-cylinder" size={48} color={theme.colors.surfaceDisabled} /><Text style={{marginTop:12, fontWeight:'bold', color: theme.colors.onSurfaceDisabled}}>No Atmospheric Tests Required</Text></View>)}
            {showLotoSection && (<Surface style={styles.sectionCard} elevation={1}><View style={styles.cardHeaderRow}><Icon source="lock-outline" size={24} color={theme.colors.secondary} /><Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: 'bold' }}>Isolation (LOTO)</Text></View><View style={styles.lotoForm}><TextInput mode="outlined" label="Tag No." value={newTag} onChangeText={setNewTag} style={{ flex: 1 }} /><TextInput mode="outlined" label="Equipment" value={newEquip} onChangeText={setNewEquip} style={{ flex: 2 }} /><IconButton icon="plus-circle" size={32} iconColor={theme.colors.primary} onPress={addIsolation} disabled={!newEquip} /></View>{isolations.map((iso) => (<View key={iso.id} style={styles.lotoItem}><View style={{ flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Tag: {iso.tagNumber || 'N/A'}</Text><Text variant="bodySmall">{iso.equipment}</Text></View><IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={() => removeIsolation(iso.id)} /></View>))}</Surface>)}</View>)}
        
        {step === 5 && (<View><Surface style={styles.sectionCard} elevation={1}><Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16 }}>Permit Summary</Text><View style={styles.summaryRow}><Icon source="map-marker" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>{location} ({department})</Text></View><View style={styles.summaryRow}><Icon source="briefcase" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>{selectedWorkTypes.map(id => id.replace('_', ' ').toUpperCase()).join(', ')}</Text></View><View style={styles.summaryRow}><Icon source="clock-outline" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>Valid for {getDisplayDuration()} Hours</Text></View><View style={styles.summaryRow}><Icon source="account-hard-hat" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>{attendant ? `Attendant: ${attendant}` : ''} {fireWatch ? ` | Fire Watch: ${fireWatch}` : ''}</Text></View>{showGasSection && gasLogs.length > 0 && (<View style={[styles.summaryRow, { marginTop: 8 }]}><Icon source="check-circle" size={20} color="green" /><Text style={{ marginLeft: 8, color: 'green', fontWeight: 'bold' }}>Atmosphere Verified SAFE</Text></View>)}</Surface><Text variant="titleMedium" style={styles.sectionTitle}>Authorization</Text><View style={{alignItems:'center', padding:24, backgroundColor:'#E3F2FD', borderRadius:8}}><Icon source="shield-lock" size={48} color={theme.colors.primary} /><Text style={{textAlign:'center', marginTop:12, opacity:0.7}}>Digital Signature Required.{"\n"}Please prepare your 4-digit PIN.</Text></View><Divider style={{ marginVertical: 16 }} /><View style={styles.declarationBox}><View style={{flexDirection: 'row', alignItems: 'flex-start'}}><CheckboxBox checked={declarationAccepted} onPress={() => setDeclarationAccepted(!declarationAccepted)} /><Text style={{ marginLeft: 12, flex: 1, lineHeight: 20 }}>I hereby certify that I have examined the location and equipment, and satisfied myself that all necessary precautions have been taken. The work is authorized to commence.</Text></View></View></View>)}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline, paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <Button mode="outlined" onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)} style={{ flex: 1, marginRight: 8 }}>{step === 1 ? "Cancel" : "Back"}</Button>
        <Button mode="contained" onPress={handleMainButton} disabled={!canProceed()} style={{ flex: 2 }}>{step === TOTAL_STEPS ? "Sign & Issue" : "Next Step"}</Button>
      </View>

      <PinPad 
        visible={showPinPad} 
        onDismiss={() => setShowPinPad(false)} 
        onSuccess={handlePinSuccess}
        title="Authorize Permit"
        requiredRank={['Master', 'Chief Officer', 'Chief Engineer']} 
      />

      <Portal>
          <PaperModal visible={!!selectedHistoryLog} onDismiss={() => setSelectedHistoryLog(null)} contentContainerStyle={{backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8}}>
              <Text variant="headlineSmall" style={{marginBottom: 16, fontWeight:'bold'}}>Reading Details</Text>
              {selectedHistoryLog && (
                  <>
                    <View style={{marginBottom:16}}>
                        <Text>Time: {new Date(selectedHistoryLog.timestamp).toLocaleTimeString()}</Text>
                        <Text>Status: {selectedHistoryLog.isSafe ? 'SAFE' : 'UNSAFE'}</Text>
                    </View>
                    <GasTable entries={selectedHistoryLog.readings} onUpdate={() => {}} readOnly />
                  </>
              )}
              <Button mode="contained" style={{marginTop: 16}} onPress={() => setSelectedHistoryLog(null)}>Close</Button>
          </PaperModal>
      </Portal>

    </View>
  );
}

function getStepTitle(step: number) { switch(step) { case 1: return "Info"; case 2: return "Work Types"; case 3: return "Planning"; case 4: return "Safe State"; case 5: return "Auth"; default: return ""; } }

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepHeader: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  content: { padding: 16 },
  label: { marginBottom: 8, opacity: 0.7, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { marginBottom: 4 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  footer: { padding: 16, flexDirection: 'row', borderTopWidth: 1 },
  helperText: { marginBottom: 16, opacity: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', borderRadius: 12, overflow: 'hidden' },
  cardTouch: { padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 110 },
  cardTitle: { marginTop: 12, textAlign: 'center' },
  criticalBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#B00020', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  sectionTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 12 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  checkText: { flex: 1, marginRight: 16, fontSize: 14 },
  sectionCard: { padding: 16, borderRadius: 12, marginBottom: 24, backgroundColor: '#FFF' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lotoForm: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  lotoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 8, borderRadius: 8, marginBottom: 8 },
  logItem: { padding: 12, borderLeftWidth: 4, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  hzScroll: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  declarationBox: { backgroundColor: '#F5F5F5', padding: 16, borderRadius: 8, marginBottom: 16 }
});