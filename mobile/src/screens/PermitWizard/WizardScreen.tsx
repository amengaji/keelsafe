// mobile/src/screens/PermitWizard/WizardScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/permitTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'PermitWizard'>;

export default function WizardScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium">New Permit Application</Text>
      
      <View style={styles.content}>
        <Text>Wizard Steps will go here.</Text>
        
        <View style={styles.actions}>
           <Button mode="outlined" onPress={() => navigation.goBack()}>
             Cancel
           </Button>
           <Button mode="contained" onPress={() => console.log('Next step')}>
             Next Step
           </Button>
        </View>
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
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  }
});