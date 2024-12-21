import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const WATER_STORAGE_KEY = '@water_intake';
const TARGET_KEY = '@daily_target';
const GLASS_SIZES = [
  { size: 100, icon: 'coffee', label: 'Small Cup' },
  { size: 200, icon: 'wine-glass', label: 'Glass' },
  { size: 300, icon: 'wine-glass-alt', label: 'Tall Glass' },
  { size: 400, icon: 'flask', label: 'Large Glass' },
  { size: 650, icon: 'water', label: 'Bottle' }
];
const DEFAULT_TARGET = 2500;
const AVAILABLE_ICONS = [
  'glass', 'wine-glass', 'wine-glass-alt', 'coffee', 'flask', 'water', 'beer', 'mug-hot',
  'glass-whiskey', 'glass-martini', 'glass-martini-alt', 'glass-cheers'
];

export default function WaterTrackingScreen() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [glassSize, setGlassSize] = useState(250);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(DEFAULT_TARGET);
  const [customSize, setCustomSize] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('glass');

  useFocusEffect(
    React.useCallback(() => {
      loadDailyTarget();
    }, [])
  );

  useEffect(() => {
    loadWaterIntake();
    loadDailyTarget();
  }, []);

  const loadWaterIntake = async () => {
    try {
      const savedIntake = await AsyncStorage.getItem(WATER_STORAGE_KEY);
      if (savedIntake) {
        setWaterIntake(parseInt(savedIntake));
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    }
  };

  const loadDailyTarget = async () => {
    try {
      const savedTarget = await AsyncStorage.getItem(TARGET_KEY);
      savedTarget ? setDailyTarget(parseInt(savedTarget)) : setDailyTarget(DEFAULT_TARGET);
    } catch (error) {
      console.error('Error loading daily target:', error);
    }
  };

  const saveWaterIntake = async (amount: number) => {
    try {
      await AsyncStorage.setItem(WATER_STORAGE_KEY, amount.toString());
      setWaterIntake(amount);
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  };

  const addWater = () => {
    const newAmount = waterIntake + glassSize;
    saveWaterIntake(newAmount);
  };

  const removeWater = () => {
    const newAmount = Math.max(0, waterIntake - glassSize);
    saveWaterIntake(newAmount);
  };

  const selectGlassSize = (size: number, icon?: string) => {
    setGlassSize(size);
    if (icon) {
      const newGlass = { size, icon, label: `${size}ml Glass` };
      GLASS_SIZES.push(newGlass);
      GLASS_SIZES.sort((a, b) => a.size - b.size);
    }
    setShowCustomInput(false);
    setCustomSize('');
    setShowSizeModal(false);
  };

  const getCurrentGlassIcon = () => {
    const currentGlass = GLASS_SIZES.find(g => g.size === glassSize) || GLASS_SIZES[1];
    return currentGlass.icon;
  };

  const getSortedGlasses = () => {
    return [...GLASS_SIZES].sort((a, b) => a.size - b.size);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tracker</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.intakeText}>{waterIntake}ml</Text>
        <Text style={styles.targetText}>Daily Target: {dailyTarget}ml</Text>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min((waterIntake / dailyTarget) * 100, 100)}%` }
            ]}
          />
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={removeWater}
        >
          <FontAwesome5 name="minus" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.glassButton}
          onPress={() => setShowSizeModal(true)}
        >
          <View style={styles.glassIconContainer}>
            <FontAwesome5 name={getCurrentGlassIcon()} size={48} color="#2196F3" />
            <Text style={styles.glassText}>{glassSize}ml</Text>
          </View>
          <View style={styles.selectSizeButton}>
            <Text style={styles.selectSizeText}>Change Size</Text>
            <FontAwesome5 name="chevron-down" size={16} color="#2196F3" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={addWater}
        >
          <FontAwesome5 name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSizeModal}
        onRequestClose={() => setShowSizeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!showCustomInput) {
              setShowSizeModal(false);
              setShowCustomInput(false);
              setCustomSize('');
            }
          }}
        >
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sizesContainer}
            >
              {getSortedGlasses().map((glass) => (
                <TouchableOpacity
                  key={glass.size}
                  style={[
                    styles.sizeOption,
                    glassSize === glass.size && styles.selectedSize,
                  ]}
                  onPress={() => selectGlassSize(glass.size)}
                >
                  <FontAwesome5 name={glass.icon} size={32} color="#2196F3" />
                  <Text style={styles.sizeText}>{glass.size}ml</Text>
                  <Text style={styles.sizeLabel}>{glass.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.sizeOption, showCustomInput && styles.selectedSize]}
                onPress={() => setShowCustomInput(true)}
              >
                <FontAwesome5 name="plus-circle" size={32} color="#2196F3" />
                <Text style={styles.sizeText}>Custom</Text>
                <Text style={styles.sizeLabel}>Size</Text>
              </TouchableOpacity>
            </ScrollView>
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.customInput}
                    keyboardType="number-pad"
                    placeholder="Enter size in ml"
                    value={customSize}
                    onChangeText={setCustomSize}
                  />
                  <TouchableOpacity
                    style={[
                      styles.customSizeButton,
                      !customSize && styles.customSizeButtonDisabled
                    ]}
                    disabled={!customSize}
                    onPress={() => {
                      const size = parseInt(customSize);
                      if (size > 0 && size <= 2000) {
                        selectGlassSize(size, selectedIcon);
                        setShowCustomInput(false);
                        setCustomSize('');
                        setShowSizeModal(false);
                      } else {
                        Alert.alert('Invalid Size', 'Please enter a size between 1 and 2000 ml');
                      }
                    }}
                  >
                    <Text style={[
                      styles.customSizeButtonText,
                      !customSize && styles.customSizeButtonTextDisabled
                    ]}>Add</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.iconSelectorContainer}>
                  <Text style={styles.iconSelectorTitle}>Choose an icon:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.iconGrid}>
                      {AVAILABLE_ICONS.map((icon) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconOption,
                            selectedIcon === icon && styles.selectedIconOption
                          ]}
                          onPress={() => setSelectedIcon(icon)}
                        >
                          <FontAwesome5
                            name={icon}
                            size={24}
                            color={selectedIcon === icon ? '#2196F3' : '#666'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  statsContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  intakeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  targetText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#2196F3',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  glassButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  glassIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  glassText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 5,
  },
  selectSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectSizeText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 30,
    maxHeight: '40%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  customInputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  customInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  customSizeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customSizeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  customSizeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customSizeButtonTextDisabled: {
    color: '#666666',
  },
  sizesContainer: {
    padding: 20,
  },
  sizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#f5f5f5',
    width: 100,
  },
  selectedSize: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  sizeText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  sizeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  iconSelectorContainer: {
    marginTop: 10,
  },
  iconSelectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedIconOption: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
});
