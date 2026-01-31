// mobile/src/screens/ActivePermit/ActivePermitScreen.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, IconButton, useTheme, Divider, SegmentedButtons, Chip, ProgressBar, Icon, Checkbox, Modal as PaperModal, Portal } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, GasEntry, EntryLog, GasLog, SafetyCheckLog, PermitStatus, CrewMember } from '../../types/permitTypes'; 
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Context & Data
import { usePermits } from '../../context/PermitContext'; 
import { CREW_DATABASE } from '../../constants/crewData';

// Components
import GasTable from '../../components/common/GasTable'; 
import PinPad from '../../components/common/PinPad';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivePermit'>;

// Custom Hook for safe intervals
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function ActivePermitScreen({ route, navigation }: Props) {
  // Safe Navigation Check
  const permitId = route.params?.permitId;
  
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getPermit, updatePermitData, updatePermitStatus } = usePermits(); 

  const permit = getPermit(permitId);

  // --- VIEW STATE ---
  const [activeTab, setActiveTab] = useState('overview');
  
  // --- TIMER STATES ---
  const [timeLeft, setTimeLeft] = useState('');
  const [checkTimeLeft, setCheckTimeLeft] = useState('');
  const [isCheckOverdue, setIsCheckOverdue] = useState(false);
  const [emptySpaceTimer, setEmptySpaceTimer] = useState<number | null>(null);
  const [loneWorkerTimer, setLoneWorkerTimer] = useState(0); 
  
  // --- ALARM STATES ---
  const [isEvacuation, setIsEvacuation] = useState(false); 
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  // --- MODAL STATES ---
  const [showGasModal, setShowGasModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [newGasReadings, setNewGasReadings] = useState<GasEntry[]>([]); 
  
  // --- AUTH STATES ---
  const [showPinPad, setShowPinPad] = useState(false);
  const [pendingAction, setPendingAction] = useState<'COMPLETE' | 'CLOSE' | null>(null);

  // --- FORM STATES ---
  const [selectedEntrants, setSelectedEntrants] = useState<string[]>([]);
  const [toolsRemoved, setToolsRemoved] = useState(false);
  const [spaceSecured, setSpaceSecured] = useState(false);

  // --- DATA LOADING & SAFEGUARDS ---
  const gasLogs = permit?.gasLogs || [];
  const entryLogs = permit?.entryLogs || []; 
  const checkLogs = permit?.safetyCheckLogs || [];
  const rescueTeam = permit?.rescueTeam || [];
  const fireTeam = permit?.fireFightingTeam || [];

  // LOGIC: Is this an Enclosed Space entry?
  const isEnclosedSpace = permit?.workTypes?.includes('enclosed_space');

  // --- CALCULATE WHO IS INSIDE ---
  const whoIsInside = useMemo(() => {
      if (!permit) return [];
      const insideSet = new Set<string>();
      const sortedLogs = [...entryLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      sortedLogs.forEach(log => {
          if (log.direction === 'IN') insideSet.add(log.name);
          else insideSet.delete(log.name);
      });
      return Array.from(insideSet);
  }, [entryLogs]);

  // --- ALARM ANIMATION ---
  useEffect(() => {
      if (isEvacuation || isCheckOverdue || (loneWorkerTimer > 300)) {
          Animated.loop(
              Animated.sequence([
                  Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
                  Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: false })
              ])
          ).start();
      } else {
          fadeAnim.setValue(0);
      }
  }, [isEvacuation, isCheckOverdue, loneWorkerTimer]);

  // --- ALARM LOGIC ---
  const playEvacAlarm = () => {
      Speech.stop(); 
      Speech.speak("General Emergency. Evacuate the space immediately.", { rate: 1.1, pitch: 1.2 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const playCheckAlarm = () => {
      Speech.stop(); 
      Speech.speak("Safety Check Overdue. Report to bridge.", { rate: 1.0 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const playLoneWorkerAlarm = () => {
      Speech.stop();
      Speech.speak("Warning. Single person entry is not permitted. Send support immediately.", { rate: 1.0 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // Immediate Triggers
  useEffect(() => { if (isEvacuation) playEvacAlarm(); }, [isEvacuation]);
  useEffect(() => { if (isCheckOverdue && whoIsInside.length > 0) playCheckAlarm(); }, [isCheckOverdue]);

  // Alarm Loop
  useInterval(() => {
      if (isEvacuation) playEvacAlarm();
      else if (isCheckOverdue && whoIsInside.length > 0) playCheckAlarm();
      else if (loneWorkerTimer > 300) playLoneWorkerAlarm();
  }, (isEvacuation ? 5000 : (isCheckOverdue && whoIsInside.length > 0 ? 15000 : (loneWorkerTimer > 300 ? 15000 : null))));

  // --- MASTER WATCHDOG ---
  useInterval(() => {
      if (!permit || (permit.status !== 'Active' && permit.status !== 'JobComplete')) return;
      
      const now = new Date();
      const peopleCount = whoIsInside.length;

      // LONE WORKER (Only applies if Enclosed Space)
      if (isEnclosedSpace && peopleCount === 1) {
          setLoneWorkerTimer(prev => prev + 1);
          if (loneWorkerTimer === 300) { 
              playLoneWorkerAlarm(); 
              Alert.alert("LONE WORKER WARNING", "Single person entry for > 5 mins is PROHIBITED.");
          }
      } else {
          setLoneWorkerTimer(0);
      }

      // EXPIRY
      const expiryEnd = new Date(permit.expiresAt); 
      const expiryRemainingMs = expiryEnd.getTime() - now.getTime();
      const expiryRemainingMins = Math.floor(expiryRemainingMs / 60000); // FIXED: Defined here

      if (expiryRemainingMs <= 0) {
          setTimeLeft('EXPIRED'); 
          if (peopleCount > 0 && !isEvacuation) setIsEvacuation(true);
      } else {
          const h = Math.floor(expiryRemainingMs / (1000 * 60 * 60));
          const m = Math.floor((expiryRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${h}h ${m}m`);

          if (peopleCount > 0) {
             const triggers = [30, 15, 10, 5];
             const seconds = Math.floor((expiryRemainingMs % 60000) / 1000);
             if (triggers.includes(expiryRemainingMins) && seconds === 0) {
                 Speech.speak(`Warning. Permit expires in ${expiryRemainingMins} minutes.`);
             }
          }
      }

      // SAFETY CHECK
      if (peopleCount === 0) {
          setCheckTimeLeft(isEnclosedSpace ? "SPACE EMPTY" : "NO WORKERS");
          setIsCheckOverdue(false);
          
          // GHOST SHIP Logic (Only for Enclosed Spaces)
          if (entryLogs.length > 0 && isEnclosedSpace) {
              const lastLog = entryLogs[entryLogs.length - 1];
              const emptyDuration = Math.floor((now.getTime() - new Date(lastLog.timestamp).getTime()) / 60000);
              setEmptySpaceTimer(emptyDuration);

              if (emptyDuration >= 45 && permit.status === 'Active') {
                  updatePermitStatus(permit.permitId, 'Suspended');
                  Alert.alert("Permit Suspended", "Space empty for > 45 mins. Gas check required to resume.");
                  Speech.speak("Permit suspended due to inactivity.");
              }
          }
      } else {
          setEmptySpaceTimer(null);
          
          let startTime = permit.lastCheckAt ? new Date(permit.lastCheckAt) : new Date(permit.createdAt);
          const nextCheck = new Date(startTime.getTime() + ((permit.checkFrequency || 15) * 60 * 1000));
          const checkRemaining = nextCheck.getTime() - now.getTime();

          if (checkRemaining < 0) {
              setIsCheckOverdue(true);
              setCheckTimeLeft('OVERDUE');
          } else {
              setIsCheckOverdue(false);
              const m = Math.floor(checkRemaining / 60000);
              const s = Math.floor((checkRemaining % 60000) / 1000);
              setCheckTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
          }
      }
  }, 1000);

  if (!permitId || !permit) {
      return (<View style={styles.center}><Text>Permit Not Found</Text><Button onPress={navigation.goBack}>Back</Button></View>);
  }

  // --- ACTIONS ---

  const toggleEvacuation = () => {
      if (isEvacuation) {
          if (whoIsInside.length === 0) {
              setIsEvacuation(false);
              Speech.speak("Alarm cancelled. Space is empty.");
          } else {
              Alert.alert("Cannot Cancel", "Personnel are still inside! Log them out first.");
          }
      } else {
          setIsEvacuation(true);
      }
  };

  const handleSafetyCheck = () => {
      const newLog: SafetyCheckLog = { id: Date.now().toString(), timestamp: new Date(), checkedBy: "Current User" };
      updatePermitData({ ...permit, lastCheckAt: new Date(), safetyCheckLogs: [newLog, ...checkLogs] });
      Speech.speak("Check confirmed.");
  };

  // For Hot Work only - logs a check without gas data
  const handleFireWatchLog = () => {
      handleSafetyCheck(); 
      Alert.alert("Fire Watch", "Patrol logged successfully.");
  };

  const handleGasSave = () => {
    // Basic validation
    const incomplete = newGasReadings.filter(g => !g.top || !g.mid || !g.bot);
    if (incomplete.length > 0) { Alert.alert("Incomplete", "All fields required."); return; }

    const isSafe = !newGasReadings.some(g => {
        const levels = [g.top, g.mid, g.bot].map(l => parseFloat(l));
        const limit = parseFloat(g.tlv);
        return levels.some(val => { if (g.id === 'o2') return val < 20.9 || val > 23.5; return val > limit; });
    });

    if (!isSafe) { setIsEvacuation(true); Speech.speak("Danger. Atmosphere Unsafe."); }

    let newStatus = permit.status;
    if (permit.status === 'Suspended' && isSafe) { newStatus = 'Active'; Speech.speak("Atmosphere safe. Reactivated."); }

    const newLog: GasLog = { id: Date.now().toString(), timestamp: new Date(), performedBy: "Current User", readings: newGasReadings, isSafe };
    updatePermitData({ ...permit, status: newStatus, gasLogs: [newLog, ...gasLogs] });
    setShowGasModal(false);
  };

  // --- ENTRY LOGIC (MULTI SELECT) ---
  const toggleEntrant = (name: string) => {
      if (selectedEntrants.includes(name)) setSelectedEntrants(prev => prev.filter(n => n !== name));
      else setSelectedEntrants(prev => [...prev, name]);
  };

  const confirmBatchEntry = () => {
      if (selectedEntrants.length === 0) return;
      
      const newLogs: EntryLog[] = selectedEntrants.map(name => ({
          id: Date.now().toString() + Math.random(),
          timestamp: new Date(),
          name,
          direction: 'IN'
      }));

      // Calculate new count
      const newCount = (permit.personnelCount || 0) + selectedEntrants.length;
      
      // If space was empty, reset check timer
      let newLastCheckAt = permit.lastCheckAt;
      if ((permit.personnelCount || 0) === 0) newLastCheckAt = new Date();

      updatePermitData({
          ...permit,
          personnelCount: newCount,
          entryLogs: [...newLogs, ...entryLogs],
          lastCheckAt: newLastCheckAt
      });

      setSelectedEntrants([]);
      setShowEntryModal(false);
      Speech.speak(`${newLogs.length} personnel logged in.`);
  };

  // --- MISSING FUNCTION ADDED HERE ---
  const executeExit = (name: string) => {
      const newCount = Math.max(0, (permit.personnelCount || 0) - 1);
      const newLog: EntryLog = { id: Date.now().toString(), timestamp: new Date(), name, direction: 'OUT' };
      
      updatePermitData({
          ...permit,
          personnelCount: newCount,
          entryLogs: [newLog, ...entryLogs]
      });

      if (isEvacuation && newCount === 0) Speech.speak("All personnel accounted for.");
  };

  const handleQuickExit = (name: string) => {
      if (isEvacuation) {
          executeExit(name);
      } else {
          Alert.alert("Log Exit", `Confirm ${name} is exiting?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Yes", onPress: () => executeExit(name) }
          ]);
      }
  };

  // --- AUTH & COMPLETION LOGIC ---
  
  const initiateCompletion = () => {
      if (whoIsInside.length > 0) return Alert.alert("Cannot Complete", "Space must be empty.");
      setPendingAction('COMPLETE');
      setShowPinPad(true);
  };

  const initiateClose = () => {
      if (!toolsRemoved || !spaceSecured) return Alert.alert("Checklist Incomplete", "Please confirm tools are removed and space is secured.");
      setPendingAction('CLOSE');
      setShowPinPad(true);
  };

  const handlePinSuccess = (user: CrewMember) => {
      setShowPinPad(false);
      
      if (pendingAction === 'COMPLETE') {
          updatePermitStatus(permit.permitId, 'JobComplete');
          Alert.alert("Job Complete", "Status updated. Perform housekeeping checks.");
      } 
      else if (pendingAction === 'CLOSE') {
          // Add signature of closer?
          updatePermitStatus(permit.permitId, 'Closed');
          navigation.goBack();
      }
      setPendingAction(null);
  };

  // --- STYLES & RENDERS ---
  const headerBackgroundColor = fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.colors.surface, '#FFEBEE'] });
  const getStatusColor = () => {
      if (isEvacuation) return '#B00020'; 
      if (isCheckOverdue || loneWorkerTimer > 300) return '#C62828'; 
      switch(permit.status) {
          case 'Active': return '#4CAF50'; 
          case 'Suspended': return '#FF9800'; 
          case 'JobComplete': return '#2196F3';
          default: return theme.colors.primary;
      }
  };
  const isSpaceEmpty = whoIsInside.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <Animated.View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: headerBackgroundColor }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <View style={{flex:1, alignItems:'center'}}>
            <Text variant="titleMedium" style={{fontWeight:'bold'}}>{isEvacuation ? "EVACUATION" : permit.permitId}</Text>
            {!isEvacuation && <View style={{flexDirection:'row', alignItems:'center', gap:6}}><View style={{width:8, height:8, borderRadius:4, backgroundColor: getStatusColor()}} /><Text variant="labelSmall" style={{color: getStatusColor(), fontWeight:'bold'}}>{permit.status.toUpperCase()}</Text></View>}
        </View>
        <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* LONE WORKER BANNER (Only for Enclosed Space) */}
        {whoIsInside.length === 1 && isEnclosedSpace && (
            <Surface style={{backgroundColor: '#FFF3E0', padding: 12, margin: 16, marginBottom: 0, flexDirection: 'row', alignItems:'center', borderRadius: 8}}>
                <Icon source="account-alert" size={24} color="#F57C00" />
                <Text style={{marginLeft: 12, color: '#E65100', flex: 1, fontWeight: 'bold'}}>Lone Worker Detected. Alarm in {300 - loneWorkerTimer}s</Text>
            </Surface>
        )}
        
        {/* HERO CARD */}
        <Surface style={[styles.timerCard, { backgroundColor: isSpaceEmpty ? theme.colors.surfaceVariant : getStatusColor() }]} elevation={4}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', width:'100%', marginBottom: 16}}>
                <View><Text variant="labelMedium" style={{ color: isSpaceEmpty ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.8)' }}>PERMIT EXPIRY</Text><Text variant="headlineMedium" style={{ color: isSpaceEmpty ? theme.colors.onSurface : 'white', fontWeight: 'bold' }}>{timeLeft}</Text></View>
                {isEvacuation ? <Icon source="alarm-light" size={40} color="white" /> : <Icon source="clock-time-eight-outline" size={32} color={isSpaceEmpty ? theme.colors.onSurfaceVariant : "rgba(255,255,255,0.4)"} />}
            </View>
            <Divider style={{backgroundColor: isSpaceEmpty ? theme.colors.outline : 'rgba(255,255,255,0.3)', width:'100%', marginBottom: 16}} />
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                <View><Text variant="labelMedium" style={{ color: (isCheckOverdue || isEvacuation) ? '#FFEBEE' : (isSpaceEmpty ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.8)'), fontWeight:'bold' }}>{isSpaceEmpty ? (isEnclosedSpace ? `EMPTY FOR ${emptySpaceTimer || 0}m` : "NO ACTIVE WORK") : `NEXT CHECK (${permit.checkFrequency || 15}m)`}</Text><Text variant="displaySmall" style={{ color: isSpaceEmpty ? theme.colors.onSurface : 'white', fontWeight: 'bold' }}>{checkTimeLeft}</Text></View>
                {!isSpaceEmpty && (<Button mode="contained" buttonColor="white" textColor={getStatusColor()} icon="check-bold" onPress={handleSafetyCheck} style={{borderRadius: 8}}>Log Check</Button>)}
            </View>
        </Surface>

        {/* DYNAMIC ACTIONS BASED ON TYPE */}
        {(permit.status === 'Active' || permit.status === 'Suspended') && (
            <View style={styles.actionRow}>
                {isEnclosedSpace ? (
                    <Button mode="contained" icon="account-group" style={{flex:1, marginHorizontal:4}} buttonColor={theme.colors.primary} disabled={permit.status === 'Suspended'} onPress={() => { setSelectedEntrants([]); setShowEntryModal(true); }}>Log Personnel</Button>
                ) : (
                    // HOT WORK ONLY - NO ENTRY LOGGING
                    <Button mode="contained" icon="fire-alert" style={{flex:1, marginHorizontal:4}} buttonColor={theme.colors.primary} onPress={handleFireWatchLog}>Log Fire Watch</Button>
                )}
                <Button mode="contained" icon="gas-cylinder" style={{flex:1, marginHorizontal:4}} buttonColor={theme.colors.secondary} onPress={() => { setNewGasReadings(JSON.parse(JSON.stringify(permit.gasConfig || []))); setShowGasModal(true); }}>{permit.status === 'Suspended' ? "Re-Test Gas" : "Gas Check"}</Button>
            </View>
        )}

        {/* JOB COMPLETE CHECKLIST */}
        {permit.status === 'JobComplete' && (
            <Surface style={{margin:16, padding:16, backgroundColor:'#E3F2FD', borderRadius:8}}>
                <Text variant="titleMedium" style={{fontWeight:'bold', marginBottom:12, color: theme.colors.primary}}>Post-Work Verification</Text>
                
                <TouchableOpacity onPress={() => setToolsRemoved(!toolsRemoved)} style={styles.checkRow}>
                    <Checkbox status={toolsRemoved ? 'checked' : 'unchecked'} onPress={() => setToolsRemoved(!toolsRemoved)} />
                    <Text style={{flex:1, fontWeight:'600'}}>All tools and equipment removed</Text>
                </TouchableOpacity>
                <Divider style={{marginVertical:8}} />
                <TouchableOpacity onPress={() => setSpaceSecured(!spaceSecured)} style={styles.checkRow}>
                    <Checkbox status={spaceSecured ? 'checked' : 'unchecked'} onPress={() => setSpaceSecured(!spaceSecured)} />
                    <Text style={{flex:1, fontWeight:'600'}}>Space secured and closed</Text>
                </TouchableOpacity>
            </Surface>
        )}

        <SegmentedButtons value={activeTab} onValueChange={setActiveTab} style={styles.tabs} buttons={[{ value: 'overview', label: 'Info' }, { value: 'logs', label: 'History' }, { value: 'gas', label: 'Gas' }]} />

        <View style={styles.content}>
            {activeTab === 'overview' && (
                <>
                    {/* ONLY SHOW PERSONNEL CARD IF ENCLOSED SPACE */}
                    {isEnclosedSpace && (
                        <Surface style={[styles.card, isEvacuation && {borderColor: 'red', borderWidth: 2}]} elevation={1}>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
                                <Text variant="titleMedium" style={styles.cardTitle}>{isEvacuation ? `MUSTERING: ${whoIsInside.length} REMAINING` : `Personnel Inside (${whoIsInside.length})`}</Text>
                                {whoIsInside.length > 0 && <Text variant="labelSmall" style={{color: theme.colors.primary}}>Tap name to exit</Text>}
                            </View>
                            {whoIsInside.length > 0 ? (
                                <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>{whoIsInside.map((name, i) => (<Chip key={i} icon="logout" onPress={() => handleQuickExit(name)} style={{backgroundColor: isEvacuation ? '#FFEBEE' : '#E3F2FD', borderColor: isEvacuation ? 'red' : theme.colors.primary}} mode="outlined" textStyle={{fontWeight: isEvacuation ? 'bold' : 'normal', color: isEvacuation ? '#C62828' : 'black'}}>{name}</Chip>))}</View>
                            ) : (<View style={{alignItems:'center', padding:12, opacity:0.5}}><Icon source="account-off" size={24} /><Text>Space is empty</Text></View>)}
                        </Surface>
                    )}
                    <Surface style={styles.card} elevation={1}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Roles</Text>
                        <View style={{marginBottom: 8}}><Text style={{fontWeight:'bold', opacity:0.7}}>ATTENDANT (STANDBY):</Text><Text>{permit.attendant || 'None'}</Text></View>
                        {permit.fireWatch && <View style={{marginBottom: 8}}><Text style={{fontWeight:'bold', opacity:0.7}}>FIRE WATCH:</Text><Text>{permit.fireWatch}</Text></View>}
                        {rescueTeam.length > 0 && <View style={{marginBottom: 8}}><Text style={{fontWeight:'bold', opacity:0.7}}>RESCUE TEAM:</Text><Text>{rescueTeam.join(', ')}</Text></View>}
                        {fireTeam.length > 0 && <View><Text style={{fontWeight:'bold', opacity:0.7}}>FIRE FIGHTING TEAM:</Text><Text>{fireTeam.join(', ')}</Text></View>}
                    </Surface>
                </>
            )}
            {activeTab === 'logs' && (
                <View>
                     <Text variant="labelLarge" style={{marginBottom:12, color:theme.colors.primary}}>Recent Events</Text>
                     {[...entryLogs.map(l => ({ ...l, type: 'ENTRY' })), ...checkLogs.map(l => ({ ...l, type: 'CHECK' }))]
                     .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, index) => (
                         <Surface key={index} style={styles.logRow} elevation={1}>
                             {log.type === 'ENTRY' ? (
                                 <>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <Icon source={(log as unknown as EntryLog).direction === 'IN' ? "login" : "logout"} size={24} color={(log as unknown as EntryLog).direction === 'IN' ? "green" : "orange"} />
                                        <View style={{marginLeft:12}}>
                                            <Text style={{fontWeight:'bold'}}>{(log as unknown as EntryLog).name}</Text>
                                            <Text variant="labelSmall">{(log as unknown as EntryLog).direction === 'IN' ? "Entered Space" : "Exited Space"}</Text>
                                        </View>
                                    </View>
                                    <Text variant="labelSmall">{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                 </>
                             ) : (
                                 <>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <Icon source="check-circle-outline" size={24} color={theme.colors.primary} />
                                        <View style={{marginLeft:12}}><Text style={{fontWeight:'bold'}}>Safety Check</Text><Text variant="labelSmall">Confirmed by {(log as unknown as SafetyCheckLog).checkedBy}</Text></View>
                                    </View>
                                    <Text variant="labelSmall">{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                 </>
                             )}
                         </Surface>
                     ))}
                </View>
            )}

            {activeTab === 'gas' && (
                <View>
                    {gasLogs.length > 0 ? (
                        <>
                            <Surface style={[styles.card, { borderLeftWidth: 4, borderLeftColor: gasLogs[0].isSafe ? '#4CAF50' : '#F44336' }]} elevation={2}>
                                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                                    <Text variant="titleMedium" style={{fontWeight:'bold'}}>Latest Reading</Text>
                                    <Text variant="labelSmall">{new Date(gasLogs[0].timestamp).toLocaleTimeString()}</Text>
                                </View>
                                <GasTable entries={gasLogs[0].readings} onUpdate={() => {}} readOnly /> 
                            </Surface>
                            <Text variant="titleSmall" style={{marginVertical:16, opacity:0.6, fontWeight:'bold'}}>HISTORY</Text>
                            {gasLogs.slice(1).map((log, index) => (
                                <Surface key={index} style={styles.logItem} elevation={0}>
                                    <Text style={{fontWeight:'bold'}}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                    <Text style={{color: log.isSafe ? '#4CAF50' : '#F44336', fontWeight:'bold'}}>{log.isSafe ? 'SAFE' : 'UNSAFE'}</Text>
                                </Surface>
                            ))}
                        </>
                    ) : (<View style={styles.center}><Icon source="gas-cylinder" size={48} color={theme.colors.surfaceDisabled} /><Text style={{marginTop:12, opacity:0.5}}>No gas data.</Text></View>)}
                </View>
            )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}>
        {isEvacuation ? (
            <Button mode="contained" buttonColor="#B00020" icon="stop-circle" style={{flex:1}} onPress={toggleEvacuation} disabled={whoIsInside.length > 0}>
                {whoIsInside.length > 0 ? "MUSTER PENDING" : "STAND DOWN ALARM"}
            </Button>
        ) : (
            <>
                {/* ACTIONS - Only allow if Active OR Suspended (to show re-test button) */}
                {(permit.status === 'Active' || permit.status === 'Suspended') && (
                    <>
                        <Button mode="outlined" textColor="#FF9800" style={{flex:1, borderColor:'#FF9800'}} onPress={() => updatePermitStatus(permit.permitId, 'Suspended')}>Suspend</Button>
                        <View style={{width:12}} />
                        <Button mode="contained" buttonColor={theme.colors.primary} style={{flex:1}} onPress={initiateCompletion}>Job Complete</Button>
                        <View style={{width:12}} />
                        <Button mode="contained" buttonColor={theme.colors.error} icon="alarm-light" compact onPress={toggleEvacuation}>ALARM</Button>
                    </>
                )}
                {permit.status === 'JobComplete' && (
                    <Button mode="contained" buttonColor="green" style={{flex:1}} onPress={initiateClose} disabled={!toolsRemoved || !spaceSecured}>Sign Off & Close Permit</Button>
                )}
            </>
        )}
      </View>

      {/* MODALS */}
      <PaperModal visible={showGasModal} onDismiss={() => setShowGasModal(false)} contentContainerStyle={[styles.modalContainer, {backgroundColor: 'white'}]}>
          <Text variant="headlineSmall" style={{fontWeight:'bold', marginBottom:16}}>New Gas Test</Text>
          <GasTable entries={newGasReadings} onUpdate={(id, field, val) => setNewGasReadings(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))} />
          <Button mode="contained" style={{marginTop:24}} onPress={handleGasSave}>Save Reading</Button>
      </PaperModal>

      {/* CREW SELECTION MODAL (For Entry) */}
      <PaperModal visible={showEntryModal} onDismiss={() => setShowEntryModal(false)} contentContainerStyle={[styles.modalContainer, {backgroundColor: 'white', maxHeight:'80%'}]}>
          <Text variant="headlineSmall" style={{fontWeight:'bold', marginBottom:16}}>Select Entrants</Text>
          <ScrollView style={{marginBottom: 16}}>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                  {CREW_DATABASE.map(c => {
                      // RULES:
                      // 1. Cannot be Attendant or Rescue or Fire Team (Duties are outside/standby)
                      // 2. Fire Watch IS allowed inside (they watch the spark)
                      // 3. Cannot be inside already
                      const isRestricted = (c.name === permit.attendant) || rescueTeam.includes(c.name) || fireTeam.includes(c.name);
                      const isInside = whoIsInside.includes(c.name);
                      const isDisabled = isRestricted || isInside;
                      
                      return (
                          <Chip 
                              key={c.id} 
                              selected={selectedEntrants.includes(c.name)} 
                              onPress={() => toggleEntrant(c.name)}
                              disabled={isDisabled}
                              style={{opacity: isDisabled ? 0.4 : 1}}
                              showSelectedOverlay
                          >
                              {c.name}
                          </Chip>
                      );
                  })}
              </View>
          </ScrollView>
          <Button mode="contained" buttonColor="green" icon="login" onPress={confirmBatchEntry} disabled={selectedEntrants.length === 0}>
              Confirm Entry ({selectedEntrants.length})
          </Button>
      </PaperModal>

      {/* PIN PAD (For Completion/Closing) */}
      <PinPad 
        visible={showPinPad} 
        onDismiss={() => { setShowPinPad(false); setPendingAction(null); }} 
        onSuccess={handlePinSuccess}
        title={pendingAction === 'COMPLETE' ? "Authorize Job Completion" : "Authorize Permit Closure"}
        requiredRank={['Master', 'Chief Officer', 'Chief Engineer', '2nd Engineer', 'Issuing Authority']} // Senior officers only
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingBottom: 12, elevation: 2 },
  timerCard: { margin: 16, padding: 20, borderRadius: 16 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 16 },
  tabs: { marginHorizontal: 16, marginBottom: 16 },
  content: { paddingHorizontal: 16 },
  card: { padding: 16, borderRadius: 12, backgroundColor: 'white', marginBottom: 16 },
  cardTitle: { fontWeight: 'bold' },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { marginLeft: 8, opacity: 0.8 },
  logRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, marginBottom:8, borderRadius:8, backgroundColor:'white' },
  logItem: { flexDirection:'row', justifyContent:'space-between', padding:16, backgroundColor:'#F5F5F5', borderRadius:8, marginBottom:8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', borderTopWidth: 1, borderTopColor:'#E0E0E0' },
  modalContainer: { padding: 20, margin: 20, borderRadius: 12 }
});