import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// filepath: /Users/jackyzhong/Documents/Git/nwhacks2026/my-hackathon-app/app/(tabs)/checklist.tsx


const SAMPLE_APPS = [
    { id: '1', name: 'Instagram', icon: '📷' },
    { id: '2', name: 'TikTok', icon: '🎵' },
    { id: '3', name: 'YouTube', icon: '▶️' },
    { id: '4', name: 'Twitter', icon: '𝕏' },
    { id: '5', name: 'Discord', icon: '💬' },
    { id: '6', name: 'Snapchat', icon: '👻' },
    { id: '7', name: 'Reddit', icon: '🔴' },
    { id: '8', name: 'Gaming App', icon: '🎮' },
];

export default function ChecklistScreen() {
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const router = useRouter();

    const toggleApp = (appId: string) => {
        setSelectedApps((prev) =>
            prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
        );
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#FFDD7A', dark: '#FFDD7A' }}
            backgroundColor="#FFDD7A"
            headerImage={
                <View style={styles.header}>
                    <View style={styles.cloudOne} />
                    <View style={styles.cloudTwo} />
                    <View style={styles.sunBubble} />
                    <View style={styles.headerBadge}>
                        <ThemedText style={styles.headerBadgeText} lightColor="#6E4B1F" darkColor="#6E4B1F">
                            Screen Time Blocker
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.headerTitle} lightColor="#2C1C07" darkColor="#2C1C07">
                        Which apps drain your time?
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
                        Select the apps you want to track and limit
                    </ThemedText>
                </View>
            }>
            <ThemedView style={styles.body} lightColor="#FFDD7A" darkColor="#FFDD7A">
                <ThemedView style={styles.appGrid}>
                    <FlatList
                        data={SAMPLE_APPS}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.gridRow}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[
                                    styles.appCard,
                                    selectedApps.includes(item.id) && styles.appCardSelected,
                                ]}
                                onPress={() => toggleApp(item.id)}>
                                <ThemedText style={styles.appIcon}>{item.icon}</ThemedText>
                                <ThemedText
                                    style={styles.appName}
                                    lightColor={selectedApps.includes(item.id) ? '#1C3A2A' : '#2C1C07'}
                                    darkColor={selectedApps.includes(item.id) ? '#1C3A2A' : '#2C1C07'}>
                                    {item.name}
                                </ThemedText>
                                {selectedApps.includes(item.id) && (
                                    <View style={styles.checkmark}>
                                        <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                                    </View>
                                )}
                            </Pressable>
                        )}
                    />
                </ThemedView>

                <Pressable style={styles.continueButton} onPress={() => router.push('/(tabs)')}>
                    <ThemedText style={styles.continueButtonText} lightColor="#2C1C07" darkColor="#2C1C07">
                        Continue with {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''}
                    </ThemedText>
                </Pressable>
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
    headerTitle: {
        fontSize: 32,
        lineHeight: 36,
        fontFamily: 'ZalandoSansExpanded',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        lineHeight: 21,
        maxWidth: 280,
    },
    body: {
        gap: 20,
        paddingBottom: 20,
    },
    appGrid: {
        padding: 20,
        borderRadius: 26,
        backgroundColor: '#FFF7E1',
        borderWidth: 2,
        borderColor: '#EFCB7B',
    },
    gridRow: {
        gap: 12,
        marginBottom: 12,
    },
    appCard: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFDF4',
        borderWidth: 2,
        borderColor: '#F1D79E',
        alignItems: 'center',
        gap: 8,
    },
    appCardSelected: {
        backgroundColor: '#BFE9C7',
        borderColor: '#7FC08D',
    },
    appIcon: {
        fontSize: 32,
    },
    appName: {
        fontSize: 13,
        fontFamily: 'ZalandoSansExpanded',
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#1C3A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        fontSize: 14,
        color: '#FFFDF4',
    },
    continueButton: {
        marginHorizontal: 20,
        backgroundColor: '#FFD36E',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E8AD3F',
    },
    continueButtonText: {
        fontSize: 16,
        fontFamily: 'ZalandoSansExpanded',
        fontWeight: '600',
    },
});
