// mobile/src/components/common/GasTable.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, useTheme, DataTable } from 'react-native-paper';
import { GasEntry } from '../../types/permitTypes';

interface Props {
  entries: GasEntry[];
  onUpdate: (id: string, field: keyof GasEntry, value: string) => void;
  readOnly?: boolean; // <--- NEW PROP
}

export default function GasTable({ entries, onUpdate, readOnly = false }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
            <Text style={[styles.colName, { color: theme.colors.outline }]}>GAS TYPE</Text>
            <Text style={[styles.colInput, { color: theme.colors.outline }]}>TOP</Text>
            <Text style={[styles.colInput, { color: theme.colors.outline }]}>MID</Text>
            <Text style={[styles.colInput, { color: theme.colors.outline }]}>BOT</Text>
        </View>

        {/* DATA ROWS */}
        {entries.map((gas) => (
            <View key={gas.id} style={[styles.row, { borderBottomColor: theme.colors.surfaceVariant }]}>
                {/* Gas Name & Limit */}
                <View style={styles.colName}>
                    <Text style={{ fontWeight: 'bold' }}>{gas.name || "Custom"}</Text>
                    <Text variant="labelSmall" style={{ opacity: 0.5 }}>
                        Max: {gas.tlv} {gas.unit}
                    </Text>
                </View>

                {/* Input Fields */}
                <TextInput 
                    mode="flat"
                    value={gas.top}
                    onChangeText={(text) => onUpdate(gas.id, 'top', text)}
                    placeholder="-"
                    keyboardType="numeric"
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    underlineColor="transparent"
                    activeUnderlineColor={readOnly ? "transparent" : theme.colors.primary}
                    editable={!readOnly} // <--- LOCK IF READ ONLY
                />
                <TextInput 
                    mode="flat"
                    value={gas.mid}
                    onChangeText={(text) => onUpdate(gas.id, 'mid', text)}
                    placeholder="-"
                    keyboardType="numeric"
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    underlineColor="transparent"
                    activeUnderlineColor={readOnly ? "transparent" : theme.colors.primary}
                    editable={!readOnly} // <--- LOCK IF READ ONLY
                />
                <TextInput 
                    mode="flat"
                    value={gas.bot}
                    onChangeText={(text) => onUpdate(gas.id, 'bot', text)}
                    placeholder="-"
                    keyboardType="numeric"
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    underlineColor="transparent"
                    activeUnderlineColor={readOnly ? "transparent" : theme.colors.primary}
                    editable={!readOnly} // <--- LOCK IF READ ONLY
                />
            </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  headerRow: { flexDirection: 'row', paddingBottom: 8, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 4 },
  
  colName: { flex: 2, justifyContent: 'center' },
  colInput: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 'bold' },

  input: { 
      flex: 1, 
      height: 40, 
      backgroundColor: 'transparent', 
      marginHorizontal: 2 
  },
  inputContent: { 
      textAlign: 'center', 
      paddingHorizontal: 0,
      fontSize: 14 
  }
});