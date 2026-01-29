// mobile/src/components/common/PermitCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, Chip, useTheme, IconButton, Divider } from 'react-native-paper';
import { Permit } from '../../types/permitTypes';

type Props = {
  permit: Permit;
  onPress: (id: string) => void;
};

export default function PermitCard({ permit, onPress }: Props) {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#2E7D32'; 
      case 'Suspended': return '#EF6C00'; 
      case 'Completed': return '#424242'; 
      case 'Cancelled': return '#C62828'; 
      default: return theme.colors.primary;
    }
  };

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity onPress={() => onPress(permit.permitId)} activeOpacity={0.7}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {permit.permitId}
          </Text>
          {/* Fixed Chip Padding */}
          <Chip 
            compact
            style={{ backgroundColor: getStatusColor(permit.status) }} 
            textStyle={{ color: '#FFF', fontSize: 11, fontWeight: 'bold', lineHeight: 14 }}
          >
            {permit.status.toUpperCase()}
          </Chip>
        </View>

        <Divider />

        <View style={styles.content}>
            {/* Location */}
            <View style={styles.row}>
                <IconButton icon="map-marker" size={18} style={{ margin: 0 }} />
                <Text variant="bodyMedium" style={[styles.rowText, {fontWeight: '600'}]}>
                    {permit.location}
                </Text>
            </View>

            {/* Work Types */}
            <View style={styles.tags}>
              {permit.workTypes.map((type) => (
                <View key={type} style={[styles.miniTag, { backgroundColor: theme.colors.elevation.level2 }]}>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurface }}>
                        {type.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
              ))}
            </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
            <View style={styles.personnel}>
                <IconButton icon="account-group" size={20} iconColor={theme.colors.primary} />
                <Text variant="labelLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    {permit.personnelCount} Personnel Inside
                </Text>
            </View>
            <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceDisabled} />
        </View>

      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginBottom: 16, overflow: 'hidden', marginHorizontal: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  content: { paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, marginBottom: 4 },
  rowText: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 6, marginBottom: 4 },
  miniTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F5F5', paddingRight: 4, paddingVertical: 0 },
  personnel: { flexDirection: 'row', alignItems: 'center' }
});