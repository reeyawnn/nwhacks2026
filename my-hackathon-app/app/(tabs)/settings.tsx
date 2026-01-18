import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
    const router = useRouter();

    const settingsCategories = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'units', label: 'Measurement Units', icon: 'speedometer' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'privacy', label: 'Privacy & Security', icon: 'shield' },
        { id: 'appearance', label: 'Appearance', icon: 'moon' },
        { id: 'checklist', label: 'Checklist', icon: 'checkbox' },
        { id: 'about', label: 'About', icon: 'information-circle' },
    ];

    const handleSettingPress = (id: string) => {
        if (id === 'checklist') {
            router.push('/(tabs)/checklist');
        } else {
            // Placeholder for other settings
            console.log(`${id} settings tapped`);
        }
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
                    <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(tabs)')}>
                        <Ionicons name="home" size={18} color="#6E4B1F" />
                    </TouchableOpacity>
                    <View style={styles.headerBadge}>
                        <ThemedText style={styles.headerBadgeText} lightColor="#6E4B1F" darkColor="#6E4B1F">
                            Settings
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.headerTitle} lightColor="#2C1C07" darkColor="#2C1C07">
                        Tune your focus
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle} lightColor="#6E4B1F" darkColor="#6E4B1F">
                        Adjust how your reward time and tracking behave.
                    </ThemedText>
                </View>
            }>
            <ThemedView style={styles.body} lightColor="#FFDD7A" darkColor="#FFDD7A">
                <ThemedText style={styles.mainTitle} lightColor="#2C1C07" darkColor="#2C1C07">
                    Settings
                </ThemedText>
                <View style={styles.list}>
                    {settingsCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.settingButton}
                            onPress={() => handleSettingPress(category.id)}
                        >
                            <Ionicons name={category.icon as any} size={20} color="#6E4B1F" />
                            <ThemedText style={styles.settingLabel} lightColor="#2C1C07" darkColor="#2C1C07">
                                {category.label}
                            </ThemedText>
                            <Ionicons name="chevron-forward" size={20} color="#B88A3C" />
                        </TouchableOpacity>
                    ))}
                </View>
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
        gap: 16,
        paddingBottom: 20,
    },
    mainTitle: {
        fontSize: 26,
        fontFamily: 'ZalandoSansExpanded',
        textAlign: 'center',
    },
    list: {
        backgroundColor: '#FFF7E1',
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#EFCB7B',
        paddingVertical: 6,
        paddingHorizontal: 6,
        gap: 4,
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#FFFDF4',
        borderWidth: 2,
        borderColor: '#F1D79E',
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        fontFamily: 'ZalandoSansExpanded',
    },
});
