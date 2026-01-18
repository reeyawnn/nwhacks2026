import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addRewardMinutes } from '@/store/reward-store';

const BOTTOM_THRESHOLD = -20;  // Beta angle must reach -20° or higher (closer to 0)
const COOLDOWN_MS = 1000;      // 1 second cooldown between reps

const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export default function SquatTrackerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId?: string;
    exerciseName?: string;
    targetReps?: string;
    source?: string;
  }>();

  const targetReps = useMemo(() => {
    const parsed = Number(params.targetReps);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [params.targetReps]);

  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [beta, setBeta] = useState(0);
  const [verticalAccel, setVerticalAccel] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');

  const lastRepTimeRef = useRef(0);
  const rewardHandledRef = useRef(false);

  useEffect(() => {
    DeviceMotion.isAvailableAsync().then(setIsAvailable);
  }, []);

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    DeviceMotion.setUpdateInterval(50);

    const subscription = DeviceMotion.addListener((data) => {
      const acc = data.accelerationIncludingGravity ?? { x: 0, y: 0, z: 0 };
      const rotation = data.rotation ?? { beta: 0 };
      
      // Beta angle in degrees
      const nextBeta = toDegrees(rotation.beta ?? 0);
      setBeta(nextBeta);

      // Vertical acceleration (z-axis)
      const zAccel = acc.z ?? 0;
      setVerticalAccel(zAccel);

      // Check if we hit the threshold and cooldown has passed
      const now = Date.now();
      if (nextBeta >= BOTTOM_THRESHOLD && now - lastRepTimeRef.current >= COOLDOWN_MS) {
        lastRepTimeRef.current = now;
        setRepCount((current) => current + 1);
      }
    });

    return () => subscription.remove();
  }, [isTracking]);

  useEffect(() => {
    if (targetReps > 0 && repCount >= targetReps) {
      setIsTracking(false);
    }
  }, [repCount, targetReps]);

  useEffect(() => {
    if (rewardHandledRef.current) return;
    if (targetReps === 0 || repCount < targetReps) return;

    const bonusMinutes = Math.max(1, Math.ceil(targetReps / 2));
    rewardHandledRef.current = true;

    if (params.source === 'focus') {
      router.replace({
        pathname: '/relax',
        params: { minutes: String(bonusMinutes), label: params.exerciseName ?? 'Squats' },
      });
    } else {
      addRewardMinutes(bonusMinutes);
      setRewardMessage(`Added ${bonusMinutes} min to reward time.`);
    }
  }, [params.exerciseName, params.source, repCount, router, targetReps]);

  const resetSession = () => {
    setRepCount(0);
    setBeta(0);
    setVerticalAccel(0);
    setRewardMessage('');
    lastRepTimeRef.current = 0;
    rewardHandledRef.current = false;
  };

  const toggleTracking = () => {
    if (!isTracking) {
      resetSession();
    }
    setIsTracking((current) => !current);
  };

  const progress = targetReps > 0 ? Math.min(repCount / targetReps, 1) : 0;
  const goalReached = targetReps > 0 && repCount >= targetReps;
  
  const statusText =
    isAvailable === false
      ? 'Sensors unavailable on this device.'
      : isAvailable === null
        ? 'Checking sensor availability...'
        : !isTracking
          ? 'Tap start and begin squatting.'
          : goalReached
            ? rewardMessage || 'Goal reached! Take a breather.'
            : 'Squat down to at least -20° beta.';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#B8E6FF', dark: '#B8E6FF' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.ribbon} />
          <View style={styles.sparkle} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#1C3A2A" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} lightColor="#1C3A2A" darkColor="#1C3A2A">
            {params.exerciseName ?? 'Squats'}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#2E5066" darkColor="#2E5066">
            Pocket your phone, then follow the cues to count reps.
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.statsCard}>
          <ThemedText style={styles.statsTitle} lightColor="#0E2A3B" darkColor="#0E2A3B">
            Rep tracker
          </ThemedText>
          <ThemedText style={styles.statsSubtitle} lightColor="#2E5066" darkColor="#2E5066">
            Simple threshold tracking using beta angle.
          </ThemedText>
          <View style={styles.metricRow}>
            <View>
              <ThemedText style={styles.metricLabel} lightColor="#2E5066" darkColor="#2E5066">
                Target
              </ThemedText>
              <ThemedText style={styles.metricValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
                {targetReps || '--'}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.metricLabel} lightColor="#2E5066" darkColor="#2E5066">
                Counted
              </ThemedText>
              <ThemedText style={styles.metricValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
                {repCount}
              </ThemedText>
            </View>
            <View>
              <ThemedText style={styles.metricLabel} lightColor="#2E5066" darkColor="#2E5066">
                Status
              </ThemedText>
              <ThemedText style={styles.metricValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
                {beta >= BOTTOM_THRESHOLD ? '✓' : '—'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <ThemedText style={styles.statusText} lightColor="#2E5066" darkColor="#2E5066">
            {statusText}
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, isTracking ? styles.stopButton : styles.startButton]}
              onPress={toggleTracking}
              disabled={isAvailable === false}>
              <ThemedText style={styles.actionText} lightColor="#0E2A3B" darkColor="#0E2A3B">
                {isTracking ? 'Stop' : 'Start'}
              </ThemedText>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetSession}>
              <ThemedText style={styles.secondaryText} lightColor="#0E2A3B" darkColor="#0E2A3B">
                Reset
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
        <ThemedView style={styles.dataCard}>
          <ThemedText style={styles.dataTitle} lightColor="#0E2A3B" darkColor="#0E2A3B">
            Live signal
          </ThemedText>
          <View style={styles.dataRow}>
            <ThemedText style={styles.dataLabel} lightColor="#2E5066" darkColor="#2E5066">
              Beta
            </ThemedText>
            <ThemedText style={styles.dataValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
              {beta.toFixed(1)}°
            </ThemedText>
          </View>
          <View style={styles.dataRow}>
            <ThemedText style={styles.dataLabel} lightColor="#2E5066" darkColor="#2E5066">
              Threshold
            </ThemedText>
            <ThemedText style={styles.dataValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
              {BOTTOM_THRESHOLD}°
            </ThemedText>
          </View>
          <View style={styles.dataRow}>
            <ThemedText style={styles.dataLabel} lightColor="#2E5066" darkColor="#2E5066">
              V. Accel
            </ThemedText>
            <ThemedText style={styles.dataValue} lightColor="#0E2A3B" darkColor="#0E2A3B">
              {verticalAccel.toFixed(2)} m/s²
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  ribbon: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 140,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#6FD2FF',
    opacity: 0.7,
  },
  sparkle: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D8F2FF',
    opacity: 0.9,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8F2FF',
    borderWidth: 2,
    borderColor: '#6FD2FF',
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'ZalandoSansExpanded',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 280,
  },
  body: {
    gap: 18,
  },
  statsCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#E5F6FF',
    borderWidth: 2,
    borderColor: '#8CD9FF',
  },
  statsTitle: {
    fontSize: 20,
    fontFamily: 'ZalandoSansExpanded',
    marginBottom: 6,
  },
  statsSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'ZalandoSansExpanded',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#CBEFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8CD9FF',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3BB4E5',
  },
  statusText: {
    fontSize: 13,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  startButton: {
    backgroundColor: '#B8E6FF',
    borderColor: '#3BB4E5',
  },
  stopButton: {
    backgroundColor: '#FFD3D3',
    borderColor: '#E08B8B',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'ZalandoSansExpanded',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8CD9FF',
    backgroundColor: '#F3FBFF',
  },
  secondaryText: {
    fontSize: 14,
    fontFamily: 'ZalandoSansExpanded',
  },
  dataCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#F3FBFF',
    borderWidth: 2,
    borderColor: '#CBEFFF',
  },
  dataTitle: {
    fontSize: 16,
    fontFamily: 'ZalandoSansExpanded',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 12,
  },
  dataValue: {
    fontSize: 14,
    fontFamily: 'ZalandoSansExpanded',
  },
});