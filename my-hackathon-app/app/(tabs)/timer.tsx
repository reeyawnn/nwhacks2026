import { DeviceMotion } from 'expo-sensors';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type MotionSnapshot = {
  acceleration: { x: number; y: number; z: number };
  rotation: { alpha: number; beta: number; gamma: number };
  capturedAt: string;
};

const STATIONARY_THRESHOLD = 0.12;
const STATIONARY_DURATION_MS = 1200;
const MOTION_END_THRESHOLD = 0.7;

export default function TimerScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPhoneDown, setIsPhoneDown] = useState(false);
  const [status, setStatus] = useState('Tap start to arm the timer.');
  const [baseline, setBaseline] = useState<MotionSnapshot | null>(null);
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const sessionTargetMs = (minutes * 60 + seconds) * 1000;
  const [remainingMs, setRemainingMs] = useState(sessionTargetMs);

  const stationaryStartRef = useRef<number | null>(null);
  const timerStartRef = useRef<number | null>(null);
  const consumedMsRef = useRef(0);

  const formattedTime = formatDuration(remainingMs);
  const isDurationZero = sessionTargetMs === 0;

  const armTimer = useCallback(() => {
    if (isDurationZero) {
      setStatus('Pick a duration before starting.');
      return;
    }
    setIsMonitoring(true);
    setIsPhoneDown(false);
    setBaseline(null);
    consumedMsRef.current = 0;
    setRemainingMs(sessionTargetMs);
    setStatus('Set the phone down to start the countdown.');
    stationaryStartRef.current = null;
    timerStartRef.current = null;
  }, [isDurationZero, sessionTargetMs]);

  const cancelMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setIsPhoneDown(false);
    setStatus('Timer cancelled. Tap start to arm again.');
    if (timerStartRef.current) {
      const now = Date.now();
      const addition = now - timerStartRef.current;
      timerStartRef.current = null;
      consumedMsRef.current += addition;
      setRemainingMs(Math.max(sessionTargetMs - consumedMsRef.current, 0));
    }
    stationaryStartRef.current = null;
  }, [sessionTargetMs]);

  const pauseTimer = useCallback(() => {
    if (timerStartRef.current) {
      const now = Date.now();
      const addition = now - timerStartRef.current;
      timerStartRef.current = null;
      consumedMsRef.current += addition;
      setRemainingMs(Math.max(sessionTargetMs - consumedMsRef.current, 0));
    }
    setIsPhoneDown(false);
    setStatus('Phone picked up — timer paused. Set it down to resume.');
    stationaryStartRef.current = null;
  }, [sessionTargetMs]);

  const completeSession = useCallback(() => {
    if (timerStartRef.current) {
      consumedMsRef.current = sessionTargetMs;
      timerStartRef.current = null;
    }
    setIsPhoneDown(false);
    setIsMonitoring(false);
    setStatus('Session complete! Tap start to run it again.');
    setRemainingMs(0);
    stationaryStartRef.current = null;
  }, [sessionTargetMs]);

  useEffect(() => {
    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

    if (isMonitoring) {
      DeviceMotion.setUpdateInterval(120);
      subscription = DeviceMotion.addListener((data) => {
        const acceleration = data.acceleration ?? { x: 0, y: 0, z: 0 };
        const rotation = data.rotation ?? { alpha: 0, beta: 0, gamma: 0 };
        const magnitude = Math.sqrt(
          acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
        );
        const now = Date.now();

        if (!isPhoneDown) {
          if (magnitude < STATIONARY_THRESHOLD) {
            if (!stationaryStartRef.current) {
              stationaryStartRef.current = now;
              setStatus('Hold still for a moment…');
            } else if (now - stationaryStartRef.current >= STATIONARY_DURATION_MS) {
              timerStartRef.current = now;
              setBaseline({
                acceleration,
                rotation,
                capturedAt: new Date(now).toLocaleTimeString(),
              });
              setIsPhoneDown(true);
              setStatus('Countdown running… keep the phone down.');
            }
          } else if (stationaryStartRef.current) {
            stationaryStartRef.current = null;
            setStatus('Set the phone down to start the countdown.');
          }
        } else if (magnitude > MOTION_END_THRESHOLD) {
          pauseTimer();
        }
      });
    }

    return () => {
      subscription?.remove();
    };
  }, [isMonitoring, isPhoneDown, pauseTimer]);

  useEffect(() => {
    if (!isMonitoring || !isPhoneDown) return;
    const interval = setInterval(() => {
      if (timerStartRef.current) {
        const elapsed = Date.now() - timerStartRef.current;
        const totalConsumed = consumedMsRef.current + elapsed;
        const remaining = Math.max(sessionTargetMs - totalConsumed, 0);
        setRemainingMs(remaining);
        if (remaining <= 0) {
          completeSession();
        }
      }
    }, 150);
    return () => clearInterval(interval);
  }, [completeSession, isMonitoring, isPhoneDown, sessionTargetMs]);

  useEffect(() => {
    if (!isMonitoring) {
      setRemainingMs(sessionTargetMs);
      consumedMsRef.current = 0;
    }
  }, [isMonitoring, sessionTargetMs]);

  const primaryAction = () => {
    if (isMonitoring) {
      cancelMonitoring();
    } else {
      armTimer();
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.cloudOne} />
          <View style={styles.cloudTwo} />
          <View style={styles.sunBubble} />
          <View style={styles.headerBadge}>
            <ThemedText style={styles.headerBadgeText} lightColor="#6E4B1F" darkColor="#6E4B1F">
              Focus Mode
            </ThemedText>
          </View>
          <ThemedText style={styles.headerTime} lightColor="#2C1C07" darkColor="#2C1C07">
            Stay locked in
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Phone down = countdown on. Lift it up to pause the sprint.
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.sessionCard}>
          <ThemedText style={styles.sessionTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Current focus sprint
          </ThemedText>
          <ThemedText style={styles.sessionSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Countdown only runs while your device stays put.
          </ThemedText>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerValue}>{formattedTime}</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <View style={styles.pickerRow}>
            <TimeStepper label="Minutes" value={minutes} setter={setMinutes} disabled={isMonitoring} />
            <TimeStepper label="Seconds" value={seconds} setter={setSeconds} disabled={isMonitoring} />
          </View>
          <Text style={styles.sessionHint}>
            Adjust minutes and seconds (0-59 each) before starting. Countdown only runs while the phone rests.
          </Text>
          {isDurationZero && !isMonitoring && (
            <Text style={styles.warningText}>Duration must be at least 1 second.</Text>
          )}
          <TouchableOpacity
            style={[
              styles.button,
              isMonitoring && styles.buttonCancel,
              !isMonitoring && isDurationZero && styles.buttonDisabled,
            ]}
            disabled={!isMonitoring && isDurationZero}
            onPress={primaryAction}
            activeOpacity={0.9}>
            <Text style={[styles.buttonText, !isMonitoring && isDurationZero && styles.buttonTextDisabled]}>
              {isMonitoring ? 'Cancel session' : 'Start focus session'}
            </Text>
          </TouchableOpacity>
        </ThemedView>

        {baseline && (
          <ThemedView style={styles.snapshotCard}>
            <ThemedText style={styles.snapshotTitle} lightColor="#2C1C07" darkColor="#2C1C07">
              Phone resting since {baseline.capturedAt}
            </ThemedText>
            <View style={styles.snapshotRow}>
              <ThemedText style={styles.snapshotLabel} lightColor="#6E4B1F" darkColor="#6E4B1F">
                Accel (x/y/z)
              </ThemedText>
              <Text style={styles.snapshotValue}>
                {baseline.acceleration.x.toFixed(2)} / {baseline.acceleration.y.toFixed(2)} /{' '}
                {baseline.acceleration.z.toFixed(2)}
              </Text>
            </View>
            <View style={styles.snapshotRow}>
              <ThemedText style={styles.snapshotLabel} lightColor="#6E4B1F" darkColor="#6E4B1F">
                Rotation (α/β/γ)
              </ThemedText>
              <Text style={styles.snapshotValue}>
                {toDegrees(baseline.rotation.alpha).toFixed(1)}° / {toDegrees(baseline.rotation.beta).toFixed(1)}° /{' '}
                {toDegrees(baseline.rotation.gamma).toFixed(1)}°
              </Text>
            </View>
          </ThemedView>
        )}

        <ThemedView style={styles.helperCard}>
          <ThemedText style={styles.helperTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            How focus mode works
          </ThemedText>
          <ThemedText style={styles.helperText} lightColor="#6E4B1F" darkColor="#6E4B1F">
            • Pick a session duration using the controls above.
          </ThemedText>
          <ThemedText style={styles.helperText} lightColor="#6E4B1F" darkColor="#6E4B1F">
            • Set your phone down to trigger the countdown.
          </ThemedText>
          <ThemedText style={styles.helperText} lightColor="#6E4B1F" darkColor="#6E4B1F">
            • Lifting the phone pauses progress until you return it.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

type TimeStepperProps = {
  label: string;
  value: number;
  setter: Dispatch<SetStateAction<number>>;
  disabled: boolean;
};

function TimeStepper({ label, value, setter, disabled }: TimeStepperProps) {
  const adjust = (delta: number) => {
    if (disabled) return;
    setter((prev) => {
      let next = prev + delta;
      if (next > 59) next = 0;
      if (next < 0) next = 59;
      return next;
    });
  };

  return (
    <View style={[styles.stepper, disabled && styles.stepperDisabled]}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={styles.stepperButton}
          onPress={() => adjust(-1)}
          disabled={disabled}>
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value.toString().padStart(2, '0')}</Text>
        <TouchableOpacity
          style={styles.stepperButton}
          onPress={() => adjust(1)}
          disabled={disabled}>
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes}:${seconds}.${tenths}`;
};

const toDegrees = (value: number) => (value ?? 0) * (180 / Math.PI);

const styles = StyleSheet.create({
  header: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'flex-end',
  },
  cloudOne: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 120,
    height: 46,
    borderRadius: 40,
    backgroundColor: '#FFF7D8',
    opacity: 0.85,
  },
  cloudTwo: {
    position: 'absolute',
    top: 22,
    right: 30,
    width: 90,
    height: 38,
    borderRadius: 40,
    backgroundColor: '#FFF1BF',
    opacity: 0.9,
  },
  sunBubble: {
    position: 'absolute',
    top: 40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFC95C',
    opacity: 0.7,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF2B3',
    borderWidth: 2,
    borderColor: '#E7B75D',
    marginBottom: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: 'Georgia',
  },
  headerTime: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Georgia',
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
  sessionCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#FFF7E1',
    borderWidth: 2,
    borderColor: '#EFCB7B',
    gap: 14,
  },
  sessionTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
  },
  sessionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  timerDisplay: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  timerValue: {
    fontSize: 54,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: '#2C1C07',
  },
  statusText: {
    color: '#1E3A34',
    textAlign: 'center',
    fontSize: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepper: {
    flex: 1,
    backgroundColor: '#FFFDF5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0D8A4',
    padding: 12,
  },
  stepperDisabled: {
    opacity: 0.5,
  },
  stepperLabel: {
    color: '#85652F',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    backgroundColor: '#FFE9B9',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E4B968',
  },
  stepperButtonText: {
    color: '#2C1C07',
    fontSize: 20,
    fontWeight: '600',
  },
  stepperValue: {
    color: '#2C1C07',
    fontSize: 30,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sessionHint: {
    color: '#6E4B1F',
    fontSize: 12,
  },
  warningText: {
    color: '#A65100',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#BFE9C7',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7FC08D',
  },
  buttonCancel: {
    backgroundColor: '#FFB4A2',
    borderColor: '#E26B5A',
  },
  buttonDisabled: {
    backgroundColor: '#E3E3E3',
    borderColor: '#CFCFCF',
  },
  buttonText: {
    color: '#1C3A2A',
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  buttonTextDisabled: {
    color: '#909090',
  },
  snapshotCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FDECD4',
    borderWidth: 2,
    borderColor: '#F0C896',
    gap: 10,
  },
  snapshotTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotLabel: {
    fontSize: 13,
  },
  snapshotValue: {
    color: '#2C1C07',
    fontSize: 13,
    fontFamily: 'Menlo',
  },
  helperCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#DDE8FF',
    borderWidth: 2,
    borderColor: '#A8BCF2',
    gap: 6,
  },
  helperTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
  },
});
