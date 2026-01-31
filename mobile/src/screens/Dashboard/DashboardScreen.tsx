// mobile/src/screens/Dashboard/DashboardScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, useWindowDimensions, StatusBar, Platform } from 'react-native';
import { Text, FAB, useTheme, Surface, IconButton, Avatar, Badge, Icon, Divider, SegmentedButtons } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { RootStackParamList, Permit } from '../../types/permitTypes';

// Contexts
import { usePermits } from '../../context/PermitContext'; 
import { useAppTheme } from '../../context/ThemeContext'; 

// Components
import PermitCard from '../../components/common/PermitCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export default function DashboardScreen({ navigation }: Props) {
  const theme = useTheme(); 
  const { isDarkMode, toggleTheme } = useAppTheme(); 
  const insets = useSafeAreaInsets(); 
  const { width, height } = useWindowDimensions();
  
  const isLandscape = width > height;

  const { permits } = usePermits(); 

  const [time, setTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('live'); // 'live' | 'pending' | 'history'

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(timer); }, []);

  // --- SMART FILTERING ---
  const { livePermits, pendingPermits, historyPermits, counts } = useMemo(() => {
      // 1. Live: Active, Suspended, or "Job Done but not closed"
      const live = permits.filter(p => ['Active', 'Suspended', 'JobComplete'].includes(p.status));
      
      // 2. Pending: Drafts waiting for approval
      const pending = permits.filter(p => ['Draft', 'Pending'].includes(p.status));
      
      // 3. History: Closed or Expired
      const history = permits.filter(p => ['Closed', 'Expired'].includes(p.status));

      return {
          livePermits: live,
          pendingPermits: pending,
          historyPermits: history,
          counts: {
              active: permits.filter(p => p.status === 'Active').length,
              suspended: permits.filter(p => p.status === 'Suspended').length,
              // FIX: "Complete" badge now counts Closed + Expired (Historical completion)
              complete: permits.filter(p => ['Closed', 'Expired'].includes(p.status)).length,
              total: permits.length
          }
      };
  }, [permits]);

  const handleOpenPermit = (id: string) => {
      const target = permits.find(p => p.permitId === id);
      if (target) {
          // If Draft, go to Wizard (Edit). If Live/History, go to Active Screen.
          if (target.status === 'Draft') {
              // Future: Navigate to Wizard with edit params
              navigation.navigate('ActivePermit', { permitId: id });
          } else {
              navigation.navigate('ActivePermit', { permitId: id });
          }
      }
  };

  // --- COMPONENTS ---

  const Header = ({ textColor = theme.colors.onPrimaryContainer, iconColor = theme.colors.onPrimaryContainer }) => (
    <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
            <Text variant="labelSmall" style={{ color: textColor, opacity: 0.7, letterSpacing: 1 }}>COMMANDER</Text>
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: textColor }}>Capt. Hook</Text>
            <Text variant="bodySmall" style={{ color: textColor, opacity: 0.8 }}>
                {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton 
                icon={isDarkMode ? "weather-night" : "weather-sunny"} 
                iconColor={iconColor} 
                size={24} 
                onPress={toggleTheme} 
            />
            <View>
                <IconButton 
                    icon="bell-outline" 
                    iconColor={iconColor} 
                    size={24} 
                    onPress={() => console.log("Notifications")} 
                />
                <Badge size={8} style={{ position: 'absolute', top: 8, right: 8 }} visible={true} />
            </View>
            <TouchableOpacity style={{ marginLeft: 8 }}>
                <Avatar.Text size={40} label="CH" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.onPrimaryContainer} />
            </TouchableOpacity>
        </View>
    </View>
  );

  const StatBadge = ({ icon, label, count, color, bg }: any) => (
    <Surface style={[styles.statCard, { backgroundColor: isDarkMode ? theme.colors.elevation.level2 : bg }]} elevation={2}>
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
            <Icon source={icon} size={24} color={color} />
            <Text variant="displaySmall" style={{ fontWeight: 'bold', color: color, lineHeight: 32 }}>{count}</Text>
        </View>
        <Text variant="labelMedium" style={{ color: isDarkMode ? theme.colors.onSurface : color, marginTop: 4, fontWeight: 'bold' }}>{label}</Text>
    </Surface>
  );

  const QuickActions = ({ vertical = false }) => (
    <View style={vertical ? styles.actionGridVertical : styles.actionGrid}>
        <ActionButton icon="plus" label="New Permit" color={theme.colors.primary} onPress={() => navigation.navigate('PermitWizard')} />
        <ActionButton icon="qrcode-scan" label="Scan QR" color={theme.colors.secondary} onPress={() => {}} />
        <ActionButton icon="account-group" label="Crew List" color={theme.colors.tertiary} onPress={() => {}} />
        <ActionButton icon="file-document-outline" label="Reports" color={theme.colors.surfaceVariant} textColor={theme.colors.onSurfaceVariant} onPress={() => {}} />
    </View>
  );

  const ActionButton = ({ icon, label, color, textColor = 'white', onPress }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
        <Surface style={[styles.actionIcon, { backgroundColor: color }]} elevation={2}>
            <Icon source={icon} size={24} color={textColor} />
        </Surface>
        <Text variant="labelSmall" style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const PermitGrid = ({ data }: { data: Permit[] }) => (
      <View style={styles.grid}>
          {data.length > 0 ? (
              data.map(permit => (
                  <View key={permit.id} style={{ width: isLandscape ? '32%' : '100%', marginBottom: 16 }}>
                      <PermitCard permit={permit} onPress={handleOpenPermit} />
                  </View>
              ))
          ) : (
              <View style={styles.emptyState}>
                  <Icon source="clipboard-text-off-outline" size={48} color={theme.colors.surfaceDisabled} />
                  <Text style={{ marginTop: 12, color: theme.colors.onSurfaceDisabled }}>No permits found.</Text>
              </View>
          )}
      </View>
  );

  // --- LAYOUTS ---

  const renderPortrait = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Hero Section */}
        <Surface style={[styles.heroSection, { paddingTop: insets.top + 10, backgroundColor: isDarkMode ? theme.colors.surface : '#004D40' }]} elevation={4}>
            <Header textColor={isDarkMode ? theme.colors.onSurface : 'white'} iconColor={isDarkMode ? theme.colors.onSurface : 'white'} />
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <View style={{flex:1}}><StatBadge icon="file-document-edit" label="ACTIVE" count={counts.active} color={theme.colors.primary} bg="#E3F2FD" /></View>
                <View style={{flex:1}}><StatBadge icon="alert-circle-outline" label="SUSPENDED" count={counts.suspended} color={theme.colors.error} bg="#FFF3E0" /></View>
                <View style={{flex:1}}><StatBadge icon="check-circle-outline" label="COMPLETE" count={counts.complete} color="green" bg="#E8F5E9" /></View>
            </View>
        </Surface>

        <View style={styles.bodySection}>
            <QuickActions />

            <Divider style={{ marginVertical: 20 }} />

            {/* TABS */}
            <SegmentedButtons
                value={viewMode}
                onValueChange={setViewMode}
                buttons={[
                    { value: 'live', label: 'Live Work', icon: 'hammer-wrench' },
                    { value: 'pending', label: 'Pending', icon: 'clock-outline' },
                    { value: 'history', label: 'History', icon: 'archive-outline' },
                ]}
                style={{marginBottom: 16}}
            />

            {/* CONTENT */}
            {viewMode === 'live' && <PermitGrid data={livePermits} />}
            {viewMode === 'pending' && <PermitGrid data={pendingPermits} />}
            {viewMode === 'history' && <PermitGrid data={historyPermits} />}
            
        </View>
    </ScrollView>
  );

  const renderLandscape = () => (
    <View style={{ flexDirection: 'row', flex: 1, paddingTop: insets.top }}>
        {/* LEFT SIDEBAR */}
        <Surface style={[styles.sidebar, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.outlineVariant }]} elevation={2}>
            <View style={{ padding: 20 }}>
                <Header textColor={theme.colors.onSurface} iconColor={theme.colors.onSurface} />
                
                <Divider style={{ marginVertical: 24 }} />
                
                <Text variant="titleSmall" style={{marginBottom:12, fontWeight:'bold', opacity:0.7}}>STATUS BOARD</Text>
                <View style={{flexDirection:'row', gap:8, flexWrap:'wrap'}}>
                    <View style={{width:'48%'}}><StatBadge icon="file-document-edit" label="ACTIVE" count={counts.active} color={theme.colors.primary} bg="#E3F2FD" /></View>
                    <View style={{width:'48%'}}><StatBadge icon="alert-circle-outline" label="PAUSED" count={counts.suspended} color={theme.colors.error} bg="#FFEBEE" /></View>
                </View>
                
                <Divider style={{ marginVertical: 24 }} />
                <Text variant="titleSmall" style={{marginBottom:12, fontWeight:'bold', opacity:0.7}}>ACTIONS</Text>
                <QuickActions vertical />
            </View>
        </Surface>

        {/* RIGHT CONTENT */}
        <View style={[styles.mainContent, { backgroundColor: theme.colors.background }]}>
            <View style={{padding: 24, paddingBottom: 0}}>
                <SegmentedButtons
                    value={viewMode}
                    onValueChange={setViewMode}
                    buttons={[
                        { value: 'live', label: 'Live Work', icon: 'hammer-wrench' },
                        { value: 'pending', label: 'Pending', icon: 'clock-outline' },
                        { value: 'history', label: 'History', icon: 'archive-outline' },
                    ]}
                />
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
                {viewMode === 'live' && <PermitGrid data={livePermits} />}
                {viewMode === 'pending' && <PermitGrid data={pendingPermits} />}
                {viewMode === 'history' && <PermitGrid data={historyPermits} />}
            </ScrollView>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "light-content"} backgroundColor={isDarkMode ? theme.colors.background : '#004D40'} />
      {isLandscape ? renderLandscape() : renderPortrait()}
      
      {!isLandscape && (
          <FAB
            icon="plus"
            label="Issue"
            style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 16 }]}
            color={theme.colors.onPrimary}
            onPress={() => navigation.navigate('PermitWizard')} 
          />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  heroSection: {
      paddingBottom: 32,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
  },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  statCard: { padding: 12, borderRadius: 16, minHeight: 90, justifyContent: 'center' },

  bodySection: { padding: 20 },
  sectionTitle: { fontWeight: 'bold', opacity: 0.8 },
  
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionGridVertical: { flexDirection: 'column', gap: 12 },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontWeight: '600', opacity: 0.8, textAlign: 'center', fontSize: 11 },

  emptyState: { padding: 40, alignItems: 'center', justifyContent:'center', opacity:0.7, width:'100%' },

  sidebar: { width: 340, height: '100%', borderRightWidth: 1 },
  mainContent: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },

  fab: { position: 'absolute', margin: 20, right: 0, borderRadius: 32 },
});