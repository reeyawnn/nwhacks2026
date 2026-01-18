import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Alert } from 'react-native';

import { DeviceMotion } from 'expo-sensors';
import * as FileSystem from 'expo-file-system/legacy'; // Using the legacy import for SDK 54 compatibility
import * as Sharing from 'expo-sharing';

const DATA_DIR = ((FileSystem as any).documentDirectory ?? '') + 'windows/';
const WINDOW_DURATION_MS = 2000;
const SAMPLE_INTERVAL_MS = 100;
const PRE_RECORD_DELAY_MS = 2000; // 2 second countdown

export default function App() {
  const [status, setStatus] = useState('Idle');
  const [count, setCount] = useState(0);

  async function ensureDir() {
    if (!FileSystem.documentDirectory) return false;
    const info = await FileSystem.getInfoAsync(DATA_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(DATA_DIR, { intermediates: true });
    }
    return true;
  }

  async function recordWindow(label: 'squat' | 'non_squat') {
    const dirReady = await ensureDir();
    if (!dirReady) return;

    // --- PHASE 1: COUNTDOWN ---
    setStatus('Get Ready (2s)...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStatus('Get Ready (1s)...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- PHASE 2: RECORDING & VIBRATING ---
    setStatus(`RECORDING ${label.toUpperCase()}...`);
    
    // Start vibration: pattern [delay, duration, delay, duration...] 
    // This creates a continuous buzz for the 2 seconds
    Vibration.vibrate([0, WINDOW_DURATION_MS], false); 

    const samples: any[] = [];
    const startTime = Date.now();
    DeviceMotion.setUpdateInterval(SAMPLE_INTERVAL_MS);

    const subscription = DeviceMotion.addListener((data) => {
      const t = Date.now() - startTime;
      if (t > WINDOW_DURATION_MS) return;

      if (data.acceleration && data.rotation) {
        samples.push({
          t,
          beta: data.rotation.beta ? data.rotation.beta * (180 / Math.PI) : 0,
          verticalAccel: data.acceleration.y ?? 0,
        });
      }
    });

    // Wait for the window to finish
    await new Promise(resolve => setTimeout(resolve, WINDOW_DURATION_MS));
    
    // Cleanup
    subscription.remove();
    Vibration.cancel(); // Ensure vibration stops immediately

    // --- PHASE 3: SAVING ---
    const windowData = {
      label,
      duration_ms: WINDOW_DURATION_MS,
      data: samples,
    };

    const filename = `${label}_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(
      DATA_DIR + filename,
      JSON.stringify(windowData, null, 2)
    );

    setCount(c => c + 1);
    setStatus('Saved ✔ - Ready for next');
  }

  async function exportData() {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing not available');
      return;
    }
    await Sharing.shareAsync(DATA_DIR);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Squat Collector</Text>
      <Text style={[styles.status, status.includes('RECORDING') && { color: '#ff4444', fontWeight: 'bold' }]}>
        {status}
      </Text>
      <Text style={styles.counter}>Saved Samples: {count}</Text>

      <TouchableOpacity
        style={[styles.button, styles.squat]}
        onPress={() => recordWindow('squat')}
      >
        <Text style={styles.buttonText}>RECORD SQUAT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.nonSquat]}
        onPress={() => recordWindow('non_squat')}
      >
        <Text style={styles.buttonText}>RECORD NON-SQUAT</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.button, styles.export]}
        onPress={exportData}
      >
        <Text style={styles.buttonText}>EXPORT ALL DATA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { fontSize: 28, color: '#fff', marginBottom: 5, fontWeight: '800' },
  status: { fontSize: 18, color: '#42A5F5', marginBottom: 15, textAlign: 'center', height: 30 },
  counter: { fontSize: 20, color: '#4CAF50', marginBottom: 40 },
  button: { width: '100%', padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  squat: { backgroundColor: '#2E7D32' },
  nonSquat: { backgroundColor: '#EF6C00' },
  export: { backgroundColor: '#1565C0' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, width: '100%', backgroundColor: '#333', marginVertical: 20 }
});