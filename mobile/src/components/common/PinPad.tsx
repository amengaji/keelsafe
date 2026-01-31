// mobile/src/components/common/PinPad.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Vibration } from 'react-native';
import { Text, Surface, IconButton, useTheme, Button, Icon, Avatar } from 'react-native-paper';
import { CREW_DATABASE, CrewMember } from '../../constants/crewData';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: (user: CrewMember) => void;
  title?: string;
  requiredRank?: string[]; // e.g. ['Master', 'Chief Officer']
}

export default function PinPad({ visible, onDismiss, onSuccess, title = "Authorize Action", requiredRank }: Props) {
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Reset when opened
  useEffect(() => {
    if (visible) {
        setPin('');
        setError('');
    }
  }, [visible]);

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 4) validate(newPin);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const validate = (inputPin: string) => {
    // 1. Find User
    const user = CREW_DATABASE.find(u => u.pin === inputPin);

    if (!user) {
        shake();
        setError('Invalid PIN');
        setTimeout(() => setPin(''), 500);
        return;
    }

    // 2. Check Rank (If required)
    if (requiredRank && !requiredRank.includes(user.rank)) {
        shake();
        setError(`Insufficient Rank. Requires: ${requiredRank.join(' or ')}`);
        setTimeout(() => setPin(''), 1000);
        return;
    }

    // 3. Success
    Vibration.vibrate(50);
    onSuccess(user);
  };

  const shake = () => {
      Vibration.vibrate([0, 50, 50, 50]); // Buzz-Buzz
  };

  // Render a Circle Button
  const NumBtn = ({ num }: { num: string }) => (
      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: theme.colors.elevation.level1 }]} 
        onPress={() => handlePress(num)}
        activeOpacity={0.7}
      >
          <Text variant="headlineMedium" style={{fontWeight:'bold'}}>{num}</Text>
      </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
        <View style={styles.overlay}>
            <Surface style={styles.pad} elevation={5}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View>
                        <Text variant="titleMedium" style={{fontWeight:'bold', color: theme.colors.primary}}>{title}</Text>
                        <Text variant="bodySmall" style={{opacity:0.6}}>Enter your 4-digit PIN</Text>
                    </View>
                    <IconButton icon="close" onPress={onDismiss} />
                </View>

                {/* PIN DOTS display */}
                <View style={styles.display}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={[
                            styles.dot, 
                            { 
                                backgroundColor: i < pin.length ? theme.colors.primary : theme.colors.surfaceVariant,
                                transform: [{ scale: i < pin.length ? 1.2 : 1 }]
                            }
                        ]} />
                    ))}
                </View>

                {/* ERROR MSG */}
                <View style={{height: 24, alignItems:'center', marginBottom: 16}}>
                    {error ? <Text style={{color: theme.colors.error, fontWeight:'bold'}}>{error}</Text> : null}
                </View>

                {/* KEYPAD GRID */}
                <View style={styles.grid}>
                    <View style={styles.row}><NumBtn num="1"/><NumBtn num="2"/><NumBtn num="3"/></View>
                    <View style={styles.row}><NumBtn num="4"/><NumBtn num="5"/><NumBtn num="6"/></View>
                    <View style={styles.row}><NumBtn num="7"/><NumBtn num="8"/><NumBtn num="9"/></View>
                    <View style={styles.row}>
                        <View style={styles.btnPlaceholder} />
                        <NumBtn num="0"/>
                        <TouchableOpacity style={styles.btnPlaceholder} onPress={handleDelete}>
                             <Icon source="backspace-outline" size={28} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                    </View>
                </View>

            </Surface>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pad: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  display: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 16, height: 40, alignItems:'center' },
  dot: { width: 16, height: 16, borderRadius: 8 },
  grid: { gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', gap: 16 },
  btn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  btnPlaceholder: { width: 72, height: 72, justifyContent: 'center', alignItems: 'center' },
});