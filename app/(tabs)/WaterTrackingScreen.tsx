import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DEFAULT_INTAKE_TARGET, DEFAULT_CUP, DEFAULT_CUP_SIZES } from '@/constants/Defaults';
import { WaterCup } from '@/types/WaterCup';
import { WaterCupIcons } from '@/constants/enums/WaterCupIcons.enum';

const WATER_INTAKE_KEY = '@water_intake';
const DAILY_TARGET_KEY = '@daily_target';
const CUP_SIZES_KEY = '@cup_sizes';
const SELECTED_WATER_CUP_KEY = '@selected_water_cup';

export default function WaterTrackingScreen() {
  const [showCupSizeModal, setShowCupSizeModal] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(DEFAULT_INTAKE_TARGET);
  const [selectedWaterCup, setSelectedWaterCup] = useState<WaterCup>(DEFAULT_CUP);
  const [waterIntake, setWaterIntake] = useState<WaterCup[]>([]);
  const [cupSizes, setCupSizes] = useState<WaterCup[]>(DEFAULT_CUP_SIZES);
  const [customSize, setCustomSize] = useState('');
  const [customIcon, setCustomIcon] = useState<WaterCupIcons>(DEFAULT_CUP_SIZES[0].icon);

  useFocusEffect(
    React.useCallback(() => {
      loadDailyTarget();
    }, [])
  );

  useEffect(() => {
    loadDailyTarget();
    loadWaterIntake();
    loadSelectedWaterCup();
    loadCupSizes();
  }, []);

  const loadDailyTarget = async () => {
    try {
      const savedTarget = await AsyncStorage.getItem(DAILY_TARGET_KEY);
      savedTarget ? setDailyTarget(parseInt(savedTarget)) : setDailyTarget(DEFAULT_INTAKE_TARGET);
    } catch (error) {
      console.error('Error loading daily target:', error);
    }
  };

  const loadWaterIntake = async () => {
    try {
      const savedIntake = await AsyncStorage.getItem(WATER_INTAKE_KEY);
      if (savedIntake) {
        const parsedIntake = JSON.parse(savedIntake);
        setWaterIntake(Array.isArray(parsedIntake) ? parsedIntake : []);
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    }
  };

  const loadSelectedWaterCup = async () => {
    try {
      const savedCup = await AsyncStorage.getItem(SELECTED_WATER_CUP_KEY);
      if (savedCup) {
        setSelectedWaterCup(JSON.parse(savedCup));
      }
    } catch (error) {
      console.error('Error loading selected water cup:', error);
    }
  };

  const loadCupSizes = async () => {
    try {
      const savedSizes = await AsyncStorage.getItem(CUP_SIZES_KEY);
      if (savedSizes) {
        const parsedSizes = JSON.parse(savedSizes);
        setCupSizes(parsedSizes);
      }
    } catch (error) {
      console.error('Error loading glass sizes:', error);
    }
  };

  const saveWaterIntake = async (intake: WaterCup[]) => {
    try {
      await AsyncStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(intake));
    } catch (error) {
      console.error('Error saving water intake:', error);
    }
  };

  const saveCupSizes = async (newSizes: typeof DEFAULT_CUP_SIZES) => {
    try {
      await AsyncStorage.setItem(CUP_SIZES_KEY, JSON.stringify(newSizes));
    } catch (error) {
      console.error('Error saving glass sizes:', error);
    }
  };

  const saveSelectedWaterCup = async (waterCup: WaterCup) => {
    try {
      await AsyncStorage.setItem(SELECTED_WATER_CUP_KEY, JSON.stringify(waterCup));
    } catch (error) {
      console.error('Error saving selected water cup:', error);
    }
  };

  const addWater = () => {
    const newWaterCup: WaterCup = { ...selectedWaterCup, date: new Date() };
    const updatedIntake: WaterCup[] = [...waterIntake, newWaterCup];
    setWaterIntake(updatedIntake);
    saveWaterIntake(updatedIntake)
  };

  const removeWater = () => {
    //TODO add logic to remove water based on selection, now it will remove the last added
    const updatedIntake: WaterCup[] = waterIntake.slice(0, -1);
    setWaterIntake(updatedIntake);
    saveWaterIntake(updatedIntake);
  };

  const selectCupSize = (waterCup: WaterCup) => {
    setShowCupSizeModal(false);
    setSelectedWaterCup(waterCup);
    saveSelectedWaterCup(waterCup);
  };

  const addCustomCup = (waterCup: WaterCup) => {
    const newCupSizes = [...cupSizes, waterCup];
    setCupSizes(newCupSizes);
    saveCupSizes(newCupSizes);
  };

  const removeCupSize = (waterCup: WaterCup) => {
    const newCupSizes = cupSizes.filter(e => e.size !== waterCup.size);
    setCupSizes(newCupSizes);
    saveCupSizes(newCupSizes);
    // If the current glass size is removed, set to the default
    if (selectedWaterCup.size === waterCup.size) {
      setSelectedWaterCup(DEFAULT_CUP);
      saveSelectedWaterCup(DEFAULT_CUP);
    }
  };

  const handleRemoveGlass = (waterCup: WaterCup) => {
    if (Platform.OS === 'web') {
      const confirmRemove = window.confirm(`Are you sure you want to remove the ${waterCup.size}ml glass?`);
      if (confirmRemove) {
        removeCupSize(waterCup);
      }
    } else {
      Alert.alert(
        'Remove Glass Size',
        `Are you sure you want to remove the ${waterCup.size}ml glass?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            onPress: () => removeCupSize(waterCup),
            style: 'destructive'
          }
        ]
      );
    }
  };

  const getSortedCups = () => {
    return [...cupSizes].sort((a, b) => a.size - b.size);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tracker</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.intakeText}>{waterIntake.reduce((total, cup) => total + cup.size, 0)}ml</Text>
        <Text style={styles.targetText}>Daily Target: {dailyTarget}ml</Text>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min((waterIntake.reduce((total, cup) => total + cup.size, 0) / dailyTarget) * 100, 100)}%` }
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
          onPress={() => setShowCupSizeModal(true)}
        >
          <View style={styles.glassIconContainer}>
            <FontAwesome5 name={selectedWaterCup.icon} size={48} color="#2196F3" />
            <Text style={styles.glassText}>{selectedWaterCup.size}ml</Text>
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
        visible={showCupSizeModal}
        onRequestClose={() => setShowCupSizeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!showCustomInput) {
              setShowCupSizeModal(false);
              setShowCustomInput(false);
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
              {getSortedCups().map((cup) => (
                <View key={cup.size} style={styles.sizeOptionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.sizeOption,
                      selectedWaterCup.size === cup.size && styles.selectedSize,
                    ]}
                    onPress={() => selectCupSize(cup)}
                  >
                    <FontAwesome5 name={cup.icon} size={32} color="#2196F3" />
                    <Text style={styles.sizeText}>{cup.size}ml</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => handleRemoveGlass(cup)}
                  >
                    <FontAwesome5 name="times" size={10} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.sizeOption, showCustomInput && styles.selectedSize]}
                onPress={() => setShowCustomInput(true)}
              >
                <FontAwesome5 name="plus-circle" size={32} color="#2196F3" />
                <Text style={styles.sizeText}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>
            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.addButton,
                      !customSize && styles.customSizeButtonDisabled
                    ]}
                    disabled={!customSize}
                    onPress={() => {
                      const size = parseInt(customSize);
                      if (size > 0) {
                        const newWaterCup = new WaterCup(size, customIcon, new Date());
                        selectCupSize(newWaterCup);
                        addCustomCup(newWaterCup);
                        setShowCustomInput(false);
                        setShowCupSizeModal(false);
                        setCustomSize('');
                        setCustomIcon(DEFAULT_CUP_SIZES[0].icon);
                      } else {
                        Alert.alert('Invalid Size', 'Please enter a size between 1 and 2000 ml');
                      }
                    }}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.cancelButton
                    ]}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomSize('');
                      setCustomIcon(DEFAULT_CUP_SIZES[0].icon);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.customInput}
                    keyboardType="number-pad"
                    placeholder="Enter size in ml"
                    value={customSize}
                    onChangeText={setCustomSize}
                  />
                </View>
                <View style={styles.iconSelectorContainer}>
                  <Text style={styles.iconSelectorTitle}>Choose an icon:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.iconGrid}>
                      {Object.values(WaterCupIcons).map((icon) => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconOption,
                            customIcon === icon && styles.selectedIconOption
                          ]}
                          onPress={() => setCustomIcon(icon)}
                        >
                          <FontAwesome5
                            name={icon}
                            size={24}
                            color={customIcon === icon ? '#2196F3' : '#666'}
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
    padding: 15,
  },
  inputRow: {
    marginTop: 10,
    marginBottom: 10,
  },
  customInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2196F3',
  },
  customSizeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  customSizeButtonTextDisabled: {
    color: '#666666',
  },
  sizesContainer: {
    padding: 20,
  },
  sizeOptionContainer: {
    position: 'relative',
    marginHorizontal: 8,
  },
  sizeOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
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
  removeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});
