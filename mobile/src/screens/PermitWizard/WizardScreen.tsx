// mobile/src/screens/PermitWizard/WizardScreen.tsx

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, ProgressBar, Chip, useTheme, Divider, Surface, Icon, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, GasEntry, WorkType } from '../../types/permitTypes';

// Context
import { usePermits } from '../../context/PermitContext';

// Components
import SimopsWarning from '../../components/common/SimopsWarning';
import YesNoCapsule from '../../components/common/YesNoCapsule';
import CheckboxBox from '../../components/common/CheckboxBox'; 
import TimeInputField from '../../components/inputs/TimeInputField';
import GasTable from '../../components/common/GasTable'; 
import { WORK_TYPES } from '../../constants/permitData';
import { HAZARD_DATABASE } from '../../constants/hazardsData';
import { CREW_DATABASE } from '../../constants/crewData'; 

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

type GasLog = { id: string; timestamp: Date; readings: GasEntry[]; isSafe: boolean; };
type IsolationPoint = { id: string; tagNumber: string; equipment: string; };

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
  
  // Step 2: Work Types
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);

  // Step 3: Roles & Risks (Dynamic)
  const [attendant, setAttendant] = useState(''); 
  const [rescueTeam, setRescueTeam] = useState<string[]>([]);
  const [checklistResponses, setChecklistResponses] = useState<Record<string, boolean>>({});

  // Step 4: Gas & Iso
  const [gasTestTime, setGasTestTime] = useState<Date | null>(new Date());
  const [gasEntries, setGasEntries] = useState<GasEntry[]>(DEFAULT_GASES);
  const [gasLogs, setGasLogs] = useState<GasLog[]>([]);
  const [isolations, setIsolations] = useState<IsolationPoint[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newEquip, setNewEquip] = useState('');

  // Step 5: Auth
  const [authName, setAuthName] = useState('');
  const [authRank, setAuthRank] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // --- DYNAMIC LOGIC ENGINE ---
  const isEnclosed = selectedWorkTypes.includes('enclosed_space');
  const isHotWork = selectedWorkTypes.includes('hot_work');
  const isAloft = selectedWorkTypes.includes('working_aloft');
  const isElectrical = selectedWorkTypes.includes('electrical');

  const attendantLabel = isHotWork && !isEnclosed ? "Fire Watch" : "Attendant (Standby)";
  const showRescueTeam = isEnclosed; 
  const showGasSection = isEnclosed || isHotWork; 
  const showLotoSection = isElectrical || isHotWork; 
  const gasRefText = isEnclosed ? "Ref: MSC.581(110)" : "Ref: ISGOTT 11.4";

  // --- HANDLERS ---
  const toggleRescueMember = (name: string) => {
      if (rescueTeam.includes(name)) setRescueTeam(prev => prev.filter(n => n !== name));
      else setRescueTeam(prev => [...prev, name]);
  };

  const toggleWorkType = (id: string) => {
    const typeId = id as WorkType;
    if (selectedWorkTypes.includes(typeId)) setSelectedWorkTypes(prev => prev.filter(t => t !== typeId));
    else setSelectedWorkTypes(prev => [...prev, typeId]);
  };

  const handleChecklistChange = (req: string, val: boolean) => {
      setChecklistResponses(prev => ({ ...prev, [req]: val }));
  };

  const updateGasEntry = (id: string, field: keyof GasEntry, value: string) => {
      setGasEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
  };

  const addCustomGas = () => {
      setGasEntries(prev => [...prev, { id: `custom_${Date.now()}`, name: '', tlv: '0', unit: 'ppm', top: '', mid: '', bot: '', isCustom: true }]);
  };

  const isFormSafe = useMemo(() => {
      return !gasEntries.some(g => {
          const check = (val: string, tlv: string, id: string) => {
              if(!val) return false; const v = parseFloat(val); const t = parseFloat(tlv);
              if(isNaN(v)) return false;
              if(id === 'o2') return v < 20.9 || v > 23.5;
              if(!isNaN(t) && t > 0) return v > t; return false;
          }
          return check(g.top, g.tlv, g.id) || check(g.mid, g.tlv, g.id) || check(g.bot, g.tlv, g.id);
      });
  }, [gasEntries]);

  const isFormEmpty = useMemo(() => {
      return gasEntries.some(g => !g.isCustom && (!g.top || !g.mid || !g.bot));
  }, [gasEntries]);

  const recordGasReading = () => {
      if (!gasTestTime) return Alert.alert("Time Required", "Please select a time.");
      const newLog: GasLog = { id: Date.now().toString(), timestamp: gasTestTime, readings: JSON.parse(JSON.stringify(gasEntries)), isSafe: isFormSafe };
      setGasLogs(prev => [newLog, ...prev]);
      Alert.alert(newLog.isSafe ? "Safe" : "Unsafe", newLog.isSafe ? "Recorded." : "Ventilate.");
  };

  const addIsolation = () => {
      if (newEquip) { setIsolations(prev => [...prev, { id: Date.now().toString(), tagNumber: newTag, equipment: newEquip }]); setNewTag(''); setNewEquip(''); }
  };
  const removeIsolation = (id: string) => { setIsolations(prev => prev.filter(i => i.id !== id)); };

  const combinedData = useMemo(() => {
    const hazards = new Set<string>(); const ppe = new Set<string>(); const requirements = new Set<string>();
    selectedWorkTypes.forEach(typeId => {
        const entry = HAZARD_DATABASE.find(h => h.workTypeId === typeId);
        if (entry) { entry.hazards.forEach(h => hazards.add(h)); entry.ppe.forEach(p => ppe.add(p)); entry.requirements.forEach(r => requirements.add(r)); }
    });
    if (selectedWorkTypes.length > 0) {
        const general = HAZARD_DATABASE.find(h => h.workTypeId === 'general');
        if (general) { general.hazards.forEach(h => hazards.add(h)); general.ppe.forEach(p => ppe.add(p)); general.requirements.forEach(r => requirements.add(r)); }
    }
    return { hazards: Array.from(hazards), ppe: Array.from(ppe), requirements: Array.from(requirements) };
  }, [selectedWorkTypes]);

  const canProceed = () => {
    if (step === 1) return department && location.length > 2 && description.length > 5;
    if (step === 2) return selectedWorkTypes.length > 0;
    
    if (step === 3) {
        const checklistDone = combinedData.requirements.every(req => checklistResponses[req] !== undefined);
        const attendantSet = attendant.length > 0;
        const rescueSet = isEnclosed ? rescueTeam.length > 0 : true; 
        return checklistDone && attendantSet && rescueSet;
    }
    
    if (step === 4) {
        if (showGasSection) { 
            if (gasLogs.length === 0) return false; 
            if (!gasLogs[0].isSafe) return false; 
        }
        return true;
    }
    
    if (step === 5) return authName.length > 2 && authRank && declarationAccepted;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else {
        const newPermitId = `PTW-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        createPermit({
            id: Date.now().toString(),
            permitId: newPermitId,
            status: 'Active',
            location,
            workTypes: selectedWorkTypes,
            description,
            checkFrequency: parseInt(frequency) || 15,
            createdAt: new Date(),
            expiresAt: new Date(new Date().getTime() + 8 * 60 * 60 * 1000),
            personnelCount: 0,
            attendant,
            rescueTeam: isEnclosed ? rescueTeam : [], 
            gasConfig: showGasSection ? gasEntries : [] 
        });

        Alert.alert("Permit Issued", `Permit ${newPermitId} is now Active.`, [
            // Using 'as any' bypasses the strict type check for the nested navigator
            { text: "Go to Dashboard", onPress: () => navigation.navigate('MainTabs' as any) }
        ]);
    }
  };

  // --- RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={step / TOTAL_STEPS} color={theme.colors.primary} style={{ height: 4 }} />
      <View style={styles.stepHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Step {step}: {getStepTitle(step)}</Text>
        <Text variant="bodySmall">Step {step} of {TOTAL_STEPS}</Text>
      </View>
      <Divider />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* STEP 1 */}
        {step === 1 && (
            <View>
                <TextInput mode="outlined" label="Specific Location *" value={location} onChangeText={setLocation} style={styles.input} />
                <SimopsWarning currentLocation={location} />
                <TextInput mode="outlined" label="Description of Work *" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={styles.input} />
                <Divider style={{ marginVertical: 16 }} />
                <Text variant="labelLarge" style={styles.label}>Department</Text>
                <View style={styles.chipRow}>{DEPARTMENTS.map(dept => (<Chip key={dept} selected={department === dept} onPress={() => setDepartment(dept)} style={styles.chip} showSelectedOverlay>{dept}</Chip>))}</View>
                <TextInput mode="outlined" label="Safety Check Frequency (Minutes)" value={frequency} onChangeText={setFrequency} keyboardType="number-pad" style={styles.input} right={<TextInput.Affix text="min" />} />
            </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
            <View>
                <Text style={styles.helperText}>Select all types of work involved.</Text>
                <View style={styles.grid}>
                    {WORK_TYPES.map((type) => {
                        const isSelected = selectedWorkTypes.includes(type.id as WorkType);
                        return (
                            <Surface key={type.id} style={[styles.card, { backgroundColor: isSelected ? (type.isCritical ? '#FFEBEE' : '#E0F2F1') : theme.colors.surface, borderWidth: isSelected ? 2 : 0, borderColor: isSelected ? (type.isCritical ? theme.colors.error : theme.colors.primary) : 'transparent' }]} elevation={1}>
                                <TouchableOpacity onPress={() => toggleWorkType(type.id)} style={styles.cardTouch}>
                                    <Icon source={type.icon} size={32} color={type.isCritical ? theme.colors.error : theme.colors.primary} />
                                    <Text variant="labelLarge" style={styles.cardTitle}>{type.label}</Text>
                                    {type.isCritical && <View style={styles.criticalBadge}><Text style={styles.badgeText}>CRITICAL</Text></View>}
                                </TouchableOpacity>
                            </Surface>
                        );
                    })}
                </View>
            </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
            <View>
                <Surface style={styles.sectionCard} elevation={1}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Required Personnel</Text>
                    <Text style={styles.label}>{attendantLabel}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                        {CREW_DATABASE.map(c => (<Chip key={c.id} selected={attendant === c.name} onPress={() => setAttendant(c.name)} style={styles.chip} showSelectedOverlay>{c.name}</Chip>))}
                    </ScrollView>
                    {showRescueTeam && (
                        <>
                            <Text style={styles.label}>Rescue Team</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hzScroll}>
                                {CREW_DATABASE.map(c => (<Chip key={c.id} selected={rescueTeam.includes(c.name)} onPress={() => toggleRescueMember(c.name)} style={styles.chip} showSelectedOverlay>{c.name}</Chip>))}
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
                {combinedData.requirements.map((req, index) => (
                    <View key={index} style={[styles.checkRow, { borderBottomColor: theme.colors.outline }]}>
                        <Text style={styles.checkText}>{req}</Text>
                        <YesNoCapsule value={checklistResponses[req]} onChange={(val) => handleChecklistChange(req, val)} />
                    </View>
                ))}
            </View>
        )}

        {/* STEP 4 */}
        {step === 4 && (
            <View>
                {showGasSection ? (
                    <Surface style={styles.sectionCard} elevation={1}>
                        <View style={styles.cardHeaderRow}>
                            <Icon source="gas-cylinder" size={24} color={theme.colors.primary} />
                            <View style={{ marginLeft: 8 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Atmosphere Tests</Text>
                                <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>{gasRefText}</Text>
                            </View>
                        </View>
                        <View style={{ marginBottom: 16 }}><TimeInputField label="Time of Reading" value={gasTestTime} onChange={setGasTestTime} required /></View>
                        <View style={{ marginTop: 8 }}><GasTable entries={gasEntries} onUpdate={updateGasEntry} /></View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                            <Button mode="outlined" icon="plus" onPress={addCustomGas} compact>Add Gas</Button>
                            <Button mode="contained" icon="content-save" onPress={recordGasReading} disabled={isFormEmpty} buttonColor={!isFormSafe ? theme.colors.error : theme.colors.primary}>{!isFormSafe ? "Record Unsafe" : "Record Safe"}</Button>
                        </View>
                        {gasLogs.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>Readings</Text>
                                {gasLogs.map((log) => (
                                    <Surface key={log.id} style={[styles.logItem, { borderLeftColor: log.isSafe ? '#4CAF50' : theme.colors.error }]} elevation={1}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center'}}>
                                            <Text style={{fontWeight: 'bold'}}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                            <Chip compact icon={log.isSafe ? "check" : "alert-circle"} style={{ backgroundColor: log.isSafe ? '#E8F5E9' : '#FFEBEE' }} textStyle={{ fontSize: 11, color: log.isSafe ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>{log.isSafe ? "SAFE" : "UNSAFE"}</Chip>
                                        </View>
                                    </Surface>
                                ))}
                            </View>
                        )}
                    </Surface>
                ) : (
                    <View style={{padding: 24, alignItems:'center', opacity:0.6, marginBottom: 24}}>
                        <Icon source="gas-cylinder" size={48} color={theme.colors.surfaceDisabled} />
                        <Text style={{marginTop:12, fontWeight:'bold', color: theme.colors.onSurfaceDisabled}}>No Atmospheric Tests Required</Text>
                    </View>
                )}

                {showLotoSection && (
                    <Surface style={styles.sectionCard} elevation={1}>
                        <View style={styles.cardHeaderRow}><Icon source="lock-outline" size={24} color={theme.colors.secondary} /><Text variant="titleMedium" style={{ marginLeft: 8, fontWeight: 'bold' }}>Isolation (LOTO)</Text></View>
                        <View style={styles.lotoForm}>
                            <TextInput mode="outlined" label="Tag No." value={newTag} onChangeText={setNewTag} style={{ flex: 1 }} />
                            <TextInput mode="outlined" label="Equipment" value={newEquip} onChangeText={setNewEquip} style={{ flex: 2 }} />
                            <IconButton icon="plus-circle" size={32} iconColor={theme.colors.primary} onPress={addIsolation} disabled={!newEquip} />
                        </View>
                        {isolations.map((iso) => (<View key={iso.id} style={styles.lotoItem}><View style={{ flex: 1 }}><Text style={{ fontWeight: 'bold' }}>Tag: {iso.tagNumber || 'N/A'}</Text><Text variant="bodySmall">{iso.equipment}</Text></View><IconButton icon="delete" size={20} iconColor={theme.colors.error} onPress={() => removeIsolation(iso.id)} /></View>))}
                    </Surface>
                )}
            </View>
        )}

        {/* STEP 5 */}
        {step === 5 && (
            <View>
                <Surface style={styles.sectionCard} elevation={1}>
                    <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary, marginBottom: 16 }}>Permit Summary</Text>
                    <View style={styles.summaryRow}><Icon source="map-marker" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>{location} ({department})</Text></View>
                    <View style={styles.summaryRow}><Icon source="briefcase" size={20} color={theme.colors.onSurface} /><Text style={{ marginLeft: 8, flex: 1 }}>{selectedWorkTypes.map(id => id.replace('_', ' ').toUpperCase()).join(', ')}</Text></View>
                    
                    <View style={styles.summaryRow}>
                        <Icon source="account-hard-hat" size={20} color={theme.colors.onSurface} />
                        <Text style={{ marginLeft: 8, flex: 1 }}>{attendantLabel}: {attendant} {isEnclosed && ` | Rescue: ${rescueTeam.length}`}</Text>
                    </View>

                    {showGasSection && gasLogs.length > 0 && (<View style={[styles.summaryRow, { marginTop: 8 }]}><Icon source="check-circle" size={20} color="green" /><Text style={{ marginLeft: 8, color: 'green', fontWeight: 'bold' }}>Atmosphere Verified SAFE</Text></View>)}
                </Surface>
                <Text variant="titleMedium" style={styles.sectionTitle}>Authority</Text>
                <View style={styles.chipRow}>{RANKS.map(rank => (<Chip key={rank} selected={authRank === rank} onPress={() => setAuthRank(rank)} style={styles.chip} showSelectedOverlay>{rank}</Chip>))}</View>
                <TextInput mode="outlined" label="Authorizing Officer Name" value={authName} onChangeText={setAuthName} style={styles.input} />
                <Divider style={{ marginVertical: 16 }} />
                <View style={styles.declarationBox}>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                        <CheckboxBox checked={declarationAccepted} onPress={() => setDeclarationAccepted(!declarationAccepted)} />
                        <Text style={{ marginLeft: 12, flex: 1, lineHeight: 20 }}>I hereby certify that I have examined the location and equipment, and satisfied myself that all necessary precautions have been taken. The work is authorized to commence.</Text>
                    </View>
                </View>
            </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline, paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <Button mode="outlined" onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)} style={{ flex: 1, marginRight: 8 }}>{step === 1 ? "Cancel" : "Back"}</Button>
        <Button mode="contained" onPress={handleNext} disabled={!canProceed()} style={{ flex: 2 }}>{step === TOTAL_STEPS ? "Sign & Issue" : "Next Step"}</Button>
      </View>
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