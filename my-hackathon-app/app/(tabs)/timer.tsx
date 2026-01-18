import { DeviceMotion } from 'expo-sensors';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>📱 Set-Down Timer</Text>
      <Text style={styles.subtitle}>Hands-free timer that starts once your phone is placed down.</Text>

      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Countdown</Text>
        <Text style={styles.timerValue}>{formattedTime}</Text>
        <Text style={styles.statusText}>{status}</Text>
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
      </View>

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
          {isMonitoring ? 'Cancel' : 'Start Timer'}
        </Text>
      </TouchableOpacity>

      {baseline && (
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotTitle}>Position captured at {baseline.capturedAt}</Text>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Accel (x/y/z):</Text>
            <Text style={styles.snapshotValue}>
              {baseline.acceleration.x.toFixed(2)} / {baseline.acceleration.y.toFixed(2)} /{' '}
              {baseline.acceleration.z.toFixed(2)}
            </Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Rotation (α/β/γ):</Text>
            <Text style={styles.snapshotValue}>
              {toDegrees(baseline.rotation.alpha).toFixed(1)}° /{' '}
              {toDegrees(baseline.rotation.beta).toFixed(1)}° /{' '}
              {toDegrees(baseline.rotation.gamma).toFixed(1)}°
            </Text>
          </View>
        </View>
      )}

      <View style={styles.helperCard}>
        <Text style={styles.helperTitle}>How it works</Text>
        <Text style={styles.helperText}>1. Tap start and gently place your phone on a surface.</Text>
        <Text style={styles.helperText}>
          2. Once the sensors read a steady position for ~1s the timer begins.
        </Text>
        <Text style={styles.helperText}>
          3. Lifting or moving the phone stops the timer and locks in the duration.
        </Text>
      </View>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: 24,
    paddingTop: 80,
    gap: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  timerCard: {
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    color: '#777',
    fontSize: 14,
    letterSpacing: 1,
  },
  timerValue: {
    color: '#fff',
    fontSize: 54,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    color: '#8ddcba',
    textAlign: 'center',
    fontSize: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  stepper: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#232323',
    padding: 12,
  },
  stepperDisabled: {
    opacity: 0.5,
  },
  stepperLabel: {
    color: '#888',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    backgroundColor: '#171717',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2b2b2b',
  },
  stepperButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  stepperValue: {
    color: '#f5f5f5',
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sessionHint: {
    color: '#757575',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  warningText: {
    color: '#ffb347',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    backgroundColor: '#2c2c2c',
  },
  buttonTextDisabled: {
    color: '#6f6f6f',
  },
  button: {
    backgroundColor: '#35c759',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#ff4d4f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  snapshotCard: {
    backgroundColor: '#101010',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    gap: 8,
  },
  snapshotTitle: {
    color: '#eee',
    fontSize: 15,
    fontWeight: '600',
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotLabel: {
    color: '#888',
    fontSize: 14,
  },
  snapshotValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Menlo',
  },
  helperCard: {
    backgroundColor: '#0d0d0d',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1c1c1c',
    marginTop: 'auto',
  },
  helperTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 4,
  },
});
