// mobile/src/components/common/SimopsWarning.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Icon, useTheme } from 'react-native-paper';
import { MOCK_PERMITS } from '../../constants/mockData';

type Props = {
  currentLocation: string;
};

export default function SimopsWarning({ currentLocation }: Props) {
  const theme = useTheme();

  // Check if any ACTIVE permit matches this location (case-insensitive)
  const conflict = useMemo(() => {
    if (!currentLocation || currentLocation.length < 3) return null;
    
    return MOCK_PERMITS.find(p => 
      p.status === 'Active' && 
      p.location.toLowerCase().includes(currentLocation.toLowerCase())
    );
  }, [currentLocation]);

  if (!conflict) return null;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.errorContainer }]} elevation={1}>
      <View style={styles.header}>
        <Icon source="alert-octagon" size={24} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: 'bold', marginLeft: 8 }}>
          SIMOPS WARNING
        </Text>
      </View>
      
      <Text style={{ color: theme.colors.onErrorContainer, marginTop: 4 }}>
        Caution: There is already an Active Permit in "{conflict.location}".
      </Text>
      <Text style={{ fontWeight: 'bold', marginTop: 4 }}>
        Permit #{conflict.permitId} ({conflict.workTypes.join(', ')})
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(176, 0, 32, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});