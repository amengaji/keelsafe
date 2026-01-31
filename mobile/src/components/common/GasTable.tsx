// mobile/src/components/common/GasTable.tsx

import React, { useRef } from 'react';
import { View, StyleSheet, TextInput as NativeTextInput } from 'react-native';
import { Text, TextInput, DataTable, useTheme } from 'react-native-paper';
import { GasEntry } from '../../types/permitTypes';

interface Props {
  entries: GasEntry[];
  onUpdate: (id: string, field: keyof GasEntry, value: string) => void;
  readOnly?: boolean;
}

export default function GasTable({ entries, onUpdate, readOnly = false }: Props) {
  const theme = useTheme();
  
  // Refs for auto-focusing next field
  // Index mapping: Row i, Col j (0=top, 1=mid, 2=bot) -> index = i*3 + j
  const inputRefs = useRef<(any | null)[]>([]);

  // Helper to check safety for visual cues
  const isUnsafe = (entry: GasEntry, valStr: string) => {
      if (!valStr) return false;
      const val = parseFloat(valStr);
      const limit = parseFloat(entry.tlv);
      if (isNaN(val)) return false;

      // O2 Rules
      if (entry.id === 'o2') return val < 20.9 || val > 23.5;
      
      // Toxic/Explosive Rules
      if (!isNaN(limit) && limit > 0) return val > limit;
      return false;
  };

  const getCellStyle = (entry: GasEntry, val: string) => {
      const unsafe = isUnsafe(entry, val);
      return {
          backgroundColor: readOnly ? '#f0f0f0' : (unsafe ? '#FFEBEE' : 'white'), // Light Red if unsafe
          borderColor: unsafe ? theme.colors.error : 'transparent',
          borderWidth: unsafe ? 1 : 0,
          fontSize: 13,
          height: 35,
          textAlign: 'center' as const
      };
  };

  const handleNextFocus = (index: number) => {
      if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
      }
  };

  return (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={{flex: 2}}>Gas</DataTable.Title>
          <DataTable.Title style={{flex: 1.5}} numeric>TLV</DataTable.Title>
          <DataTable.Title style={{flex: 1.5}} numeric>Top</DataTable.Title>
          <DataTable.Title style={{flex: 1.5}} numeric>Mid</DataTable.Title>
          <DataTable.Title style={{flex: 1.5}} numeric>Bot</DataTable.Title>
        </DataTable.Header>

        {entries.map((entry, rowIndex) => (
          <DataTable.Row key={entry.id}>
            {/* GAS NAME */}
            <View style={{flex: 2, justifyContent:'center', paddingRight: 4}}>
                {entry.isCustom && !readOnly ? (
                    <TextInput 
                        mode="outlined" 
                        dense 
                        value={entry.name} 
                        placeholder="Name"
                        onChangeText={(t) => onUpdate(entry.id, 'name', t)}
                        style={{fontSize: 12, height: 30, backgroundColor: 'white'}}
                    />
                ) : (
                    <Text variant="bodySmall" style={{fontWeight:'bold'}}>{entry.name} ({entry.unit})</Text>
                )}
            </View>

            {/* TLV */}
            <View style={{flex: 1.5, justifyContent:'center', paddingHorizontal: 2}}>
                {entry.isCustom && !readOnly ? (
                    <TextInput 
                        mode="outlined" 
                        dense 
                        keyboardType="numeric"
                        value={entry.tlv} 
                        placeholder="Limit"
                        onChangeText={(t) => onUpdate(entry.id, 'tlv', t)}
                        style={{fontSize: 12, height: 30, textAlign:'center', backgroundColor: 'white'}}
                    />
                ) : (
                    <Text variant="bodySmall" style={{textAlign:'right'}}>{entry.tlv}</Text>
                )}
            </View>

            {/* READINGS (Top/Mid/Bot) with Auto-Focus */}
            {['top', 'mid', 'bot'].map((pos, colIndex) => {
                const globalIndex = (rowIndex * 3) + colIndex;
                const fieldName = pos as 'top' | 'mid' | 'bot';
                
                return (
                    <View key={pos} style={{flex: 1.5, padding: 2}}>
                        <TextInput
                            ref={(el: any) => inputRefs.current[globalIndex] = el}
                            mode="outlined"
                            dense
                            disabled={readOnly}
                            keyboardType="numeric"
                            returnKeyType="next"
                            value={(entry as any)[fieldName]}
                            onChangeText={(t) => onUpdate(entry.id, fieldName, t)}
                            onSubmitEditing={() => handleNextFocus(globalIndex)}
                            textColor={isUnsafe(entry, (entry as any)[fieldName]) ? theme.colors.error : theme.colors.onSurface}
                            style={getCellStyle(entry, (entry as any)[fieldName])}
                            contentStyle={{ paddingVertical: 0 }}
                        />
                    </View>
                );
            })}
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
});