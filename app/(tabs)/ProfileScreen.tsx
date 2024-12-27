import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDailyWaterTarget } from '@/utils/waterCalculations';
import { ClimateOptions } from '@/constants/enums/ClimateOptions.enum';

const WEIGHT_KEY = '@user_weight';
const CLIMATE_KEY = '@user_climate';
const GENDER_KEY = '@user_gender';
const TARGET_KEY = '@daily_target';

const CLIMATE_OPTIONS = [
  { label: 'Select climate...', value: '' },
  { label: ClimateOptions.Hot, value: ClimateOptions.Hot },
  { label: ClimateOptions.Humid, value: ClimateOptions.Humid },
  { label: ClimateOptions.Mild, value: ClimateOptions.Mild },
  { label: ClimateOptions.Cold, value: ClimateOptions.Cold },
];

const GENDER_OPTIONS = [
  { label: 'Select gender...', value: '' },
  { label: 'Female', value: 'Female' },
  { label: 'Male', value: 'Male' },
  { label: 'Other', value: 'Other' },
];

export default function ProfileScreen() {
  const [weight, setWeight] = useState('');
  const [climate, setClimate] = useState('');
  const [gender, setGender] = useState('');
  const [waterTarget, setWaterTarget] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedWeight = await AsyncStorage.getItem(WEIGHT_KEY);
      const savedClimate = await AsyncStorage.getItem(CLIMATE_KEY);
      const savedGender = await AsyncStorage.getItem(GENDER_KEY);
      const savedTarget = await AsyncStorage.getItem(TARGET_KEY);
      
      if (savedWeight) setWeight(savedWeight);
      if (savedClimate) setClimate(savedClimate);
      if (savedGender) setGender(savedGender);
      if (savedTarget) setWaterTarget(parseInt(savedTarget));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const recalculateTarget = async () => {
    try {
      const currentWeight = await AsyncStorage.getItem(WEIGHT_KEY);
      const currentClimate = await AsyncStorage.getItem(CLIMATE_KEY);
      const currentGender = await AsyncStorage.getItem(GENDER_KEY);
      
      if (currentWeight) {
        const target = calculateDailyWaterTarget(
          parseFloat(currentWeight),
          currentClimate || 'mild',
          currentGender || 'other'
        );
        await AsyncStorage.setItem(TARGET_KEY, target.toString());
        setWaterTarget(target);
      }
    } catch (error) {
      console.error('Error calculating target:', error);
    }
  };

  const saveWeight = async (value: string) => {
    try {
      await AsyncStorage.setItem(WEIGHT_KEY, value);
      setWeight(value);
      await recalculateTarget();
    } catch (error) {
      console.error('Error saving weight:', error);
    }
  };

  const saveClimate = async (value: string) => {
    try {
      await AsyncStorage.setItem(CLIMATE_KEY, value);
      setClimate(value);
      await recalculateTarget();
    } catch (error) {
      console.error('Error saving climate:', error);
    }
  };

  const saveGender = async (value: string) => {
    try {
      await AsyncStorage.setItem(GENDER_KEY, value);
      setGender(value);
      await recalculateTarget();
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      
      {waterTarget > 0 && (
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Recommended Daily Water Intake:</Text>
          <Text style={styles.targetValue}>{waterTarget}ml</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={saveGender}
            style={styles.picker}
          >
            {GENDER_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={saveWeight}
          placeholder="Enter your weight"
          keyboardType="numeric"
          maxLength={5}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Climate</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={climate}
            onValueChange={saveClimate}
            style={styles.picker}
          >
            {CLIMATE_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2196F3',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    ...Platform.select({
      ios: {
        paddingVertical: 8,
      },
    }),
  },
  picker: {
    ...Platform.select({
      android: {
        paddingHorizontal: 8,
      },
    }),
  },
  targetContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  targetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});
