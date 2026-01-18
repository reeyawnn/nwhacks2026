import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';

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
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.mainTitle}>Settings</ThemedText>
                {settingsCategories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.settingButton}
                        onPress={() => handleSettingPress(category.id)}
                    >
                        <Ionicons name={category.icon as any} size={20} color="#007AFF" />
                        <Text style={styles.settingLabel}>{category.label}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        color: '#000',
    },
});