import { StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITY_LOG = [
  { id: '1', label: 'Jump rope', minutes: 12, time: '9:10 AM' },
  { id: '2', label: 'Push-ups', minutes: 8, time: '11:40 AM' },
  { id: '3', label: 'Yoga flow', minutes: 20, time: '2:05 PM' },
  { id: '4', label: 'Dance break', minutes: 10, time: '4:25 PM' },
  { id: '5', label: 'Plank holds', minutes: 6, time: '6:10 PM' },
];

export default function ActivityLogScreen() {
  const router = useRouter();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
      backgroundColor="#FFDD7A"
      headerImage={
        <View style={styles.header}>
          <View style={styles.cloudOne} />
          <View style={styles.cloudTwo} />
          <View style={styles.sunBubble} />
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={18} color="#6E4B1F" />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <ThemedText style={styles.headerBadgeText} lightColor="#6E4B1F" darkColor="#6E4B1F">
              Activity Log
            </ThemedText>
          </View>
          <ThemedText style={styles.headerTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Every rep counts
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Track how workouts convert into screen time rewards.
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body} lightColor="#FFDD7A" darkColor="#FFDD7A">
        <ThemedView style={styles.logCard}>
          <ThemedText style={styles.logTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Recent activity
          </ThemedText>
          <ThemedText style={styles.logSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Keep adding exercise bursts to grow your reward bank.
          </ThemedText>
          <View style={styles.logList}>
            {ACTIVITY_LOG.map((item) => (
              <View key={item.id} style={styles.logRow}>
                <View>
                  <ThemedText style={styles.logItemLabel} lightColor="#2C1C07" darkColor="#2C1C07">
                    {item.label}
                  </ThemedText>
                  <ThemedText style={styles.logItemTime} lightColor="#6E4B1F" darkColor="#6E4B1F">
                    {item.time}
                  </ThemedText>
                </View>
                <View style={styles.logPill}>
                  <ThemedText style={styles.logPillText} lightColor="#2C1C07" darkColor="#2C1C07">
                    +{item.minutes} min
                  </ThemedText>
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
  homeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2B3',
    borderWidth: 2,
    borderColor: '#E7B75D',
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
  headerTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 280,
  },
  body: {
    gap: 18,
  },
  logCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#FFF7E1',
    borderWidth: 2,
    borderColor: '#EFCB7B',
  },
  logTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  logSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  logList: {
    gap: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#FFFDF4',
    borderWidth: 2,
    borderColor: '#F1D79E',
  },
  logItemLabel: {
    fontSize: 15,
    fontFamily: 'Georgia',
  },
  logItemTime: {
    fontSize: 12,
    marginTop: 2,
  },
  logPill: {
    backgroundColor: '#FFD36E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#E8AD3F',
  },
  logPillText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});
