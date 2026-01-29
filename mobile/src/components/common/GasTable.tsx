// mobile/src/components/common/GasTable.tsx

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { GasEntry } from '../../types/permitTypes';

type Props = {
    entries: GasEntry[];
    onUpdate: (id: string, field: keyof GasEntry, value: string) => void;
    readOnlyNames?: boolean;
};

export default function GasTable({ entries, onUpdate, readOnlyNames = false }: Props) {
    const theme = useTheme();

    // STRICT MSC.581(110) LOGIC
    const isUnsafe = (id: string, value: string, tlv: string) => {
        if (!value || value === '') return false;
        const numVal = parseFloat(value);
        const numTlv = parseFloat(tlv);
        if (isNaN(numVal)) return false;

        // Oxygen: Must be between 20.9% and 23.5%
        if (id === 'o2') return numVal < 20.9 || numVal > 23.5;
        
        // Others: Unsafe if > TLV
        if (!isNaN(numTlv) && numTlv > 0) return numVal > numTlv;
        
        return false;
    };

    const renderInput = (gas: GasEntry, level: 'top' | 'mid' | 'bot') => {
        const value = gas[level];
        const unsafe = isUnsafe(gas.id, value, gas.tlv);
        
        return (
            <View style={styles.colReading}>
                <TextInput
                    mode="outlined"
                    dense
                    value={value}
                    onChangeText={(v) => onUpdate(gas.id, level, v)}
                    keyboardType="numeric"
                    style={[
                        styles.cellInputBox,
                        unsafe && { backgroundColor: theme.colors.errorContainer }
                    ]}
                    textColor={unsafe ? theme.colors.error : theme.colors.onSurface}
                    outlineColor={unsafe ? theme.colors.error : theme.colors.outline}
                    activeOutlineColor={unsafe ? theme.colors.error : theme.colors.primary}
                />
            </View>
        );
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
                {/* Header */}
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: theme.colors.elevation.level2 }]}>
                    <Text style={[styles.colName, styles.headerText]}>Gas</Text>
                    <Text style={[styles.colTlv, styles.headerText]}>TLV</Text>
                    <Text style={[styles.colReading, styles.headerText]}>Top</Text>
                    <Text style={[styles.colReading, styles.headerText]}>Mid</Text>
                    <Text style={[styles.colReading, styles.headerText]}>Bot</Text>
                </View>

                {/* Rows */}
                {entries.map((gas) => (
                    <View key={gas.id} style={[styles.tableRow, { borderBottomColor: theme.colors.outline, borderBottomWidth: 0.5 }]}>
                        {/* Name */}
                        <View style={styles.colName}>
                            {gas.isCustom && !readOnlyNames ? (
                                <TextInput mode="flat" dense value={gas.name} onChangeText={v => onUpdate(gas.id, 'name', v)} style={styles.cellInput} underlineColor="transparent" placeholder="Name" />
                            ) : (
                                <Text style={{ fontWeight: 'bold', paddingLeft: 4 }}>{gas.name} ({gas.unit})</Text>
                            )}
                        </View>
                        {/* TLV */}
                        <View style={styles.colTlv}>
                             {gas.isCustom && !readOnlyNames ? (
                                <TextInput mode="flat" dense value={gas.tlv} onChangeText={v => onUpdate(gas.id, 'tlv', v)} style={[styles.cellInput]} underlineColor="transparent" keyboardType="numeric" />
                             ) : (
                                <Text style={{ paddingLeft: 4, opacity: 0.7 }}>{gas.tlv}</Text>
                             )}
                        </View>
                        {/* Readings */}
                        {renderInput(gas, 'top')}
                        {renderInput(gas, 'mid')}
                        {renderInput(gas, 'bot')}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
    tableHeader: { paddingVertical: 8, borderRadius: 8, marginBottom: 4 },
    headerText: { fontWeight: 'bold', fontSize: 12, opacity: 0.8 },
    colName: { width: 100, justifyContent: 'center', paddingRight: 4 },
    colTlv: { width: 60, justifyContent: 'center' },
    colReading: { width: 70, paddingHorizontal: 2 },
    cellInput: { fontSize: 13, height: 40, backgroundColor: 'transparent' },
    cellInputBox: { fontSize: 13, height: 35, backgroundColor: '#fff', textAlign: 'center' }
});