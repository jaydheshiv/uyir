import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, NativeModules, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SoundPlayer from 'react-native-sound-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import { buildKnowledgeUrl } from '../config/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useProfessional } from '../store/useAppStore';

type BlobUtilModule = typeof import('react-native-blob-util')['default'];

const PROFESSIONAL_PROFILE_URL = 'http://dev.api.uyir.ai:8081/professional/';

const extractProfessionalIdFromPayload = (payload: any): string | null => {
    if (!payload) {
        return null;
    }

    if (typeof payload === 'string' || typeof payload === 'number') {
        return String(payload);
    }

    if (Array.isArray(payload)) {
        for (const item of payload) {
            const derived = extractProfessionalIdFromPayload(item);
            if (derived) {
                return derived;
            }
        }
        return null;
    }

    const candidates = [
        payload.professional_id,
        payload.PROFESSIONAL_ID,
        payload.professionalId,
        payload.id,
        payload?.professional?.professional_id,
        payload?.profile?.professional_id,
    ];

    const match = candidates.find((value) => typeof value === 'string' || typeof value === 'number');
    return match ? String(match) : null;
};

let cachedBlobUtil: BlobUtilModule | null = null;
const getBlobUtil = async (): Promise<BlobUtilModule> => {
    if (!cachedBlobUtil) {
        const module = await import('react-native-blob-util');
        if (!module?.default) {
            throw new Error('react-native-blob-util native module is unavailable');
        }
        cachedBlobUtil = module.default as BlobUtilModule;
    }
    return cachedBlobUtil;
};

const Upload: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { token } = useAuth();
    const { professionalData } = useProfessional();
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const [audioFileName, setAudioFileName] = useState('');
    const [audioFilePath, setAudioFilePath] = useState<string | null>(null);
    const [audioFileType, setAudioFileType] = useState<string>('audio/mpeg');
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [playablePath, setPlayablePath] = useState<string | null>(null);
    const [professionalId, setProfessionalId] = useState<string | null>(professionalData?.professional_id ?? null);

    useEffect(() => {
        if (professionalData?.professional_id) {
            setProfessionalId(professionalData.professional_id);
        }
    }, [professionalData?.professional_id]);

    const ensureProfessionalProfile = async () => {
        if (professionalId) {
            return { status: 'ok' as const, id: professionalId };
        }

        if (professionalData?.professional_id) {
            setProfessionalId(professionalData.professional_id);
            return { status: 'ok' as const, id: professionalData.professional_id };
        }

        if (!token) {
            return {
                status: 'error' as const,
                id: null,
                message: 'Not authenticated. Please login again.',
            };
        }

        try {
            console.log('🔍 Validating professional profile before voice upload...');
            const response = await fetch(PROFESSIONAL_PROFILE_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 404) {
                console.error('❌ Professional profile not found for voice upload');
                return { status: 'not_found' as const, id: null };
            }

            const payload = await response
                .json()
                .catch(() => {
                    console.warn('⚠️ Professional profile voice response was not JSON');
                    return null;
                });

            if (!response.ok) {
                const detail = payload?.detail || 'Could not verify your professional profile. Please try again.';
                console.error('❌ Professional profile validation failed:', detail);
                return {
                    status: 'error' as const,
                    id: null,
                    message: detail,
                };
            }

            const derivedId = extractProfessionalIdFromPayload(payload);
            if (derivedId) {
                console.log('✅ Professional profile confirmed for voice upload. ID:', derivedId);
                setProfessionalId(derivedId);
                return { status: 'ok' as const, id: derivedId };
            }

            console.warn('⚠️ Professional ID missing in voice profile response');
            return {
                status: 'error' as const,
                id: null,
                message: 'Professional ID is missing from the profile response.',
            };
        } catch (error) {
            console.error('❌ Failed to validate professional profile:', error);
            return {
                status: 'error' as const,
                id: null,
                message: 'Could not verify your professional profile. Please try again.',
            };
        }
    };

    const inferAudioMimeType = (fileName: string) => {
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.wav')) {
            return 'audio/wav';
        }
        if (lower.endsWith('.m4a')) {
            return 'audio/m4a';
        }
        if (lower.endsWith('.aac')) {
            return 'audio/aac';
        }
        return 'audio/mpeg';
    };

    useEffect(() => {
        const subscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
            setIsPlaying(false);
        });

        return () => {
            subscription?.remove?.();
            SoundPlayer.stop();
        };
    }, []);

    const ensurePlayablePath = async (uri: string): Promise<string> => {
        if (uri.startsWith('content://')) {
            try {
                const RNFetchBlob = await getBlobUtil();
                const cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/voice-preview-${Date.now()}.mp3`;
                const base64Data = await RNFetchBlob.fs.readFile(uri, 'base64');
                await RNFetchBlob.fs.writeFile(cachePath, base64Data, 'base64');
                return `file://${cachePath}`;
            } catch (error) {
                console.error('Failed to cache audio content URI:', error);
                throw error;
            }
        }

        if (uri.startsWith('/')) {
            return `file://${uri}`;
        }

        return uri;
    };

    const pickAudioWithDocumentPicker = async () => {
        let module: typeof import('react-native-document-picker') | undefined;
        try {
            module = (await import('react-native-document-picker')) as typeof import('react-native-document-picker');
            const { default: DocumentPicker, types } = module;

            const result = await DocumentPicker.pickSingle({
                type: [types.audio],
                presentationStyle: 'formSheet',
                copyTo: 'cachesDirectory',
            });

            const fileUri = result.fileCopyUri || result.uri;
            if (!fileUri) {
                Alert.alert('Error', 'Unable to access selected file. Please try again.');
                return;
            }

            const fileName = result.name || fileUri.split('/').pop() || 'audio.mp3';
            const lowerCaseName = fileName.toLowerCase();
            const isSupported = lowerCaseName.endsWith('.mp3') ||
                lowerCaseName.endsWith('.wav') ||
                lowerCaseName.endsWith('.m4a') ||
                lowerCaseName.endsWith('.aac') ||
                (result.type && result.type.startsWith('audio'));

            if (!isSupported) {
                Alert.alert(
                    'Invalid Format',
                    'Please choose a valid audio file (MP3, WAV, M4A, AAC).',
                    [{ text: 'OK' }]
                );
                return;
            }

            console.log('Selected audio file via DocumentPicker:', {
                name: fileName,
                uri: fileUri,
                size: result.size,
                type: result.type,
            });

            setAudioFileType(result.type || inferAudioMimeType(fileName));
            setAudioFileName(fileName);
            setAudioFilePath(fileUri);
            setPlayablePath(null);
            setHasAudio(true);
        } catch (error: any) {
            const isCancel = module?.isCancel;
            if (isCancel?.(error)) {
                console.log('User cancelled audio picker');
                return;
            }

            console.error('Error picking audio via DocumentPicker:', error);
            Alert.alert('Error', 'Failed to select audio file. Please try again.');
        }
    };

    const handleUploadAudio = async () => {
        try {
            if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    const permission = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
                    );
                    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permission Required', 'Audio access permission denied.');
                        return;
                    }
                }

                const { AudioFilePicker } = NativeModules as any;
                if (AudioFilePicker?.pickAudioFile) {
                    const picked = await AudioFilePicker.pickAudioFile();

                    if (!picked) {
                        Alert.alert('Cancelled', 'No file selected.');
                        return;
                    }

                    const fileName = (picked.fileName || '').toLowerCase();
                    const isSupported = fileName.endsWith('.mp3') ||
                        fileName.endsWith('.wav') ||
                        fileName.endsWith('.m4a') ||
                        fileName.endsWith('.aac') ||
                        (picked.type && picked.type.startsWith('audio'));

                    if (!isSupported) {
                        Alert.alert(
                            'Invalid Format',
                            'Please choose a valid audio file (MP3, WAV, M4A, AAC).',
                            [{ text: 'OK' }]
                        );
                        return;
                    }

                    const resolvedName = picked.fileName || 'audio.mp3';
                    setAudioFileType(picked.type || inferAudioMimeType(resolvedName));
                    setAudioFileName(resolvedName);
                    setAudioFilePath(picked.uri);
                    setPlayablePath(null);
                    setHasAudio(true);
                    console.log('Selected audio file via AudioFilePicker:', picked);
                    return;
                }

                console.warn('AudioFilePicker native module not found; using DocumentPicker fallback.');
            }

            await pickAudioWithDocumentPicker();
        } catch (error) {
            console.error('Error picking audio:', error);
            Alert.alert('Error', 'Failed to pick audio file. Please try again.');
        }
    };

    const handlePlayPause = async () => {
        if (!audioFilePath) {
            Alert.alert('No Audio', 'Please upload an MP3 file first.');
            return;
        }

        try {
            if (isPlaying) {
                SoundPlayer.stop();
                setIsPlaying(false);
                return;
            }

            let path = playablePath;
            if (!path) {
                path = await ensurePlayablePath(audioFilePath);
                setPlayablePath(path);
            }

            SoundPlayer.stop();
            SoundPlayer.playUrl(path);
            setIsPlaying(true);
        } catch (error) {
            console.error('Audio playback error:', error);
            Alert.alert('Playback Error', 'Could not play the selected audio file.');
            setIsPlaying(false);
        }
    };

    const handleAccept = async () => {
        // Upload the audio to backend
        await uploadVoiceToBackend();
    };

    const handleReject = async () => {
        // Reject/delete the recording
        setHasAudio(false);
        setAudioFileName('');
        setAudioFilePath(null);
        setIsPlaying(false);
        setPlayablePath(null);
        setAudioFileType('audio/mpeg');
    };

    const handleDeleteFile = async () => {
        // Delete the uploaded file
        setHasAudio(false);
        setAudioFileName('');
        setAudioFilePath(null);
        setIsPlaying(false);
        setPlayablePath(null);
        setAudioFileType('audio/mpeg');
    };

    const uploadVoiceToBackend = async () => {
        if (!audioFilePath || !token) {
            Alert.alert('Error', 'No audio file selected or not authenticated.');
            return;
        }

        setIsUploadingVoice(true);
        try {
            const profileResult = await ensureProfessionalProfile();

            if (profileResult.status === 'not_found') {
                Alert.alert(
                    'Profile Not Found',
                    'Please complete your professional profile first before uploading audio.',
                    [
                        {
                            text: 'Go Back',
                            onPress: () => navigation.goBack(),
                        },
                    ],
                );
                setIsUploadingVoice(false);
                return;
            }

            if (profileResult.status === 'error') {
                Alert.alert('Error', profileResult.message || 'Could not verify your professional profile. Please try again.');
                setIsUploadingVoice(false);
                return;
            }

            const professionalIdentifier = profileResult.id!;
            const formData = new FormData();
            const fileName = audioFileName || 'voice_sample.mp3';
            const sampleText = 'sample_text';

            formData.append('audio_file', {
                uri: audioFilePath,
                type: audioFileType || inferAudioMimeType(fileName),
                name: fileName,
            } as any);

            formData.append('sample_text', sampleText);

            const uploadUrl = buildKnowledgeUrl(`/professional/${encodeURIComponent(professionalIdentifier)}/persona_voice/voice_samples`);

            console.log('=== UPLOADING VOICE FILE TO PROFESSIONAL VOICE API ===');
            console.log('URL:', uploadUrl);
            console.log('Professional ID:', professionalIdentifier);
            console.log('Sample Text:', sampleText);
            console.log('File:', fileName);
            console.log('Type:', audioFileType || inferAudioMimeType(fileName));

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            console.log('Voice upload response:', data);

            if (response.ok) {
                console.log('✅ Voice sample uploaded successfully');
                Alert.alert('Success', 'Voice sample uploaded successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('UploadContent'),
                    }
                ]);
            } else {
                console.error('Voice upload failed:', data);
                Alert.alert('Upload Failed', data.detail || 'Failed to upload voice sample. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading voice:', error);
            Alert.alert('Network Error', 'Could not connect to server. Please try again.');
        } finally {
            setIsUploadingVoice(false);
        }
    };

    const handlePlayPause_OLD = () => {
        setIsPlaying(!isPlaying);
    };

    const handleAccept_OLD = () => {
        // Accept the recording
        console.log('Recording accepted');
    };

    const handleReject_OLD = () => {
        // Reject/delete the recording
        setHasAudio(false);
    };

    const handleDeleteFile_OLD = () => {
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

                {!hasAudio && (
                    <View style={styles.uploadPromptContainer}>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleUploadAudio}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="cloud-upload-outline" size={48} color="#8170FF" />
                            <Text style={styles.uploadButtonText}>Tap to Upload Audio File</Text>
                            <Text style={styles.uploadHintText}>Audio files only (MP3, WAV, M4A, AAC)</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {hasAudio && (
                    <>
                        {/* File Info */}
                        <View style={styles.fileInfoContainer}>
                            <Text style={styles.fileName}>{audioFileName}</Text>
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
                            <Text style={styles.instructionText}>Tap the button to Preview your Audio</Text>
                        </View>

                        {/* Upload Voice Button */}
                        <TouchableOpacity
                            onPress={handleAccept}
                            style={styles.uploadVoiceButton}
                            disabled={isUploadingVoice}
                        >
                            {isUploadingVoice ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.uploadVoiceButtonText}>Upload to Persona API</Text>
                            )}
                        </TouchableOpacity>
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
                    onPress={() => navigation.navigate('UploadContent')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 18,
        paddingTop: -10,
    },
    backButton: {
        marginBottom: 12.6,
        marginTop: 31.5,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        paddingTop: 10.8,
    },
    headerContainer: {
        marginBottom: 28.8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 5.4,
        fontFamily: 'Outfit'
    },
    subtitle: {
        fontSize: 12.6,
        color: '#000',
        fontFamily: 'Outfit'
    },
    fileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28.8,
        paddingVertical: 9,
    },
    fileName: {
        fontSize: 12.6,
        color: '#000',
        fontWeight: '500',
    },
    deleteButton: {
        padding: 5.4,
    },
    waveformContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        justifyContent: 'center',
        gap: 5.4,
    },
    waveBar: {
        width: 9,
        borderRadius: 4.5,
        marginHorizontal: 1.8,
    },
    waveBarActive: {
        height: 45,
        backgroundColor: '#8170FF',
    },
    waveBarInactive: {
        height: 16.2,
        backgroundColor: '#E0E0E0',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25.2,
        gap: 28.8,
    },
    controlButton: {
        width: 46.8,
        height: 46.8,
        borderRadius: 23.4,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 61.2,
        height: 61.2,
        borderRadius: 30.6,
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
        paddingVertical: 10.8,
        paddingHorizontal: 18,
        borderRadius: 10.8,
        marginBottom: 25.2,
    },
    instructionText: {
        fontSize: 12.6,
        color: '#666',
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 12.6,
        color: '#999',
        textAlign: 'center',
    },
    bottomContainer: {
        paddingBottom: 25.2,
        paddingTop: 14.4,
    },
    uploadPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 25.2,
    },
    uploadButton: {
        backgroundColor: 'le#F5F5F5',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#8170FF',
        borderRadius: 18,
        padding: 28.8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    uploadButtonText: {
        fontSize: 14.4,
        fontWeight: '600',
        color: '#000',
        marginTop: 10.8,
        textAlign: 'center',
    },
    uploadHintText: {
        fontSize: 11.7,
        color: '#666',
        marginTop: 5.4,
        textAlign: 'center',
    },
    uploadVoiceButton: {
        backgroundColor: '#5642f0ff',
        paddingVertical: 10.8,
        paddingHorizontal: 25.2,
        borderRadius: 10.8,
        marginTop: 9,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 39.6,
    },
    uploadVoiceButtonText: {
        color: '#fff',
        fontSize: 12.6,
        fontWeight: '600',
    },
});

export default Upload;

