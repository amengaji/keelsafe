// mobile/src/screens/ActivePermit/ActivePermitScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/permitTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivePermit'>;

export default function ActivePermitScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { permitId } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium">Permit #{permitId}</Text>
      <Text style={{color: 'green', fontWeight: 'bold'}}>ACTIVE</Text>
      
      <View style={styles.content}>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Back to Dashboard
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});