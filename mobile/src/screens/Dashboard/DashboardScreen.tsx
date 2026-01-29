// mobile/src/screens/Dashboard/DashboardScreen.tsx

import React from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/permitTypes';
import { MOCK_PERMITS } from '../../constants/mockData';
import PermitCard from '../../components/common/PermitCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const theme = useTheme();

  // Function to handle clicking a permit
  const handlePermitPress = (id: string) => {
    navigation.navigate('ActivePermit', { permitId: id });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      
      {/* Dashboard Header Stats */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
            Operational Dashboard
          </Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
            {MOCK_PERMITS.filter(p => p.status === 'Active').length} Active Permits
          </Text>
        </View>
      </View>

      {/* The List of Permits */}
      <FlatList
        data={MOCK_PERMITS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PermitCard permit={item} onPress={() => handlePermitPress(item.permitId)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button for New Permit */}
      <FAB
        icon="plus"
        label="New Permit"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('PermitWizard')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});