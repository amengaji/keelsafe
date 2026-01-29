// mobile/src/screens/ActivePermit/ActivePermitScreen.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Vibration, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Icon, Chip, useTheme, Divider, ProgressBar, Portal, Modal, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { RootStackParamList, GasEntry } from '../../types/permitTypes';
import { MOCK_PERMITS } from '../../constants/mockData';
import { CREW_DATABASE } from '../../constants/crewData';
import { HAZARD_DATABASE } from '../../constants/hazardsData'; 

// Components
import TimeInputField from '../../components/inputs/TimeInputField';
import GasTable from '../../components/common/GasTable';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivePermit'>;

type Entrant = { id: string; name: string; rank: string; timeIn: Date; };
type GasLog = { id: string; timestamp: Date; readings: GasEntry[]; isSafe: boolean; };
type CommsLog = { id: string; timestamp: Date; type: string; note: string; };
type PersonnelLog = { id: string; name: string; rank: string; type: 'ENTRY' | 'EXIT'; timestamp: Date; };

export default function ActivePermitScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height; 
  const { permitId } = route.params;

  // 1. Load Data
  const permit = MOCK_PERMITS.find(p => p.permitId === permitId) || MOCK_PERMITS[0];

  // 2. State
  const [activeTab, setActiveTab] = useState<'personnel' | 'atmosphere' | 'details'>('personnel');
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [personnelLogs, setPersonnelLogs] = useState<PersonnelLog[]>([]);
  
  const [gasLogs, setGasLogs] = useState<GasLog[]>([]);
  const [showGasModal, setShowGasModal] = useState(false);
  const [newGasTime, setNewGasTime] = useState<Date | null>(new Date());
  const [newGasReadings, setNewGasReadings] = useState<GasEntry[]>(
      JSON.parse(JSON.stringify(permit.gasConfig || []))
  );

  const [isAtmosphereUnsafe, setIsAtmosphereUnsafe] = useState(false); 
  const [commsLogs, setCommsLogs] = useState<CommsLog[]>([]);

  const [timeLeft, setTimeLeft] = useState(8 * 60 * 60); 
  const [safetyTimer, setSafetyTimer] = useState(permit.checkFrequency * 60); 
  const isAlarmActive = useRef(false);

  // ---------------------------------------------------------------------------
  // ALARM SYSTEM
  // ---------------------------------------------------------------------------
  const triggerAlarm = (type: 'TIMER' | 'EVAC') => {
      if (isAlarmActive.current) return;
      isAlarmActive.current = true;

      const pattern = type === 'EVAC' ? [0, 200, 100, 200] : [0, 500, 500, 500]; 
      const message = type === 'EVAC' 
          ? "DANGER. Atmosphere Unsafe. Evacuate immediately." 
          : "Safety Check Overdue. Establish communications.";

      Vibration.vibrate(pattern, true); 

      Speech.speak(message, {
          language: 'en',
          pitch: type === 'EVAC' ? 1.2 : 1.0,
          rate: type === 'EVAC' ? 1.1 : 0.9,
          onDone: () => { if (isAlarmActive.current) triggerAlarm(type); } 
      });
  };

  const stopAlarm = () => {
      isAlarmActive.current = false;
      Vibration.cancel();
      Speech.stop();
  };

  // ---------------------------------------------------------------------------
  // TIMERS
  // ---------------------------------------------------------------------------
  useEffect(() => {
      const interval = setInterval(() => {
          setTimeLeft(p => (p > 0 ? p - 1 : 0));
          
          if (isAtmosphereUnsafe && entrants.length > 0) {
              if (!isAlarmActive.current) triggerAlarm('EVAC');
          } 
          else if (entrants.length > 0) {
              setSafetyTimer(prev => {
                  if (prev === 1) { triggerAlarm('TIMER'); return 0; }
                  if (prev === 0) return 0;
                  return prev - 1;
              });
          } 
          else {
              if (isAlarmActive.current) stopAlarm();
              setSafetyTimer(permit.checkFrequency * 60);
          }
      }, 1000);
      return () => { clearInterval(interval); stopAlarm(); };
  }, [entrants.length, isAtmosphereUnsafe]);

  // ---------------------------------------------------------------------------
  // LOGIC & HANDLERS
  // ---------------------------------------------------------------------------
  const addCommsLog = (type: string, note: string) => {
      setCommsLogs(prev => [{ id: Date.now().toString(), timestamp: new Date(), type, note }, ...prev]);
  };

  const handleAcknowledge = () => {
      if (isAtmosphereUnsafe) {
          addCommsLog('Emergency Comms', 'Communications logged during Evacuation. Alarm continues.');
          Alert.alert("Logged", "Comms recorded. ALARM WILL CONTINUE UNTIL SPACE IS EMPTY.");
      } else {
          stopAlarm();
          setSafetyTimer(permit.checkFrequency * 60); 
          addCommsLog('Alarm Acknowledge', 'Routine Check Verified.');
          Alert.alert("Verified", "Timer reset.");
      }
  };

  // --- GAS HANDLERS (Restored) ---
  const openGasModal = () => {
      setNewGasTime(new Date());
      // Reset readings to clear but keep structure
      const freshReadings = JSON.parse(JSON.stringify(permit.gasConfig)).map((g: GasEntry) => ({
          ...g, top: '', mid: '', bot: ''
      }));
      setNewGasReadings(freshReadings);
      setShowGasModal(true);
  };

  const updateNewGasEntry = (id: string, field: keyof GasEntry, value: string) => {
      setNewGasReadings(prev => prev.map(entry => 
          entry.id === id ? { ...entry, [field]: value } : entry
      ));
  };

  const saveGasLog = () => {
      const hasEmpty = newGasReadings.some(g => !g.isCustom && (!g.top || !g.mid || !g.bot));
      if(hasEmpty) return Alert.alert("Incomplete", "Fill all mandatory fields.");

      const isUnsafe = newGasReadings.some(g => {
          const check = (val: string, tlv: string, id: string) => {
              if(!val) return false; const v=parseFloat(val); const t=parseFloat(tlv);
              if(isNaN(v)) return false; 
              if(id==='o2') return v<20.9 || v>23.5; 
              if(!isNaN(t) && t>0) return v>t; 
              return false;
          }
          return check(g.top,g.tlv,g.id) || check(g.mid,g.tlv,g.id) || check(g.bot,g.tlv,g.id);
      });

      const newLog: GasLog = { id: Date.now().toString(), timestamp: newGasTime||new Date(), readings: newGasReadings, isSafe: !isUnsafe };
      setGasLogs(p => [newLog, ...p]);
      setShowGasModal(false);

      if (isUnsafe) {
          setIsAtmosphereUnsafe(true);
          stopAlarm(); 
          triggerAlarm('EVAC');
          addCommsLog('Emergency', 'UNSAFE ATMOSPHERE. EVACUATION ORDERED.');
          Alert.alert("CRITICAL", "Atmosphere Unsafe! EVACUATE NOW.");
      } else {
          setIsAtmosphereUnsafe(false);
          stopAlarm(); 
          setSafetyTimer(permit.checkFrequency * 60);
          addCommsLog('Gas Check', 'Atmosphere Safe. Timer Reset.');
          Alert.alert("Safe", "Readings Safe.");
      }
  };

  const handleEntry = () => {
      if (isAtmosphereUnsafe) return Alert.alert("LOCKED", "Atmosphere Unsafe. Entry Forbidden.");
      if (!selectedCrewId) return;
      const c = CREW_DATABASE.find(x => x.id === selectedCrewId);
      if(!c) return;
      if (entrants.some(e => e.id === c.id)) return Alert.alert("Error", "Already inside");
      if (permit.attendant === c.name) return Alert.alert("Violation", "Attendant cannot enter");
      if (permit.rescueTeam?.includes(c.name)) return Alert.alert("Violation", "Rescue Team cannot enter");

      setEntrants(p => [...p, { id: c.id, name: c.name, rank: c.rank, timeIn: new Date() }]);
      setPersonnelLogs(p => [{ id: Date.now().toString(), name: c.name, rank: c.rank, type: 'ENTRY', timestamp: new Date() }, ...p]);
      setSelectedCrewId('');
  };

  const handleExit = (id: string) => {
      const leaver = entrants.find(e => e.id === id);
      if (leaver) setPersonnelLogs(p => [{ id: Date.now().toString(), name: leaver.name, rank: leaver.rank, type: 'EXIT', timestamp: new Date() }, ...p]);
      
      const remaining = entrants.filter(e => e.id !== id);
      setEntrants(remaining);

      if (remaining.length === 0 && isAlarmActive.current) {
          stopAlarm();
          if (isAtmosphereUnsafe) Alert.alert("Evacuation Complete", "Space is empty. Alarm silenced. Atmosphere still UNSAFE.");
      }
  };

  // --- UI ---
  const isSafetyOverdue = safetyTimer === 0 && entrants.length > 0;
  let heroColor = theme.colors.primaryContainer; 
  let heroTextColor = theme.colors.onPrimaryContainer;
  let heroStatusText = "ATMOSPHERE CHECK TIMER";
  
  if (isAtmosphereUnsafe) { heroColor = '#D32F2F'; heroTextColor = 'white'; heroStatusText = "DANGER - EVACUATE NOW"; }
  else if (isSafetyOverdue) { heroColor = '#F57F17'; heroTextColor = 'white'; heroStatusText = "ALARM: CHECK OVERDUE"; }
  else if (entrants.length === 0) { heroColor = theme.colors.surfaceVariant; heroTextColor = theme.colors.onSurfaceVariant; heroStatusText = "STANDBY - EMPTY"; }
  else { heroColor = '#E3F2FD'; heroTextColor = '#1565C0'; heroStatusText = "NEXT CHECK DUE IN"; }

  const formatTimerHero = (s: number) => { const m=Math.floor(s/60); const sc=s%60; return `${m.toString().padStart(2,'0')}:${sc.toString().padStart(2,'0')}`; };

  // --- RENDER SECTIONS ---
  const renderSafetyPanel = () => (
      <View style={{ flex: isLandscape ? 0.4 : 0, marginRight: isLandscape ? 16 : 0 }}>
          <Surface style={[styles.heroCard, { backgroundColor: heroColor, height: isLandscape ? 220 : 'auto', justifyContent:'center' }]} elevation={4}>
              <View style={{ alignItems: 'center' }}>
                  <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
                      <Icon source={isAtmosphereUnsafe ? "skull-crossbones" : (isSafetyOverdue ? "alarm-light" : "timer-sand")} size={isLandscape ? 50 : 36} color={heroTextColor} />
                      <Text style={{color: heroTextColor, fontSize: isLandscape ? 28 : 20, fontWeight: 'bold', marginLeft: 12}}>{isAtmosphereUnsafe ? "EVACUATE" : (isSafetyOverdue ? "ALARM" : "ACTIVE")}</Text>
                  </View>
                  <Text style={{ fontSize: isLandscape ? 80 : 56, fontWeight: 'bold', color: heroTextColor, fontVariant: ['tabular-nums'], lineHeight: isLandscape ? 90 : 64 }}>
                      {formatTimerHero(safetyTimer)}
                  </Text>
                  <Text style={{ color: heroTextColor, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 }}>{heroStatusText}</Text>
                  
                  {(isAtmosphereUnsafe || isSafetyOverdue) && (
                      <Button mode="contained" buttonColor="white" textColor={heroColor} icon="radio-handheld" onPress={handleAcknowledge} style={{marginTop: 16, width: '100%'}}>
                          {isAtmosphereUnsafe ? "Log Comms (Keep Alarm)" : "Comms Established"}
                      </Button>
                  )}
              </View>
          </Surface>

          <Surface style={styles.counterCard} elevation={1}>
              <Text variant="displayLarge" style={{ fontWeight: 'bold', color: entrants.length > 0 ? (isAtmosphereUnsafe ? theme.colors.error : theme.colors.primary) : theme.colors.onSurfaceDisabled }}>
                  {entrants.length}
              </Text>
              <Text variant="titleMedium" style={{opacity: 0.7}}>Personnel Inside</Text>
          </Surface>
          
          <View style={styles.sectionCard}>
                <Text variant="titleSmall" style={{fontWeight:'bold', marginBottom:8}}>Manage Access</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {CREW_DATABASE.map(c => (
                        <Chip key={c.id} mode="outlined" selected={selectedCrewId === c.id} onPress={() => setSelectedCrewId(c.id)} style={{ marginRight: 8 }} showSelectedOverlay>{c.name}</Chip>
                    ))}
                </ScrollView>
                <Button mode="contained" icon="login" onPress={handleEntry} disabled={!selectedCrewId || isAtmosphereUnsafe} buttonColor={isAtmosphereUnsafe ? '#ccc' : theme.colors.primary}>
                    Register Entry
                </Button>
          </View>
      </View>
  );

  const renderLogPanel = () => (
      <View style={{ flex: isLandscape ? 0.6 : 1, marginTop: isLandscape ? 0 : 16 }}>
          <View style={styles.tabBar}>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'personnel' && styles.activeTab]} onPress={() => setActiveTab('personnel')}><Text style={[styles.tabText, activeTab === 'personnel' && styles.activeTabText]}>ENTRANTS</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'atmosphere' && styles.activeTab]} onPress={() => setActiveTab('atmosphere')}><Text style={[styles.tabText, activeTab === 'atmosphere' && styles.activeTabText]}>ATMOSPHERE</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tabItem, activeTab === 'details' && styles.activeTab]} onPress={() => setActiveTab('details')}><Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>DETAILS</Text></TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 4 }}>
              {activeTab === 'personnel' && (
                  <View>
                      {entrants.map((p) => (
                          <Surface key={p.id} style={[styles.entrantRow, isAtmosphereUnsafe && {borderColor: theme.colors.error, borderWidth:2}]} elevation={1}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <Icon source="account" size={28} color={isAtmosphereUnsafe ? theme.colors.error : theme.colors.primary} />
                                  <View style={{ marginLeft: 12 }}>
                                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{p.name}</Text>
                                      <Text variant="bodySmall">In: {p.timeIn.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                                  </View>
                              </View>
                              <Button mode="contained" buttonColor={theme.colors.error} onPress={() => handleExit(p.id)} compact>EXIT</Button>
                          </Surface>
                      ))}
                      <Divider style={{marginVertical:16}} />
                      <Text variant="titleSmall" style={{fontWeight:'bold', marginBottom:8}}>History</Text>
                      {personnelLogs.map(log => (
                          <View key={log.id} style={{flexDirection:'row', marginBottom:8}}><Icon source={log.type==='ENTRY'?"login":"logout"} size={16}/><Text style={{marginLeft:8, fontSize:12}}>{log.name} {log.type} at {log.timestamp.toLocaleTimeString()}</Text></View>
                      ))}
                  </View>
              )}

              {activeTab === 'atmosphere' && (
                  <View>
                      <View style={{flexDirection:'row', gap:12, marginBottom:16}}>
                          <Button mode="contained" icon="gas-cylinder" onPress={openGasModal} style={{flex:1}}>Record Gas</Button>
                          <Button mode="outlined" icon="radio-handheld" onPress={() => addCommsLog('Routine', 'Routine Check')} style={{flex:1}}>Log Comms</Button>
                      </View>
                      {gasLogs.map(log => (
                          <View key={log.id} style={{marginBottom:12, padding:12, backgroundColor:'white', borderRadius:8, borderLeftWidth:4, borderLeftColor: log.isSafe?'green':'red'}}>
                              <View style={{flexDirection:'row', justifyContent:'space-between'}}><Text style={{fontWeight:'bold'}}>{log.timestamp.toLocaleTimeString()}</Text><Text style={{color:log.isSafe?'green':'red', fontWeight:'bold'}}>{log.isSafe?"SAFE":"UNSAFE"}</Text></View>
                              <View style={{marginTop:4}}>{log.readings.map(r => r.top ? <Text key={r.id} style={{fontSize:11}}>{r.name}: {r.top}/{r.mid}/{r.bot}</Text> : null)}</View>
                          </View>
                      ))}
                      <Divider style={{marginVertical:16}}/>
                      <Text variant="titleSmall" style={{fontWeight:'bold'}}>Comms Log</Text>
                      {commsLogs.map(l => <Text key={l.id} style={{fontSize:12, marginTop:4}}>{l.timestamp.toLocaleTimeString()} - {l.note}</Text>)}
                  </View>
              )}

              {activeTab === 'details' && (
                  <View style={{padding:8}}>
                      <Text style={{fontWeight:'bold'}}>Attendant: {permit.attendant}</Text>
                      <Text style={{fontWeight:'bold', marginBottom:12}}>Rescue: {permit.rescueTeam?.join(', ')}</Text>
                      <Text>Work Types: {permit.workTypes.join(', ')}</Text>
                  </View>
              )}
          </ScrollView>
      </View>
  );

  // MAIN RENDER
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={1}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>{permit.permitId} <Text style={{fontWeight:'normal', color:'black'}}>| {permit.location}</Text></Text>
              <IconButton icon="close" onPress={() => navigation.goBack()} />
          </View>
      </Surface>

      <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column', padding: 16 }}>
          {renderSafetyPanel()}
          {renderLogPanel()}
      </View>

      <Portal>
          <Modal visible={showGasModal} onDismiss={() => setShowGasModal(false)} contentContainerStyle={{ padding: 20 }}>
              <Surface style={{ padding: 24, borderRadius: 16, backgroundColor: '#fff', width: isLandscape ? '50%' : '100%', alignSelf:'center' }}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold', marginBottom:16 }}>Atmosphere Check</Text>
                  <TimeInputField label="Time" value={newGasTime} onChange={setNewGasTime} required />
                  <View style={{ height: 300, marginTop: 16 }}>
                      <GasTable entries={newGasReadings} onUpdate={updateNewGasEntry} readOnlyNames={true} />
                  </View>
                  <Button mode="contained" onPress={saveGasLog} style={{marginTop: 16}}>Save & Verify</Button>
              </Surface>
          </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  heroCard: { borderRadius: 16, padding: 24, marginBottom: 16, justifyContent: 'center' },
  counterCard: { padding: 24, alignItems: 'center', borderRadius: 16, marginBottom: 16, backgroundColor: '#fff' },
  sectionCard: { padding: 16, borderRadius: 12, backgroundColor: '#fff', marginBottom: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 16, borderRadius: 12 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontWeight: 'bold', color: '#757575', fontSize: 12 },
  activeTab: { borderBottomColor: '#00695C', borderBottomWidth: 3 },
  activeTabText: { color: '#00695C' },
  entrantRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: '#fff' },
});