import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EXERCISES_BY_CATEGORY: Record<
  string,
  { id: string; name: string; reps: number; detail: string }[]
> = {
  upper: [
    { id: 'push-ups', name: 'Push-ups', reps: 10, detail: 'Chest and arms' },
    { id: 'tricep-dips', name: 'Tricep dips', reps: 12, detail: 'Use a sturdy chair' },
    { id: 'plank-taps', name: 'Plank taps', reps: 16, detail: 'Core + shoulders' },
  ],
  lower: [
    { id: 'squats', name: 'Squats', reps: 15, detail: 'Bodyweight power' },
    { id: 'lunges', name: 'Lunges', reps: 12, detail: 'Per leg' },
    { id: 'calf-raises', name: 'Calf raises', reps: 20, detail: 'Slow and steady' },
  ],
  cardio: [
    { id: 'jumping-jacks', name: 'Jumping jacks', reps: 30, detail: 'Fast pace' },
    { id: 'high-knees', name: 'High knees', reps: 25, detail: 'Lift knees high' },
    { id: 'dance', name: 'Dance burst', reps: 60, detail: 'Seconds' },
  ],
};

const CATEGORY_LABELS: Record<string, string> = {
  upper: 'Upper body',
  lower: 'Lower body',
  cardio: 'Cardio',
};

export default function ExercisesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const selectedCategory = category ?? 'upper';
  const exerciseList = useMemo(
    () => EXERCISES_BY_CATEGORY[selectedCategory] ?? EXERCISES_BY_CATEGORY.upper,
    [selectedCategory]
  );

  const [repsById, setRepsById] = useState(() =>
    Object.fromEntries(exerciseList.map((exercise) => [exercise.id, exercise.reps]))
  );

  const adjustReps = (id: string, delta: number) => {
    setRepsById((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta),
    }));
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.ribbon} />
          <View style={styles.sparkle} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#35543F" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} lightColor="#1C3A2A" darkColor="#1C3A2A">
            {CATEGORY_LABELS[selectedCategory] ?? 'Workout'} menu
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#35543F" darkColor="#35543F">
            Set your reps, then start a burst to earn time.
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.exerciseCard}>
          <ThemedText style={styles.exerciseTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Choose an exercise
          </ThemedText>
          <ThemedText style={styles.exerciseSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Tap + or - to adjust your rep goal.
          </ThemedText>
          <View style={styles.exerciseList}>
            {exerciseList.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseRow}>
                <View>
                  <ThemedText style={styles.exerciseName} lightColor="#2C1C07" darkColor="#2C1C07">
                    {exercise.name}
                  </ThemedText>
                  <ThemedText
                    style={styles.exerciseDetail}
                    lightColor="#6E4B1F"
                    darkColor="#6E4B1F">
                    {exercise.detail}
                  </ThemedText>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    style={[styles.stepperButton, styles.stepperMinus]}
                    onPress={() => adjustReps(exercise.id, -1)}>
                    <ThemedText style={styles.stepperText} lightColor="#2C1C07" darkColor="#2C1C07">
                      -
                    </ThemedText>
                  </Pressable>
                  <View style={styles.stepperValue}>
                    <ThemedText style={styles.stepperValueText} lightColor="#2C1C07" darkColor="#2C1C07">
                      {repsById[exercise.id] ?? 0}
                    </ThemedText>
                  </View>
                  <Pressable
                    style={[styles.stepperButton, styles.stepperPlus]}
                    onPress={() => adjustReps(exercise.id, 1)}>
                    <ThemedText style={styles.stepperText} lightColor="#2C1C07" darkColor="#2C1C07">
                      +
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ))}
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
    backgroundColor: '#A6E3B0',
    opacity: 0.75,
  },
  sparkle: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DDF6E0',
    opacity: 0.8,
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
    backgroundColor: '#DDF6E0',
    borderWidth: 2,
    borderColor: '#7FC08D',
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: 'Georgia',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 260,
  },
  body: {
    gap: 18,
  },
  exerciseCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#DDF6E0',
    borderWidth: 2,
    borderColor: '#A6E3B0',
  },
  exerciseTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  exerciseSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F1FBF2',
    borderWidth: 2,
    borderColor: '#BFE9C7',
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  exerciseDetail: {
    fontSize: 12,
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7FC08D',
    backgroundColor: '#BFE9C7',
  },
  stepperMinus: {
    backgroundColor: '#E4F3E6',
  },
  stepperPlus: {
    backgroundColor: '#BFE9C7',
  },
  stepperText: {
    fontSize: 18,
    fontFamily: 'Georgia',
  },
  stepperValue: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7FC08D',
  },
  stepperValueText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
