// mobile/src/screens/ActivePermit/ActivePermitScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Surface, IconButton, useTheme, Divider, SegmentedButtons, Chip, ProgressBar, Icon, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/permitTypes'; // Ensure this matches your types file location

// Context
import { usePermits } from '../../context/PermitContext'; 

// Components
import GasTable from '../../components/common/GasTable'; 

type Props = NativeStackScreenProps<RootStackParamList, 'ActivePermit'>;

export default function ActivePermitScreen({ route, navigation }: Props) {
  const { permitId } = route.params;
  const theme = useTheme();
  const { getPermit, updatePermitStatus } = usePermits();

  // 1. Fetch Real Data
  const permit = getPermit(permitId);

  // 2. View State
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(1);

  // 3. Timer Logic
  useEffect(() => {
    if (!permit || permit.status !== 'Active') return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(permit.expiresAt);
      const total = 8 * 60 * 60 * 1000; // Assuming 8 hour shift total
      const remaining = end.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeLeft('EXPIRED');
        setProgress(0);
        clearInterval(interval);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
        setProgress(remaining / total);
      }
    }, 60000); // Update every minute

    // Initial call
    const now = new Date();
    const end = new Date(permit.expiresAt);
    const remaining = end.getTime() - now.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    setTimeLeft(`${hours}h ${minutes}m`);

    return () => clearInterval(interval);
  }, [permit]);

  // Handle Missing Permit (Crash Safety)
  if (!permit) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Permit not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  // --- ACTIONS ---
  const handleSuspend = () => {
    Alert.alert("Suspend Permit?", "This will pause all work immediately.", [
      { text: "Cancel", style: "cancel" },
      { text: "Suspend Work", style: 'destructive', onPress: () => {
          updatePermitStatus(permit.permitId, 'Suspended');
          navigation.goBack();
      }}
    ]);
  };

  const handleClose = () => {
    Alert.alert("Close Permit", "Are all tools removed and housekeeping complete?", [
        { text: "No", style: "cancel" },
        { text: "Yes, Close Permit", onPress: () => {
            updatePermitStatus(permit.permitId, 'Closed');
            navigation.goBack();
        }}
    ]);
  };

  // --- RENDER HELPERS ---
  const getStatusColor = () => {
      switch(permit.status) {
          case 'Active': return '#4CAF50'; // Green
          case 'Suspended': return '#FF9800'; // Orange
          case 'Closed': return '#9E9E9E'; // Grey
          case 'Expired': return '#F44336'; // Red
          default: return theme.colors.primary;
      }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <View style={{flex:1, alignItems:'center'}}>
            <Text variant="titleMedium" style={{fontWeight:'bold'}}>{permit.permitId}</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:6}}>
                <View style={{width:8, height:8, borderRadius:4, backgroundColor: getStatusColor()}} />
                <Text variant="labelSmall" style={{color: getStatusColor(), fontWeight:'bold'}}>{permit.status.toUpperCase()}</Text>
            </View>
        </View>
        <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO TIMER */}
        <Surface style={[styles.timerCard, { backgroundColor: getStatusColor() }]} elevation={4}>
            <Text variant="labelMedium" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>TIME REMAINING</Text>
            <Text variant="displayMedium" style={{ color: 'white', fontWeight: 'bold', marginVertical: 8 }}>{timeLeft || "--:--"}</Text>
            <ProgressBar progress={progress} color="rgba(255,255,255,0.5)" style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>
                Expires: {new Date(permit.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Surface>

        {/* TABS */}
        <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            style={styles.tabs}
            buttons={[
            { value: 'overview', label: 'Overview', icon: 'file-document-outline' },
            { value: 'gas', label: 'Atmosphere', icon: 'gas-cylinder' },
            { value: 'crew', label: 'Crew', icon: 'account-group' },
            ]}
        />

        {/* TAB CONTENT */}
        <View style={styles.content}>
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    <Surface style={styles.card} elevation={1}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Work Scope</Text>
                        <View style={styles.row}><Icon source="map-marker" size={20} color={theme.colors.secondary} /><Text style={styles.rowText}>{permit.location}</Text></View>
                        <Divider style={{ marginVertical: 12 }} />
                        <Text style={{ lineHeight: 22 }}>{permit.description}</Text>
                    </Surface>

                    <Surface style={styles.card} elevation={1}>
                        <Text variant="titleMedium" style={styles.cardTitle}>Hazards & Controls</Text>
                        <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                            {permit.workTypes.map(w => (
                                <Chip key={w} icon="alert" style={{backgroundColor:'#FFEBEE'}}>{w.replace('_', ' ').toUpperCase()}</Chip>
                            ))}
                        </View>
                    </Surface>
                </>
            )}

            {/* 2. GAS TAB */}
            {activeTab === 'gas' && (
                <>
                    {permit.gasLogs.length > 0 ? (
                        <>
                            <Surface style={[styles.card, { borderLeftWidth: 4, borderLeftColor: permit.gasLogs[0].isSafe ? '#4CAF50' : '#F44336' }]} elevation={2}>
                                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                                    <Text variant="titleMedium" style={{fontWeight:'bold'}}>Latest Reading</Text>
                                    <Text variant="labelSmall">{new Date(permit.gasLogs[0].timestamp).toLocaleTimeString()}</Text>
                                </View>
                                {/* Reusing your GasTable component for display */}
                                <GasTable entries={permit.gasLogs[0].readings} onUpdate={() => {}} readOnly /> 
                            </Surface>

                            <Text variant="titleSmall" style={{marginVertical:16, opacity:0.6, fontWeight:'bold'}}>HISTORY</Text>
                            
                            {permit.gasLogs.slice(1).map((log, index) => (
                                <Surface key={index} style={styles.logItem} elevation={0}>
                                    <Text style={{fontWeight:'bold'}}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                                    <Text style={{color: log.isSafe ? '#4CAF50' : '#F44336', fontWeight:'bold'}}>{log.isSafe ? 'SAFE' : 'UNSAFE'}</Text>
                                </Surface>
                            ))}
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon source="gas-cylinder" size={48} color={theme.colors.surfaceDisabled} />
                            <Text style={{marginTop:12, opacity:0.5}}>No gas readings required or recorded.</Text>
                        </View>
                    )}
                    
                    <Button mode="outlined" icon="plus" style={{marginTop:24}} onPress={() => Alert.alert("Feature", "Opens Gas Testing Form")}>New Gas Test</Button>
                </>
            )}

            {/* 3. CREW TAB */}
            {activeTab === 'crew' && (
                <Surface style={styles.card} elevation={1}>
                    <Text variant="titleMedium" style={styles.cardTitle}>Authorized Personnel</Text>
                    
                    <View style={styles.roleRow}>
                        <Avatar.Text size={32} label="AT" style={{backgroundColor:theme.colors.primaryContainer}} />
                        <View style={{marginLeft:12, flex:1}}>
                            <Text style={{fontWeight:'bold'}}>{permit.attendant || "None"}</Text>
                            <Text variant="labelSmall">Standby / Fire Watch</Text>
                        </View>
                        <IconButton icon="phone" size={20} />
                    </View>

                    {permit.rescueTeam && permit.rescueTeam.length > 0 && (
                        <>
                            <Divider style={{marginVertical:12}} />
                            <Text variant="labelSmall" style={{fontWeight:'bold', marginBottom:8}}>RESCUE TEAM</Text>
                            {permit.rescueTeam.map((name, i) => (
                                <Chip key={i} icon="ambulance" style={{marginBottom:4}}>{name}</Chip>
                            ))}
                        </>
                    )}
                </Surface>
            )}

        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      {permit.status === 'Active' && (
          <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
            <Button mode="outlined" textColor="#FF9800" style={{flex:1, borderColor:'#FF9800'}} onPress={handleSuspend}>Suspend</Button>
            <View style={{width:16}} />
            <Button mode="contained" buttonColor={theme.colors.error} style={{flex:1}} onPress={handleClose}>Close Permit</Button>
          </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 },
  timerCard: { margin: 16, padding: 24, borderRadius: 16, alignItems: 'center' },
  tabs: { marginHorizontal: 16, marginBottom: 16 },
  content: { paddingHorizontal: 16 },
  card: { padding: 16, borderRadius: 12, backgroundColor: 'white', marginBottom: 16 },
  cardTitle: { fontWeight: 'bold', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { marginLeft: 8, opacity: 0.8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', borderTopWidth: 1 },
  emptyState: { alignItems: 'center', padding: 32, opacity: 0.7 },
  logItem: { flexDirection:'row', justifyContent:'space-between', padding:16, backgroundColor:'#F5F5F5', borderRadius:8, marginBottom:8 },
  roleRow: { flexDirection:'row', alignItems:'center', paddingVertical:8 }
});