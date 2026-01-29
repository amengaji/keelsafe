// mobile/src/screens/Dashboard/DashboardScreen.tsx

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, FAB, useTheme, Surface, IconButton, Avatar, Badge } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/permitTypes';

// Context (The Brain)
import { usePermits } from '../../context/PermitContext'; 

// Components
import PermitCard from '../../components/common/PermitCard';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export default function DashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  
  // USE THE HOOK: Read from the live brain instead of the static file
  const { permits } = usePermits(); 

  const activePermits = permits.filter(p => p.status === 'Active');
  const otherPermits = permits.filter(p => p.status !== 'Active');

  const handleOpenPermit = (id: string) => {
      // Find the specific permit ID to verify it exists before navigating
      const target = permits.find(p => p.permitId === id);
      if (target) {
          navigation.navigate('ActivePermit', { permitId: id });
      }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text variant="titleSmall" style={{ opacity: 0.7, fontWeight: 'bold' }}>GOOD MORNING</Text>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Captain Hook</Text>
        </View>
        <TouchableOpacity>
            <Avatar.Text size={48} label="CH" style={{ backgroundColor: theme.colors.primaryContainer }} />
            <Badge style={styles.badge} size={16}>3</Badge>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Status Overview Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
            <Surface style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]} elevation={1}>
                <IconButton icon="file-document-edit" size={24} iconColor="#1565C0" />
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#1565C0' }}>{activePermits.length}</Text>
                <Text variant="bodySmall" style={{ color: '#1565C0' }}>Active Permits</Text>
            </Surface>
            <Surface style={[styles.statusCard, { backgroundColor: '#FFEBEE' }]} elevation={1}>
                <IconButton icon="alert-circle" size={24} iconColor="#C62828" />
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#C62828' }}>0</Text>
                <Text variant="bodySmall" style={{ color: '#C62828' }}>Overdue</Text>
            </Surface>
            <Surface style={[styles.statusCard, { backgroundColor: '#E8F5E9' }]} elevation={1}>
                <IconButton icon="check-circle" size={24} iconColor="#2E7D32" />
                <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#2E7D32' }}>{otherPermits.length}</Text>
                <Text variant="bodySmall" style={{ color: '#2E7D32' }}>Completed</Text>
            </Surface>
        </ScrollView>

        <Text variant="titleMedium" style={styles.sectionTitle}>Active Works</Text>
        
        {activePermits.length > 0 ? (
            activePermits.map(permit => (
                <PermitCard 
                    key={permit.id} 
                    permit={permit} 
                    onPress={handleOpenPermit} 
                />
            ))
        ) : (
            <View style={styles.emptyState}>
                <Text style={{ opacity: 0.5 }}>No active permits. The deck is quiet.</Text>
            </View>
        )}

        {otherPermits.length > 0 && (
            <>
                <Text variant="titleMedium" style={styles.sectionTitle}>Recent History</Text>
                {otherPermits.map(permit => (
                    <PermitCard 
                        key={permit.id} 
                        permit={permit} 
                        onPress={handleOpenPermit} 
                    />
                ))}
            </>
        )}

      </ScrollView>

      <FAB
        icon="plus"
        label="Issue Permit"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => navigation.navigate('PermitWizard')} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  badge: { position: 'absolute', top: 0, right: 0 },
  scrollContent: { paddingBottom: 80 },
  statusRow: { paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row' },
  statusCard: { width: 110, height: 110, borderRadius: 16, marginRight: 12, padding: 12, justifyContent: 'center' },
  sectionTitle: { paddingHorizontal: 20, marginBottom: 12, fontWeight: 'bold', opacity: 0.8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 32 },
  emptyState: { padding: 20, alignItems: 'center' }
});