import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const WATER_STORAGE_KEY = '@water_intake';
const GLASS_SIZES = [
  { size: 100, icon: 'coffee', label: 'Small Cup' },
  { size: 200, icon: 'wine-glass', label: 'Glass' },
  { size: 300, icon: 'wine-glass-alt', label: 'Tall Glass' },
  { size: 400, icon: 'flask', label: 'Large Glass' },
  { size: 650, icon: 'water', label: 'Bottle' }
];

export default function WaterTrackingScreen() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [glassSize, setGlassSize] = useState(250);
  const [showSizeModal, setShowSizeModal] = useState(false);

  useEffect(() => {
    loadWaterIntake();
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

  const selectGlassSize = (size: number) => {
    setGlassSize(size);
    setTimeout(() => {
      setShowSizeModal(false);
    }, 150);
  };

  const getCurrentGlassIcon = () => {
    const currentGlass = GLASS_SIZES.find(g => g.size === glassSize) || GLASS_SIZES[1];
    return currentGlass.icon;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Tracker</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.intakeText}>{waterIntake}ml</Text>
        <Text style={styles.targetText}>Daily Goal: 2000ml</Text>
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
            setTimeout(() => {
              setShowSizeModal(false);
            }, 150);
          }}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              style={styles.scrollView}
            >
              {GLASS_SIZES.map((item) => (
                <TouchableOpacity
                  key={item.size}
                  style={[
                    styles.sizeOptionHorizontal,
                    item.size === glassSize && styles.selectedSize
                  ]}
                  onPress={() => selectGlassSize(item.size)}
                >
                  <FontAwesome5 
                    name={item.icon} 
                    size={32} 
                    color={item.size === glassSize ? 'white' : '#333'} 
                  />
                  <Text style={[
                    styles.sizeOptionLabel,
                    item.size === glassSize && styles.selectedSizeText
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={[
                    styles.sizeOptionVolume,
                    item.size === glassSize && styles.selectedSizeText
                  ]}>
                    {item.size}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  scrollView: {
    flexGrow: 0,
  },
  horizontalScrollContent: {
    paddingHorizontal: 10,
    flexGrow: 1,
    justifyContent: 'center',
  },
  sizeOptionHorizontal: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 8,
    alignItems: 'center',
    width: 110,
    height: 120,
    justifyContent: 'center',
  },
  sizeOptionLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  sizeOptionVolume: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedSize: {
    backgroundColor: '#2196F3',
  },
  selectedSizeText: {
    color: 'white',
  },
});
