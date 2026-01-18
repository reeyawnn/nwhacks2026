import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function RelaxScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ minutes?: string; label?: string }>();
  const relaxMinutes = useMemo(() => {
    const parsed = Number(params.minutes);
    return Number.isFinite(parsed) ? parsed : 1;
  }, [params.minutes]);

  const [remainingMs, setRemainingMs] = useState(relaxMinutes * 60 * 1000);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    setRemainingMs(relaxMinutes * 60 * 1000);
  }, [relaxMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setRemainingMs((current) => {
        if (current <= 1000) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return current - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const goHome = () => {
    router.replace('/(tabs)');
  };

  const toggle = () => {
    if (remainingMs === 0) return;
    setIsRunning((current) => !current);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D8E4FF', dark: '#D8E4FF' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.orb} />
          <View style={styles.orbTwo} />
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText} lightColor="#1F2A44" darkColor="#1F2A44">
              Relax Mode
            </ThemedText>
          </View>
          <ThemedText style={styles.headerTitle} lightColor="#1F2A44" darkColor="#1F2A44">
            Breathe it in
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#3B4A73" darkColor="#3B4A73">
            {params.label ? `${params.label} complete. Enjoy a short rest.` : 'Enjoy a short rest.'}
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.timerCard}>
          <ThemedText style={styles.timerTitle} lightColor="#1F2A44" darkColor="#1F2A44">
            Relax timer
          </ThemedText>
          <ThemedText style={styles.timerValue} lightColor="#1F2A44" darkColor="#1F2A44">
            {formatDuration(remainingMs)}
          </ThemedText>
          <ThemedText style={styles.timerHint} lightColor="#3B4A73" darkColor="#3B4A73">
            {remainingMs === 0 ? 'Rest complete. Head back when ready.' : 'Keep breathing and reset.'}
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.button, isRunning ? styles.pauseButton : styles.startButton]}
              onPress={toggle}>
              <ThemedText style={styles.buttonText} lightColor="#1F2A44" darkColor="#1F2A44">
                {isRunning ? 'Pause' : 'Resume'}
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.button, styles.secondaryButton]} onPress={goHome}>
              <ThemedText style={styles.buttonText} lightColor="#1F2A44" darkColor="#1F2A44">
                Done
              </ThemedText>
            </Pressable>
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
  orb: {
    position: 'absolute',
    top: 30,
    right: 24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#B8C8FF',
    opacity: 0.7,
  },
  orbTwo: {
    position: 'absolute',
    top: 60,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3E9FF',
    opacity: 0.9,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E3E9FF',
    borderWidth: 2,
    borderColor: '#A7B6F0',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: 'ZalandoSansExpanded',
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 40,
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
  timerCard: {
    padding: 22,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#B8C8FF',
    alignItems: 'center',
    gap: 12,
  },
  timerTitle: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'ZalandoSansExpanded',
  },
  timerValue: {
    fontSize: 54,
    lineHeight: 60,
    fontFamily: 'ZalandoSansExpanded',
  },
  timerHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A7B6F0',
    backgroundColor: '#DCE4FF',
  },
  pauseButton: {
    backgroundColor: '#F8D6D6',
    borderColor: '#E0A0A0',
  },
  startButton: {
    backgroundColor: '#DCE4FF',
    borderColor: '#A7B6F0',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'ZalandoSansExpanded',
  },
});
