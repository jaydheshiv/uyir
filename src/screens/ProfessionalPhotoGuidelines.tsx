import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';

const ProfessionalPhotoGuidelines: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prepare your recording environment</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'text' && styles.activeTab]}
                    onPress={() => setActiveTab('text')}
                >
                    <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>
                        Text Tips
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                    onPress={() => setActiveTab('video')}
                >
                    <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>
                        Video Tips
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'text' ? (
                    // Text Tips Content
                    <>
                        {/* Introduction */}
                        <Text style={styles.introText}>
                            This improves your avatar's representation
                        </Text>

                        {/* Good Photos Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.checkCircle}>
                                    <Ionicons name="checkmark" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>Good Photos</Text>
                            </View>

                            <Text style={styles.description}>
                                Please upload at yourself (just you), showing a different angles, expressions (smiling, neutral, serious), hairstyles (up, down) and lighting conditions. Make sure they're clear and current (representative).
                            </Text>

                            {/* Example Good Photos */}
                            <View style={styles.exampleContainer}>
                                <View style={styles.exampleBox}>
                                    <Ionicons name="person" size={40} color="#10B981" />
                                </View>
                                <View style={styles.exampleBox}>
                                    <Ionicons name="person" size={40} color="#10B981" />
                                </View>
                                <View style={styles.exampleBox}>
                                    <Ionicons name="person" size={40} color="#10B981" />
                                </View>
                                <View style={styles.exampleBox}>
                                    <Ionicons name="person" size={40} color="#10B981" />
                                </View>
                                <View style={styles.exampleBox}>
                                    <Ionicons name="person" size={40} color="#10B981" />
                                </View>
                            </View>
                        </View>

                        {/* Bad Photos Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.crossCircle}>
                                    <Ionicons name="close" size={20} color="#EF4444" />
                                </View>
                                <Text style={styles.sectionTitle}>Bad Photos</Text>
                            </View>

                            <Text style={styles.description}>
                                No posed photos, sunglasses, pets, heavy filters or low-quality, very old, or group photos. Avoid photos that do not look overly edited, or don't represent how you currently look.
                            </Text>

                            {/* Example Bad Photos */}
                            <View style={styles.exampleContainer}>
                                <View style={[styles.exampleBox, styles.badExample]}>
                                    <Ionicons name="person" size={40} color="#EF4444" />
                                </View>
                                <View style={[styles.exampleBox, styles.badExample]}>
                                    <Ionicons name="person" size={40} color="#EF4444" />
                                </View>
                                <View style={[styles.exampleBox, styles.badExample]}>
                                    <Ionicons name="person" size={40} color="#EF4444" />
                                </View>
                                <View style={[styles.exampleBox, styles.badExample]}>
                                    <Ionicons name="person" size={40} color="#EF4444" />
                                </View>
                                <View style={[styles.exampleBox, styles.badExample]}>
                                    <Ionicons name="person" size={40} color="#EF4444" />
                                </View>
                            </View>
                        </View>

                        {/* How to Record Section */}
                        <View style={styles.section}>
                            <Text style={styles.recordTitle}>How to Record?</Text>

                            {/* Step 1 */}
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>1</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Pick an image that captures your essence</Text>
                                    <Text style={styles.stepDescription}>
                                        Just Capture all angles, expression (smiling, neutral, serious), hairstyles (up, down) and lightning conditions
                                    </Text>
                                </View>
                            </View>

                            {/* Step 2 */}
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>2</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Add the sound of you to your twin</Text>
                                    <Text style={styles.stepDescription}>
                                        So the twin can flourish over 10 years, we ask for your permission to record.
                                    </Text>
                                </View>
                            </View>

                            {/* Step 3 */}
                            <View style={styles.step}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>3</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Let us set up your pro account</Text>
                                    <Text style={styles.stepDescription}>
                                        This improves your avatar's representation
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Continue Button */}
                        <View style={styles.buttonContainer}>
                            <PrimaryButton
                                title="I Understand"
                                onPress={() => navigation.goBack()}
                            />
                        </View>
                    </>
                ) : (
                    // Video Tips Content
                    <>
                        {/* Do's Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.checkCircle}>
                                    <Ionicons name="checkmark" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>Do's</Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="videocam" size={20} color="#10B981" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Set up your <Text style={styles.boldText}>HD camera</Text> or recording software
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="phone-portrait" size={20} color="#10B981" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    If using a smartphone, film in <Text style={styles.boldText}>landscape</Text>
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="person-circle" size={20} color="#10B981" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Make sure your <Text style={styles.boldText}>face & upper body</Text> are in <Text style={styles.boldText}>focus</Text>
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="sunny" size={20} color="#10B981" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Ensure the <Text style={styles.boldText}>recording space</Text> is quiet and well-lit
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="mic" size={20} color="#10B981" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Speak <Text style={styles.boldText}>naturally</Text>, we'll capture <Text style={styles.boldText}>tone & emotion</Text>
                                </Text>
                            </View>
                        </View>

                        {/* Don'ts Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.crossCircle}>
                                    <Ionicons name="close" size={20} color="#EF4444" />
                                </View>
                                <Text style={styles.sectionTitle}>Don'ts</Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="shirt" size={20} color="#EF4444" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Avoid clothes that blend into the background
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="glasses" size={20} color="#EF4444" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Avoid accessories that block your head & face like hats, earrings, or thick glasses.
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="eye-off" size={20} color="#EF4444" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Don't turn your head away from the camera
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="image" size={20} color="#EF4444" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Avoid backgrounds that are busy or moving
                                </Text>
                            </View>

                            <View style={styles.tipItem}>
                                <Ionicons name="hand-left" size={20} color="#EF4444" style={styles.tipIcon} />
                                <Text style={styles.tipText}>
                                    Don't move around too much or exaggerate movements, like waving your hands
                                </Text>
                            </View>
                        </View>

                        {/* Continue Button */}
                        <View style={styles.buttonContainer}>
                            <PrimaryButton
                                title="I Understand"
                                onPress={() => navigation.goBack()}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14.4,
        paddingVertical: 10.8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 7.2,
    },
    headerTitle: {
        fontSize: 16.2,
        fontWeight: '700',
        color: '#222',
        fontFamily: 'Outfit-Bold',
    },
    placeholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 21.6,
        paddingBottom: 36,
    },
    introText: {
        fontSize: 12.6,
        color: '#6B7280',
        marginBottom: 21.6,
        fontFamily: 'Outfit-Regular',
    },
    section: {
        marginBottom: 28.8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10.8,
    },
    checkCircle: {
        width: 28.8,
        height: 28.8,
        borderRadius: 14.4,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10.8,
    },
    crossCircle: {
        width: 28.8,
        height: 28.8,
        borderRadius: 14.4,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10.8,
    },
    sectionTitle: {
        fontSize: 16.2,
        fontWeight: '700',
        color: '#222',
        fontFamily: 'Outfit-Bold',
    },
    description: {
        fontSize: 12.6,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 14.4,
        fontFamily: 'Outfit-Regular',
    },
    exampleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10.8,
    },
    exampleBox: {
        width: 54,
        height: 54,
        borderRadius: 7.2,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    badExample: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
    },
    recordTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 18,
        fontFamily: 'Outfit-Bold',
    },
    step: {
        flexDirection: 'row',
        marginBottom: 18,
    },
    stepNumber: {
        width: 28.8,
        height: 28.8,
        borderRadius: 14.4,
        backgroundColor: '#8170FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10.8,
    },
    stepNumberText: {
        fontSize: 14.4,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Outfit-Bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14.4,
        fontWeight: '600',
        color: '#222',
        marginBottom: 3.6,
        fontFamily: 'Outfit-SemiBold',
    },
    stepDescription: {
        fontSize: 12.6,
        color: '#6B7280',
        lineHeight: 18,
        fontFamily: 'Outfit-Regular',
    },
    buttonContainer: {
        marginTop: 21.6,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 21.6,
        marginTop: 14.4,
        marginBottom: 7.2,
        borderRadius: 10.8,
        padding: 3.6,
    },
    tab: {
        flex: 1,
        paddingVertical: 10.8,
        borderRadius: 7.2,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.9 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 12.6,
        fontWeight: '500',
        color: '#6B7280',
        fontFamily: 'Outfit-Medium',
    },
    activeTabText: {
        color: '#222',
        fontWeight: '600',
        fontFamily: 'Outfit-SemiBold',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14.4,
    },
    tipIcon: {
        marginRight: 10.8,
        marginTop: 1.8,
    },
    tipText: {
        flex: 1,
        fontSize: 12.6,
        color: '#374151',
        lineHeight: 18,
        fontFamily: 'Outfit-Regular',
    },
    boldText: {
        fontWeight: '700',
        color: '#222',
        fontFamily: 'Outfit-Bold',
    },
});

export default ProfessionalPhotoGuidelines;
