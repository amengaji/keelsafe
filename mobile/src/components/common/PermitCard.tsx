// mobile/src/components/common/PermitCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, Chip, useTheme, IconButton } from 'react-native-paper';
import { Permit } from '../../types/permitTypes';

type Props = {
  permit: Permit;
  onPress: (id: string) => void;
};

export default function PermitCard({ permit, onPress }: Props) {
  const theme = useTheme();

  // Color logic for status badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#4CAF50'; // Green
      case 'Suspended': return '#FF9800'; // Orange
      case 'Completed': return '#9E9E9E'; // Grey
      case 'Cancelled': return '#F44336'; // Red
      default: return theme.colors.primary;
    }
  };

  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity onPress={() => onPress(permit.id)} activeOpacity={0.7}>
        
        {/* Header: ID and Status */}
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {permit.permitId}
          </Text>
          <Chip 
            style={{ backgroundColor: getStatusColor(permit.status), height: 28 }} 
            textStyle={{ color: '#FFF', fontSize: 10, lineHeight: 10, marginVertical: 0 }}
          >
            {permit.status.toUpperCase()}
          </Chip>
        </View>

        {/* Location */}
        <View style={styles.row}>
            <IconButton icon="map-marker" size={16} style={{ margin: 0 }} />
            <Text variant="bodyMedium" style={styles.locationText}>
                {permit.location}
            </Text>
        </View>

        {/* Work Types (Tags) */}
        <View style={styles.tags}>
          {permit.workTypes.map((type) => (
            <View 
                key={type} 
                style={[styles.miniTag, { backgroundColor: theme.colors.elevation.level2 }]}
            >
                <Text style={{ fontSize: 10, color: theme.colors.onSurface }}>
                    {type.replace('_', ' ').toUpperCase()}
                </Text>
            </View>
          ))}
        </View>

        {/* Footer: Personnel Count */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
            <View style={styles.personnel}>
                <IconButton icon="account-group" size={18} iconColor={theme.colors.primary} />
                <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
                    {permit.personnelCount} Inside
                </Text>
            </View>
            <IconButton icon="chevron-right" iconColor={theme.colors.onSurfaceDisabled} />
        </View>

      </TouchableOpacity>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    marginHorizontal: 4, // Spacing for grid look
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    opacity: 0.8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 12,
  },
  miniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 2,
  },
  personnel: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});