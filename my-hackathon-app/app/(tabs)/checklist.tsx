import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
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

    const toggleApp = (appId: string) => {
        setSelectedApps((prev) =>
            prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
        );
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#B8E6FF', dark: '#B8E6FF' }}
            headerImage={
                <View style={styles.header}>
                    <View style={styles.cloudOne} />
                    <View style={styles.cloudTwo} />
                    <View style={styles.headerBadge}>
                        <ThemedText style={styles.headerBadgeText} lightColor="#1F2A44" darkColor="#1F2A44">
                            Screen Time Blocker
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.headerTitle} lightColor="#0D1B2A" darkColor="#0D1B2A">
                        Which apps drain your time?
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle} lightColor="#4B5A82" darkColor="#4B5A82">
                        Select the apps you want to track and limit
                    </ThemedText>
                </View>
            }>
            <ThemedView style={styles.body}>
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
                                    lightColor={selectedApps.includes(item.id) ? '#1C3A2A' : '#1F2A44'}
                                    darkColor={selectedApps.includes(item.id) ? '#1C3A2A' : '#1F2A44'}>
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

                <Pressable style={styles.continueButton}>
                    <ThemedText style={styles.continueButtonText} lightColor="#FFFDF4" darkColor="#FFFDF4">
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
        backgroundColor: '#E8F8FF',
        opacity: 0.85,
    },
    cloudTwo: {
        position: 'absolute',
        top: 22,
        right: 30,
        width: 90,
        height: 38,
        borderRadius: 40,
        backgroundColor: '#D4F1FF',
        opacity: 0.9,
    },
    headerBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#C8E6FF',
        borderWidth: 2,
        borderColor: '#7DB8D4',
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
        gap: 20,
        paddingBottom: 20,
    },
    appGrid: {
        padding: 20,
        borderRadius: 26,
        backgroundColor: '#E8F5FF',
        borderWidth: 2,
        borderColor: '#9ECDE8',
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
        backgroundColor: '#F5FBFF',
        borderWidth: 2,
        borderColor: '#B8D9EE',
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
        fontFamily: 'Georgia',
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
        backgroundColor: '#4A90E2',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2E5AA8',
    },
    continueButtonText: {
        fontSize: 16,
        fontFamily: 'Georgia',
        fontWeight: '600',
    },
});