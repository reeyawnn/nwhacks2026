import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// 1. Point to your converted TFJS files in assets
const modelJson = require('../assets/tfjs_model/model.json');
const modelWeights = require('../assets/tfjs_model/group1-shard1of1.bin');

const { width } = Dimensions.get('window');

interface SensorFrame {
  beta: number;
  accel: number;
}

export default function SquatTracker() {
  const router = useRouter();
  const { target } = useLocalSearchParams<{ target: string }>();
  const targetReps = parseInt(target || '15');

  // State
  const [isReady, setIsReady] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [count, setCount] = useState(0);
  const [debugConfidence, setDebugConfidence] = useState(0);

  // Refs for high-speed tracking (avoiding re-renders)
  const buffer = useRef<SensorFrame[]>([]);
  const isCurrentlySquatting = useRef(false);
  const lastDetectionTime = useRef(0);

  // Constants for tuning
  const COOLDOWN_MS = 1200; 
  const THRESHOLD_SQUAT = 0.85; 
  const THRESHOLD_STAND = 0.20;

  // 2. Initialize TF.js and Load Model
  useEffect(() => {
    async function setup() {
      try {
        await tf.ready(); // Initialize the engine
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, modelWeights)
        );
        setModel(loadedModel);
        setIsReady(true);
        console.log("✅ AI Brain Ready");
      } catch (e) {
        console.error("❌ Failed to load AI model:", e);
      }
    }
    setup();
  }, []);

  // 3. Sensor Loop (10Hz / 100ms interval)
  useEffect(() => {
    if (!isReady) return;

    DeviceMotion.setUpdateInterval(100);
    const sub = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
      if (!data.rotation || !data.acceleration) return;

      // Add to sliding window
      buffer.current.push({ 
        beta: data.rotation.beta, 
        accel: data.acceleration.z 
      });

      // Maintain window of 20 frames
      if (buffer.current.length > 20) {
        buffer.current.shift();
        if (model) runInference();
      }
    });

    return () => sub.remove();
  }, [isReady, model]);

  // 4. Run AI Brain
  const runInference = async () => {
    if (!model) return;

    // PREPROCESSING
    const firstBeta = buffer.current[0].beta;
    const inputData = buffer.current.map((frame, i) => {
      const prevBeta = i > 0 ? buffer.current[i - 1].beta : frame.beta;
      return [
        frame.beta - firstBeta, // Zero-center
        frame.accel,            // Vertical Acceleration
        frame.beta - prevBeta   // Velocity (Angular change)
      ];
    });

    // Run prediction
    tf.tidy(() => {
      const inputTensor = tf.tensor3d([inputData]); // [Batch, Time, Features]
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const confidence = prediction.dataSync()[0];

      // Update debug confidence occasionally (optional)
      if (Math.random() > 0.8) setDebugConfidence(confidence);

      const now = Date.now();

      // DETECTION LOGIC
      if (confidence > THRESHOLD_SQUAT && !isCurrentlySquatting.current && (now - lastDetectionTime.current > COOLDOWN_MS)) {
        isCurrentlySquatting.current = true;
        lastDetectionTime.current = now;
        
        // Success Haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCount(c => c + 1);
      }

      // RESET LOGIC (Wait for them to stand back up)
      if (confidence < THRESHOLD_STAND && isCurrentlySquatting.current) {
        isCurrentlySquatting.current = false;
        // Small "ready" tap
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>Initializing AI Brain...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Main Counter */}
      <View style={styles.counterContainer}>
        <Text style={[styles.countText, count >= targetReps && {color: '#7FC08D'}]}>
          {count}
        </Text>
        <Text style={styles.targetText}>GOAL: {targetReps}</Text>
      </View>

      {/* Visual Feedback Bar */}
      <View style={styles.progressCard}>
        <View style={styles.iconCircle}>
          <Ionicons 
            name={isCurrentlySquatting.current ? "arrow-down-circle" : "fitness"} 
            size={30} 
            color="#7FC08D" 
          />
        </View>
        <View>
          <Text style={styles.instructionTitle}>
            {isCurrentlySquatting.current ? "Going down..." : "Ready for rep!"}
          </Text>
          <Text style={styles.instructionSub}>Hold phone steady against chest</Text>
        </View>
      </View>

      {/* Completion Button */}
      {count >= targetReps && (
        <TouchableOpacity 
          style={styles.finishBtn} 
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }}
        >
          <Text style={styles.finishBtnText}>WORKOUT COMPLETE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    color: '#7FC08D',
    fontSize: 18,
    fontFamily: 'ZalandoSansExpanded', // Using your project font
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  countText: {
    fontSize: 160,
    fontWeight: 'bold',
    color: '#FFF',
    lineHeight: 180,
  },
  targetText: {
    fontSize: 20,
    color: '#888',
    letterSpacing: 4,
    marginTop: -20,
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1C3A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  instructionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionSub: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  finishBtn: {
    backgroundColor: '#7FC08D',
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#7FC08D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  finishBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
});