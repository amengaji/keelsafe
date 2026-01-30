// mobile/src/screens/ActivePermit/ActivePermitScreen.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { Text, Button, Surface, IconButton, useTheme, Divider, SegmentedButtons, Chip, ProgressBar, Icon, TextInput, Modal as PaperModal } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, GasEntry, EntryLog, GasLog, SafetyCheckLog } from '../../types/permitTypes'; 
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// Context
import { usePermits } from '../../context/PermitContext'; 

// Components
import GasTable from '../../components/common/GasTable'; 

type Props = NativeStackScreenProps<RootStackParamList, 'ActivePermit'>;

export default function ActivePermitScreen({ route, navigation }: Props) {
  const { permitId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getPermit, updatePermitData, updatePermitStatus } = usePermits(); 

  const permit = getPermit(permitId);

  // View State
  const [activeTab, setActiveTab] = useState('overview');
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(1);
  const [checkTimeLeft, setCheckTimeLeft] = useState('');
  const [isCheckOverdue, setIsCheckOverdue] = useState(false);
  
  // Alarm States
  const [isEvacuation, setIsEvacuation] = useState(false); 
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  // Modal States
  const [showGasModal, setShowGasModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryMode, setEntryMode] = useState<'IN' | 'OUT'>('IN'); 
  
  // Form Data
  const [newGasReadings, setNewGasReadings] = useState<GasEntry[]>([]); 
  const [entryName, setEntryName] = useState('');

  // --- DATA LOADING ---
  const gasLogs = permit?.gasLogs || [];
  const entryLogs = permit?.entryLogs || []; 
  const checkLogs = permit?.safetyCheckLogs || [];

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
      if (isEvacuation || isCheckOverdue) {
          Animated.loop(
              Animated.sequence([
                  Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
                  Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: false })
              ])
          ).start();
      } else {
          fadeAnim.setValue(0);
      }
  }, [isEvacuation, isCheckOverdue]);

  // --- AUDIO ALARM LOOP ---
  useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (isEvacuation) {
          const playAlarm = () => {
              Speech.speak("General Emergency. Evacuate the space immediately.", { rate: 1.1, pitch: 1.2 });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          };
          playAlarm();
          interval = setInterval(playAlarm, 5000);
      } 
      else if (isCheckOverdue && whoIsInside.length > 0) {
          const playWarning = () => {
              Speech.speak("Safety Check Overdue. Report to bridge.", { rate: 1.0 });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          };
          playWarning();
          interval = setInterval(playWarning, 30000);
      }

      return () => {
          clearInterval(interval);
          Speech.stop();
      };
  }, [isEvacuation, isCheckOverdue, whoIsInside.length]);

  // --- TIMERS LOGIC (FIXED) ---
  useEffect(() => {
    if (!permit || permit.status !== 'Active') return;
    
    const tick = () => {
      const now = new Date();

      // 1. PERMIT EXPIRY (Total Duration)
      const expiryEnd = new Date(permit.expiresAt); 
      const expiryRemaining = expiryEnd.getTime() - now.getTime();
      const totalDuration = 8 * 60 * 60 * 1000;
      if (expiryRemaining <= 0) { setTimeLeft('EXPIRED'); setProgress(0); } 
      else {
        const h = Math.floor(expiryRemaining / (1000 * 60 * 60));
        const m = Math.floor((expiryRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${h}h ${m}m`);
        setProgress(Math.max(0, expiryRemaining / totalDuration));
      }

      // 2. SAFETY CHECK TIMER (SMARTER LOGIC)
      if (whoIsInside.length === 0) {
          // Empty Space = No Timer
          setCheckTimeLeft("SPACE EMPTY");
          setIsCheckOverdue(false);
      } else {
          // DETERMINE START TIME
          let startTime = permit.lastCheckAt ? new Date(permit.lastCheckAt) : null;
          
          // Fallback: If no manual check recorded, use the FIRST Entry time
          if (!startTime && entryLogs.length > 0) {
             // Sort logs oldest first to find the start of the job
             const sortedLogs = [...entryLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
             startTime = new Date(sortedLogs[0].timestamp);
          }

          // Fallback of last resort: Permit Creation (Should not happen if logic is tight)
          if (!startTime) {
              startTime = new Date(permit.createdAt);
          }

          // Calculate Target Time
          const nextCheck = new Date(startTime.getTime() + (permit.checkFrequency * 60 * 1000));
          const checkRemaining = nextCheck.getTime() - now.getTime();

          if (checkRemaining < 0) {
              setIsCheckOverdue(true);
              const overdueMins = Math.abs(Math.floor(checkRemaining / 60000));
              setCheckTimeLeft(`OVERDUE +${overdueMins}m`);
          } else {
              setIsCheckOverdue(false);
              const m = Math.floor(checkRemaining / 60000);
              const s = Math.floor((checkRemaining % 60000) / 1000);
              setCheckTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
          }
      }
    };
    
    tick(); 
    const interval = setInterval(tick, 1000); 
    return () => clearInterval(interval);
  }, [permit, whoIsInside.length]); // Re-calc when people change

  if (!permit) return <View style={styles.center}><Text>Permit Not Found</Text><Button onPress={navigation.goBack}>Back</Button></View>;

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
          Alert.alert("General Alarm", "Trigger Evacuation Alarm?", [
              { text: "Cancel", style: "cancel" },
              { text: "ACTIVATE ALARM", style: 'destructive', onPress: () => setIsEvacuation(true) }
          ]);
      }
  };

  const handleSafetyCheck = () => {
      const newLog: SafetyCheckLog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          checkedBy: "Current User" 
      };
      // RESET TIMER to NOW
      updatePermitData({ ...permit, lastCheckAt: new Date(), safetyCheckLogs: [newLog, ...checkLogs] });
      Speech.speak("Check confirmed.");
  };

  const handleGasSave = () => {
    const incompleteEntries = newGasReadings.filter(g => 
        !g.top || g.top.trim() === '' || 
        !g.mid || g.mid.trim() === '' || 
        !g.bot || g.bot.trim() === ''
    );

    if (incompleteEntries.length > 0) {
        const names = incompleteEntries.map(g => g.name || "Custom").join(', ');
        Alert.alert("Incomplete Readings", `Mandatory checks missing for: ${names}.\n\nYou must record Top, Mid, and Bottom readings for ALL gases.`);
        return; 
    }

    const isSafe = !newGasReadings.some(g => {
        const levels = [g.top, g.mid, g.bot].map(l => parseFloat(l));
        const limit = parseFloat(g.tlv);
        return levels.some(val => {
            if (g.id === 'o2') return val < 20.9 || val > 23.5;
            return val > limit;
        });
    });

    if (!isSafe) {
        setIsEvacuation(true);
        Speech.speak("Danger. Atmosphere Unsafe. Evacuate immediately.");
    }

    const newLog: GasLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        performedBy: "Current User",
        readings: newGasReadings,
        isSafe
    };
    updatePermitData({ ...permit, gasLogs: [newLog, ...gasLogs] });
    setShowGasModal(false);
  };

  const executeLog = (name: string, direction: 'IN' | 'OUT') => {
      if (!name.trim()) return;
      
      const newCount = direction === 'IN' ? (permit.personnelCount || 0) + 1 : Math.max(0, (permit.personnelCount || 0) - 1);
      const newLog: EntryLog = { id: Date.now().toString(), timestamp: new Date(), name, direction };

      // SMART RESET: If Space was Empty, and now someone Enters, RESET Timer.
      let newLastCheckAt = permit.lastCheckAt;
      if (direction === 'IN' && (permit.personnelCount || 0) === 0) {
          newLastCheckAt = new Date(); // Start fresh 15 mins
      }

      updatePermitData({ 
          ...permit, 
          personnelCount: newCount, 
          entryLogs: [newLog, ...entryLogs],
          lastCheckAt: newLastCheckAt 
      });

      setEntryName('');
      setShowEntryModal(false);

      if (direction === 'OUT' && isEvacuation && newCount === 0) {
          Speech.speak("All personnel accounted for.");
      }
  };

  const handleQuickExit = (name: string) => {
      if (isEvacuation) {
          executeLog(name, 'OUT');
      } else {
          Alert.alert("Log Exit", `Confirm ${name} is exiting?`, [{ text: "Cancel", style: "cancel" }, { text: "Yes", onPress: () => executeLog(name, 'OUT') }]);
      }
  };

  const headerBackgroundColor = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surface, '#FFEBEE']
  });

  const getStatusColor = () => {
      if (isEvacuation) return '#B00020'; 
      if (isCheckOverdue) return '#C62828'; 
      switch(permit.status) {
          case 'Active': return '#4CAF50'; 
          case 'Suspended': return '#FF9800'; 
          default: return theme.colors.primary;
      }
  };

  const isSpaceEmpty = whoIsInside.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      <Animated.View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: headerBackgroundColor }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <View style={{flex:1, alignItems:'center'}}>
            <Text variant="titleMedium" style={{fontWeight:'bold'}}>{isEvacuation ? "EVACUATION IN PROGRESS" : permit.permitId}</Text>
            {!isEvacuation && (
                <View style={{flexDirection:'row', alignItems:'center', gap:6}}>
                    <View style={{width:8, height:8, borderRadius:4, backgroundColor: getStatusColor()}} />
                    <Text variant="labelSmall" style={{color: getStatusColor(), fontWeight:'bold'}}>{permit.status.toUpperCase()}</Text>
                </View>
            )}
        </View>
        <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* HERO CARD */}
        <Surface style={[styles.timerCard, { backgroundColor: isSpaceEmpty ? theme.colors.surfaceVariant : getStatusColor() }]} elevation={4}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', width:'100%', marginBottom: 16}}>
                <View>
                    <Text variant="labelMedium" style={{ color: isSpaceEmpty ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.8)' }}>PERMIT EXPIRY</Text>
                    <Text variant="headlineMedium" style={{ color: isSpaceEmpty ? theme.colors.onSurface : 'white', fontWeight: 'bold' }}>{timeLeft}</Text>
                </View>
                {isEvacuation ? <Icon source="alarm-light" size={40} color="white" /> : <Icon source="clock-time-eight-outline" size={32} color={isSpaceEmpty ? theme.colors.onSurfaceVariant : "rgba(255,255,255,0.4)"} />}
            </View>

            <Divider style={{backgroundColor: isSpaceEmpty ? theme.colors.outline : 'rgba(255,255,255,0.3)', width:'100%', marginBottom: 16}} />

            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                <View>
                    <Text variant="labelMedium" style={{ color: (isCheckOverdue || isEvacuation) ? '#FFEBEE' : (isSpaceEmpty ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.8)'), fontWeight:'bold' }}>
                        NEXT SAFETY CHECK ({permit.checkFrequency}m)
                    </Text>
                    <Text variant="displaySmall" style={{ color: isSpaceEmpty ? theme.colors.onSurface : 'white', fontWeight: 'bold' }}>{checkTimeLeft}</Text>
                </View>
                {!isSpaceEmpty && (
                    <Button mode="contained" buttonColor="white" textColor={getStatusColor()} icon="check-bold" onPress={handleSafetyCheck} style={{borderRadius: 8}}>
                        Log Check
                    </Button>
                )}
            </View>
        </Surface>

        {/* QUICK ACTIONS */}
        <View style={styles.actionRow}>
            <Button mode="contained" icon="account-group" style={{flex:1, marginHorizontal:4}} buttonColor={theme.colors.primary} onPress={() => { setEntryMode('IN'); setShowEntryModal(true); }}>Log Personnel</Button>
            <Button mode="contained" icon="gas-cylinder" style={{flex:1, marginHorizontal:4}} buttonColor={theme.colors.secondary} onPress={() => { setNewGasReadings(JSON.parse(JSON.stringify(permit.gasConfig || []))); setShowGasModal(true); }}>Gas Check</Button>
        </View>

        <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            style={styles.tabs}
            buttons={[{ value: 'overview', label: 'Info' }, { value: 'logs', label: 'History' }, { value: 'gas', label: 'Gas' }]}
        />

        <View style={styles.content}>
            {activeTab === 'overview' && (
                <>
                    <Surface style={[styles.card, isEvacuation && {borderColor: 'red', borderWidth: 2}]} elevation={1}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
                            <Text variant="titleMedium" style={styles.cardTitle}>
                                {isEvacuation ? `MUSTERING: ${whoIsInside.length} REMAINING` : `Personnel Inside (${whoIsInside.length})`}
                            </Text>
                            {whoIsInside.length > 0 && <Text variant="labelSmall" style={{color: theme.colors.primary}}>Tap name to exit</Text>}
                        </View>
                        {whoIsInside.length > 0 ? (
                            <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                                {whoIsInside.map((name, i) => (
                                    <Chip key={i} icon="logout" onPress={() => handleQuickExit(name)} style={{backgroundColor: isEvacuation ? '#FFEBEE' : '#E3F2FD', borderColor: isEvacuation ? 'red' : theme.colors.primary}} mode="outlined" textStyle={{fontWeight: isEvacuation ? 'bold' : 'normal', color: isEvacuation ? '#C62828' : 'black'}}>
                                        {name}
                                    </Chip>
                                ))}
                            </View>
                        ) : (
                            <View style={{alignItems:'center', padding:12, opacity:0.5}}><Icon source="account-off" size={24} /><Text>Space is empty</Text></View>
                        )}
                    </Surface>
                    <Surface style={styles.card} elevation={1}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Work Scope</Text>
                        <View style={styles.row}><Icon source="map-marker" size={20} color={theme.colors.secondary} /><Text style={styles.rowText}>{permit.location}</Text></View>
                        <Divider style={{ marginVertical: 12 }} />
                        <Text style={{ lineHeight: 22 }}>{permit.description}</Text>
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
                <>
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
                    ) : (
                        <View style={styles.center}><Icon source="gas-cylinder" size={48} color={theme.colors.surfaceDisabled} /><Text style={{marginTop:12, opacity:0.5}}>No gas data.</Text></View>
                    )}
                </>
            )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}>
        {!isEvacuation ? (
            <>
                <Button mode="outlined" textColor="#FF9800" style={{flex:1, borderColor:'#FF9800'}} onPress={() => updatePermitStatus(permit.permitId, 'Suspended')}>Suspend</Button>
                <View style={{width:12}} />
                <Button mode="contained" buttonColor={theme.colors.error} icon="alarm-light" style={{flex:1.5}} onPress={toggleEvacuation}>GENERAL ALARM</Button>
            </>
        ) : (
            <Button mode="contained" buttonColor="#B00020" icon="stop-circle" style={{flex:1}} onPress={toggleEvacuation} disabled={whoIsInside.length > 0}>
                {whoIsInside.length > 0 ? "MUSTER PENDING" : "STAND DOWN ALARM"}
            </Button>
        )}
      </View>

      {/* MODALS */}
      <PaperModal visible={showGasModal} onDismiss={() => setShowGasModal(false)} contentContainerStyle={[styles.modalContainer, {backgroundColor: 'white'}]}>
          <Text variant="headlineSmall" style={{fontWeight:'bold', marginBottom:16}}>New Gas Test</Text>
          <GasTable entries={newGasReadings} onUpdate={(id, field, val) => setNewGasReadings(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g))} />
          <Button mode="contained" style={{marginTop:24}} onPress={handleGasSave}>Save Reading</Button>
      </PaperModal>

      <PaperModal visible={showEntryModal} onDismiss={() => setShowEntryModal(false)} contentContainerStyle={[styles.modalContainer, {backgroundColor: 'white'}]}>
          <Text variant="headlineSmall" style={{fontWeight:'bold', marginBottom:16}}>Log Entry</Text>
          <TextInput label="Crew Name / ID" value={entryName} onChangeText={setEntryName} autoFocus style={{marginBottom:16, backgroundColor:'white'}} />
          <Button mode="contained" buttonColor="green" icon="login" onPress={() => executeLog(entryName, 'IN')}>Confirm Entry</Button>
      </PaperModal>

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
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { marginLeft: 8, opacity: 0.8 },
  logRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, marginBottom:8, borderRadius:8, backgroundColor:'white' },
  logItem: { flexDirection:'row', justifyContent:'space-between', padding:16, backgroundColor:'#F5F5F5', borderRadius:8, marginBottom:8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', borderTopWidth: 1, borderTopColor:'#E0E0E0' },
  modalContainer: { padding: 20, margin: 20, borderRadius: 12 }
});