import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface VideoRecordingGuideProps {
    visible: boolean;
    onClose: () => void;
    onGetStarted: () => void;
}

const VideoRecordingGuide: React.FC<VideoRecordingGuideProps> = ({ visible, onClose, onGetStarted }) => {
    const [activeTab, setActiveTab] = useState<'text' | 'video'>('video');

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Prepare your recording environment</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#222" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'text' && styles.activeTab]}
                        onPress={() => setActiveTab('text')}
                    >
                        <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>Text Tips</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                        onPress={() => setActiveTab('video')}
                    >
                        <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>Video Tips</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'video' ? (
                        <>
                            {/* Do's Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.doIcon}>
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.sectionTitle}>Do's</Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="videocam" size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Set up your <Text style={styles.bold}>HD camera</Text> or recording software
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="phone-portrait" size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        If using a smartphone, film in <Text style={styles.bold}>landscape</Text>
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="person" size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Make sure your <Text style={styles.bold}>face & upper body</Text> are in <Text style={styles.bold}>focus</Text>
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="sunny" size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Ensure the <Text style={styles.bold}>recording space</Text> is quiet and well-lit
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="volume-high" size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Speak <Text style={styles.bold}>naturally</Text>, we'll capture <Text style={styles.bold}>tone & emotion</Text>
                                    </Text>
                                </View>
                            </View>

                            {/* Don'ts Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.dontIcon}>
                                        <Ionicons name="close" size={20} color="#fff" />
                                    </View>
                                    <Text style={styles.sectionTitle}>Dont's</Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="shirt" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Avoid clothes that blend into the background
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="glasses" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Avoid accessories that block your head & face like hats, earrings, or thick glasses.
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="headset" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Don't turn your head away from the camera
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="happy" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Avoid backgrounds that are busy or moving
                                    </Text>
                                </View>

                                <View style={styles.tipRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="hand-left" size={24} color="#FF6B6B" />
                                    </View>
                                    <Text style={styles.tipText}>
                                        Don't move around too much or exaggerate movements, like waving your hands
                                    </Text>
                                </View>
                            </View>

                            {/* Best Practices Link */}
                            <View style={styles.linkContainer}>
                                <Text style={styles.linkText}>
                                    Here you can find more detailed{' '}
                                    <Text style={styles.link}>Best Practices ↗</Text>
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Text Tips Content */}
                            <View style={styles.section}>
                                <Text style={styles.tipText}>
                                    • Keep your script natural and conversational{'\n\n'}
                                    • Speak clearly and at a moderate pace{'\n\n'}
                                    • Include pauses and natural breathing{'\n\n'}
                                    • Show different emotions and expressions{'\n\n'}
                                    • Practice your script before recording
                                </Text>
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.understandButton} onPress={onGetStarted}>
                        <Text style={styles.understandButtonText}>I Understand</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#8170FF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    doIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dontIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
    },
    bold: {
        fontWeight: '700',
        color: '#222',
    },
    linkContainer: {
        marginTop: 16,
        marginBottom: 24,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    link: {
        color: '#8170FF',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    bottomContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    understandButton: {
        backgroundColor: '#FF5B8D',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    understandButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default VideoRecordingGuide;
