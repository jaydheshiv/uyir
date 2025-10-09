import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';

const Upload: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasAudio, setHasAudio] = useState(true); // Assume audio is already uploaded

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleAccept = () => {
        // Accept the recording
        console.log('Recording accepted');
    };

    const handleReject = () => {
        // Reject/delete the recording
        setHasAudio(false);
    };

    const handleDeleteFile = () => {
        // Delete the uploaded file
        setHasAudio(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Arrow */}
            <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Upload Recording</Text>
                    <Text style={styles.subtitle}>One upload. Infinite memories</Text>
                </View>

                {hasAudio && (
                    <>
                        {/* File Info */}
                        <View style={styles.fileInfoContainer}>
                            <Text style={styles.fileName}>My_Voice.mp3</Text>
                            <TouchableOpacity onPress={handleDeleteFile} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {/* Audio Waveform */}
                        <View style={styles.waveformContainer}>
                            <View style={styles.waveform}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.waveBar,
                                            i < 6 ? styles.waveBarActive : styles.waveBarInactive
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Audio Controls */}
                        <View style={styles.controlsContainer}>
                            <TouchableOpacity onPress={handleAccept} style={styles.controlButton}>
                                <Ionicons name="checkmark" size={24} color="#000" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={32}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleReject} style={styles.controlButton}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        {/* Preview Instruction */}
                        <View style={styles.instructionContainer}>
                            <Text style={styles.instructionText}>Tab the button to Preview your Audio</Text>
                        </View>
                    </>
                )}

                {!hasAudio && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No audio file uploaded</Text>
                    </View>
                )}
            </View>

            {/* Bottom Button */}
            <View style={styles.bottomContainer}>
                <PrimaryButton
                    title="Next"
                    onPress={() => navigation.navigate('LetUsKnowYou')}
                    disabled={!hasAudio}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: -10,
    },
    backButton: {
        marginBottom: 20,
        marginTop: 25,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    headerContainer: {
        marginBottom: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        fontFamily: 'Outfit'
    },
    subtitle: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'Outfit'
    },
    fileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 60,
        paddingVertical: 12,
    },
    fileName: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
    },
    waveformContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
        justifyContent: 'center',
        gap: 8,
    },
    waveBar: {
        width: 12,
        borderRadius: 6,
        marginHorizontal: 2,
    },
    waveBarActive: {
        height: 60,
        backgroundColor: '#8170FF',
    },
    waveBarInactive: {
        height: 20,
        backgroundColor: '#E0E0E0',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 40,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8170FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    instructionContainer: {
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 40,
    },
    instructionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    bottomContainer: {
        paddingBottom: 34,
        paddingTop: 20,
    },
});

export default Upload;
