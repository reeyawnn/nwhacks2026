import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRewardMinutes } from '@/store/reward-store';

const ACTIVITY_LOG = [
  { id: '1', label: 'Jump rope', minutes: 12, time: '9:10 AM' },
  { id: '2', label: 'Push-ups', minutes: 8, time: '11:40 AM' },
  { id: '3', label: 'Yoga flow', minutes: 20, time: '2:05 PM' },
  { id: '4', label: 'Dance break', minutes: 10, time: '4:25 PM' },
];

export default function HomeScreen() {
  const router = useRouter();
  const rewardMinutes = useRewardMinutes();
  const hours = Math.floor(rewardMinutes / 60);
  const minutes = rewardMinutes % 60;
  const rewardLabel = `${hours}h ${minutes}m`;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
      headerImage={
        <View style={styles.header}>
          <View style={styles.cloudOne} />
          <View style={styles.cloudTwo} />
          <View style={styles.sunBubble} />
          <Link href="/(tabs)/settings" asChild>
            <Pressable style={styles.settingsButton}>
              <Ionicons name="settings" size={18} color="#6E4B1F" />
            </Pressable>
          </Link>
          <View style={styles.headerBadge}>
            <ThemedText style={styles.headerBadgeText} lightColor="#6E4B1F" darkColor="#6E4B1F">
              Reward Time
            </ThemedText>
          </View>
          <ThemedText style={styles.headerTime} lightColor="#2C1C07" darkColor="#2C1C07">
            {rewardLabel}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Keep moving to unlock more screen time!
          </ThemedText>
        </View>
      }>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.actionCard}>
          <ThemedText style={styles.actionTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Power up a focus sprint
          </ThemedText>
          <ThemedText style={styles.actionSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Start a work session to stay on track and protect your reward time.
          </ThemedText>
          <Pressable style={styles.workButton} onPress={() => router.push('/timer')}>
            <ThemedText style={styles.workButtonText} lightColor="#1C3A2A" darkColor="#1C3A2A">
              Start focus session
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.earnCard}>
          <View style={styles.earnHeader}>
            <ThemedText style={styles.earnTitle} lightColor="#1F2A44" darkColor="#1F2A44">
              Earn more time
            </ThemedText>
            <ThemedText style={styles.earnSubtitle} lightColor="#4B5A82" darkColor="#4B5A82">
              Log quick exercises for instant bonus minutes.
            </ThemedText>
          </View>
          <Link href="/earn" asChild>
            <Pressable style={styles.earnButton}>
              <ThemedText style={styles.earnButtonText} lightColor="#2C1C07" darkColor="#2C1C07">
                Earn time now
              </ThemedText>
            </Pressable>
          </Link>
        </ThemedView>

        <ThemedView style={styles.logCard}>
          <ThemedText style={styles.logTitle} lightColor="#2C1C07" darkColor="#2C1C07">
            Activity log
          </ThemedText>
          <ThemedText style={styles.logSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
            Every movement converts to screen time.
          </ThemedText>
          <View style={styles.logList}>
            {ACTIVITY_LOG.slice(0, 3).map((item) => (
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
          <Link href="/activity-log" asChild>
            <Pressable style={styles.logButton}>
              <ThemedText style={styles.logButtonText} lightColor="#2C1C07" darkColor="#2C1C07">
                View full log
              </ThemedText>
            </Pressable>
          </Link>
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
  settingsButton: {
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
    fontFamily: 'ZalandoSansExpanded',
  },
  headerTime: {
    fontSize: 38,
    lineHeight: 42,
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
  actionCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#FFF7E1',
    borderWidth: 2,
    borderColor: '#EFCB7B',
    gap: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontFamily: 'ZalandoSansExpanded',
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  workButton: {
    backgroundColor: '#BFE9C7',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7FC08D',
  },
  workButtonText: {
    fontSize: 15,
    fontFamily: 'ZalandoSansExpanded',
  },
  earnCard: {
    padding: 20,
    borderRadius: 26,
    backgroundColor: '#DDE8FF',
    borderWidth: 2,
    borderColor: '#A8B7E8',
    gap: 14,
  },
  earnHeader: {
    gap: 6,
  },
  earnTitle: {
    fontSize: 20,
    fontFamily: 'ZalandoSansExpanded',
  },
  earnSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  earnButton: {
    backgroundColor: '#FFD36E',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8AD3F',
  },
  earnButtonText: {
    fontSize: 15,
    fontFamily: 'ZalandoSansExpanded',
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
    fontFamily: 'ZalandoSansExpanded',
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
    fontFamily: 'ZalandoSansExpanded',
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
    fontFamily: 'ZalandoSansExpanded',
  },
  logButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFD36E',
    borderWidth: 2,
    borderColor: '#E8AD3F',
  },
  logButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
