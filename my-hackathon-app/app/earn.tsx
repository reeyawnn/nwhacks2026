import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const EARN_OPTIONS = [
  { id: 'upper', label: 'Upper body', detail: 'Push-ups, curls, presses' },
  { id: 'lower', label: 'Lower body', detail: 'Squats, lunges, steps' },
  { id: 'cardio', label: 'Cardio', detail: 'Dance, jump rope, jog' },
];

export default function EarnScreen() {
  const router = useRouter();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.ribbon} />
          <View style={styles.sparkle} />
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={18} color="#35543F" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} lightColor="#1C3A2A" darkColor="#1C3A2A">
            Choose your move
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#35543F" darkColor="#35543F">
            Pick a workout type to start earning screen time.
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.optionsCard}>
          <ThemedText style={styles.optionsTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Earn time menu
          </ThemedText>
          <ThemedText style={styles.optionsSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Each session adds bonus minutes to your rewards.
          </ThemedText>
          <View style={styles.optionList}>
            {EARN_OPTIONS.map((option) => (
              <Link
                key={option.id}
                href={{ pathname: '/exercises', params: { category: option.id } }}
                asChild>
                <Pressable style={styles.optionButton}>
                  <View>
                    <ThemedText
                      style={styles.optionLabel}
                      lightColor="#2C1C07"
                      darkColor="#2C1C07">
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      style={styles.optionDetail}
                      lightColor="#6E4B1F"
                      darkColor="#6E4B1F">
                      {option.detail}
                    </ThemedText>
                  </View>
                  <View style={styles.optionTag}>
                    <ThemedText
                      style={styles.optionTagText}
                      lightColor="#2C1C07"
                      darkColor="#2C1C07">
                      Start
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
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
  homeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
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
    fontFamily: 'ZalandoSansExpanded',
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
  optionsCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#FFF7E1',
    borderWidth: 2,
    borderColor: '#EFCB7B',
  },
  optionsTitle: {
    fontSize: 20,
    fontFamily: 'ZalandoSansExpanded',
    marginBottom: 6,
  },
  optionsSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  optionList: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFDF4',
    borderWidth: 2,
    borderColor: '#F1D79E',
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'ZalandoSansExpanded',
  },
  optionDetail: {
    fontSize: 12,
    marginTop: 4,
  },
  optionTag: {
    backgroundColor: '#FFD36E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#E8AD3F',
  },
  optionTagText: {
    fontSize: 12,
    fontFamily: 'ZalandoSansExpanded',
  },
});
