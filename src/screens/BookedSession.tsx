import {
    AndroidAudioTypePresets,
    AudioSession,
    LiveKitRoom,
    VideoTrack,
    useParticipants,
    useTracks
} from '@livekit/react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LocalTrackPublication, RoomEvent, Track } from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, NativeModules, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { LIVEKIT_CONFIG } from '../config/livekit.config';
import type { RootStackParamList } from '../navigation/AppNavigator';

// LiveKit globals are now registered in index.js

type BookedSessionRouteProp = RouteProp<RootStackParamList, 'BookedSession'>;

// Inner component that uses LiveKit hooks (must be inside LiveKitRoom)
type ChatMessage = {
    id: string;
    text: string;
    from: string;
    isLocal: boolean;
    ts: number;
};

const VideoCallInterface: React.FC<{ onEndCall: () => void }> = ({ onEndCall }) => {
    const participants = useParticipants();
    const videoTracks = useTracks([Track.Source.Camera]);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [sessionTime, setSessionTime] = useState('00:00');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const chatScrollRef = useRef<ScrollView>(null);

    // Get local and remote participants
    const localParticipant = participants.find(p => p.isLocal);
    const remoteParticipant = participants.find(p => !p.isLocal);

    // Get video tracks
    const localVideoTrack = videoTracks.find(t => t.participant.isLocal);
    const remoteVideoTrack = videoTracks.find(t => !t.participant.isLocal);

    // Session timer
    useEffect(() => {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            setSessionTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Show suggestions after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSuggestions(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleCloseSuggestions = () => {
        setShowSuggestions(false);
    };

    const handleSuggestionPress = (suggestion: string) => {
        console.log('Suggestion selected:', suggestion);
        setShowSuggestions(false);
    };

    const toggleMute = async () => {
        if (localParticipant) {
            const audioPublication = localParticipant.getTrackPublication(Track.Source.Microphone) as LocalTrackPublication | undefined;
            if (audioPublication && audioPublication.audioTrack) {
                if (isMuted) {
                    await audioPublication.audioTrack.unmute();
                } else {
                    await audioPublication.audioTrack.mute();
                }
                setIsMuted(!isMuted);
                console.log('🎤 Mute toggled:', !isMuted);
            }
        }
    };

    const toggleVideo = async () => {
        if (localParticipant) {
            const videoPublication = localParticipant.getTrackPublication(Track.Source.Camera) as LocalTrackPublication | undefined;
            if (videoPublication && videoPublication.videoTrack) {
                if (isVideoOn) {
                    await videoPublication.videoTrack.mute();
                } else {
                    await videoPublication.videoTrack.unmute();
                }
                setIsVideoOn(!isVideoOn);
                console.log('📹 Video toggled:', !isVideoOn);
            }
        }
    };

    const handleRefresh = () => {
        console.log('Refreshing connection...');
    };

    const handleChat = () => {
        setChatVisible(true);
    };

    // Helper: decode Uint8Array payload safely on RN
    const decodePayload = (payload: Uint8Array | string): string => {
        if (typeof payload === 'string') return payload;
        try {
            // @ts-ignore - TextDecoder may exist in some engines
            if (typeof TextDecoder !== 'undefined') {
                // @ts-ignore
                return new TextDecoder('utf-8').decode(payload);
            }
        } catch {}
        // Fallback UTF-8 decode
        let str = '';
        for (let i = 0; i < payload.length; i++) str += String.fromCharCode(payload[i]);
        try { return decodeURIComponent(escape(str)); } catch { return str; }
    };

    // Subscribe to LiveKit data messages (chat)
    useEffect(() => {
        const room: any = (localParticipant as any)?.room;
        if (!room) return;

        const onData = (payload: any, participant?: any, kindOrTopic?: any, maybeTopic?: any) => {
            // Support both signatures: (payload, participant, topic) and (payload, participant, kind, topic)
            const topic = typeof kindOrTopic === 'string' ? kindOrTopic : maybeTopic;
            if (topic && topic !== 'chat') return;
            const text = decodePayload(payload);
            const from = participant?.identity || 'Participant';
            const isLocal = !!participant?.isLocal;
            setMessages(prev => [...prev, {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                text,
                from,
                isLocal,
                ts: Date.now(),
            }]);
            requestAnimationFrame(() => chatScrollRef.current?.scrollToEnd({ animated: true }));
        };

        room.on?.(RoomEvent.DataReceived, onData);
        return () => { try { room.off?.(RoomEvent.DataReceived, onData); } catch {} };
    }, [localParticipant]);

    const sendChat = async () => {
        const text = chatInput.trim();
        if (!text) return;
        const lp: any = localParticipant as any;
        if (!lp) return;
        try {
            if (typeof lp.publishData === 'function') {
                try {
                    await lp.publishData(text, { reliable: true, topic: 'chat' });
                } catch {
                    // Fallback older signature
                    await lp.publishData(text, /* kind */ 0 as any, undefined, { topic: 'chat' });
                }
            }
            setMessages(prev => [...prev, {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                text,
                from: 'You',
                isLocal: true,
                ts: Date.now(),
            }]);
            setChatInput('');
            requestAnimationFrame(() => chatScrollRef.current?.scrollToEnd({ animated: true }));
        } catch (e) {
            console.error('❌ Failed to send chat message:', e);
            Alert.alert('Chat Error', 'Could not send message.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>You are now connected</Text>
            </View>

            {/* Video Call Interface */}
            <View style={styles.videoContainer}>
                {/* Remote user video (large) */}
                <View style={styles.mainVideoContainer}>
                    {remoteVideoTrack && remoteVideoTrack.publication && !remoteVideoTrack.publication.isMuted ? (
                        <VideoTrack
                            trackRef={remoteVideoTrack}
                            style={styles.mainVideo}
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="person" size={80} color="#ccc" />
                            <Text style={styles.placeholderText}>Waiting for other participant...</Text>
                        </View>
                    )}
                </View>

                {/* Local video (small, top right) */}
                <View style={styles.avatarVideoContainer}>
                    {localVideoTrack && localVideoTrack.publication && !localVideoTrack.publication.isMuted ? (
                        <VideoTrack
                            trackRef={localVideoTrack}
                            style={styles.avatarVideo}
                            mirror={true}
                        />
                    ) : (
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="videocam-off" size={40} color="#ccc" />
                        </View>
                    )}
                </View>

                {/* Video controls overlay */}
                <View style={styles.videoControlsOverlay}>
                    <TouchableOpacity style={styles.videoControlButton} onPress={toggleVideo}>
                        <Ionicons
                            name={isVideoOn ? "videocam" : "videocam-off"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.videoControlButton} onPress={toggleMute}>
                        <Ionicons
                            name={isMuted ? "mic-off" : "mic"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                {/* End Call Button */}
                <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
                    <Ionicons name="call" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Session Timer and Controls Row */}
                <View style={styles.controlsRow}>
                    <View style={styles.timerContainer}>
                        <View style={styles.timerDot} />
                        <Text style={styles.timerText}>{sessionTime}</Text>
                    </View>

                    <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                        <Ionicons name="refresh" size={22} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
                        <Ionicons name="chatbubble-outline" size={22} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavContainer}>
                <CustomBottomNav />
            </View>

            {/* Suggestions Popup */}
            <Modal
                visible={showSuggestions}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseSuggestions}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.suggestionsContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleCloseSuggestions}
                        >
                            <Ionicons name="chevron-down" size={24} color="#666" />
                        </TouchableOpacity>

                        <Text style={styles.suggestionsTitle}>
                            Here are some suggestions that you can give
                        </Text>

                        <View style={styles.suggestionsListContainer}>
                            <TouchableOpacity
                                style={styles.suggestionBubble}
                                onPress={() => handleSuggestionPress("Have you considered doing meditation?")}
                            >
                                <Text style={styles.suggestionText}>
                                    Have you considered doing meditation?
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.suggestionBubble}
                                onPress={() => handleSuggestionPress("What is your past coping mechanisms?")}
                            >
                                <Text style={styles.suggestionText}>
                                    What is your past coping mechanisms?
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.suggestionBubble}
                                onPress={() => handleSuggestionPress("Do you journal what you feel?")}
                            >
                                <Text style={styles.suggestionText}>
                                    Do you journal what you feel?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Chat Modal */}
            <Modal
                visible={chatVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setChatVisible(false)}
            >
                <View style={styles.chatOverlay}>
                    <View style={styles.chatContainer}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatTitle}>Chat</Text>
                            <TouchableOpacity onPress={() => setChatVisible(false)}>
                                <Ionicons name="close" size={22} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            ref={chatScrollRef}
                            contentContainerStyle={styles.chatMessages}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map(m => (
                                <View key={m.id} style={[styles.chatBubble, m.isLocal ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                                    <Text style={styles.chatSender}>{m.isLocal ? 'You' : m.from}</Text>
                                    <Text style={styles.chatText}>{m.text}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.chatInputRow}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Type a message"
                                placeholderTextColor="#999"
                                value={chatInput}
                                onChangeText={setChatInput}
                                onSubmitEditing={sendChat}
                                returnKeyType="send"
                            />
                            <TouchableOpacity style={styles.chatSendButton} onPress={sendChat}>
                                <Ionicons name="send" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const BookedSession: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<BookedSessionRouteProp>();
    const { livekitUrl, accessToken, roomName, participantIdentity } = route.params;

    useEffect(() => {
        console.log('🔗 Connecting to LiveKit room:', roomName);
        console.log('🔗 LiveKit URL:', livekitUrl);
        console.log('🔗 Expected URL:', LIVEKIT_CONFIG.LIVEKIT_URL);
        console.log('🔗 Participant:', participantIdentity);
        console.log('🔗 Token length:', accessToken?.length || 0);

        // Validate LiveKit URL
        if (livekitUrl !== LIVEKIT_CONFIG.LIVEKIT_URL) {
            console.warn('⚠️ LiveKit URL mismatch!');
            console.warn('  Expected:', LIVEKIT_CONFIG.LIVEKIT_URL);
            console.warn('  Received:', livekitUrl);
        }

        // Configure audio session for iOS
        AudioSession.configureAudio({
            android: {
                preferredOutputList: ['speaker'],
                audioTypeOptions: AndroidAudioTypePresets.communication,
            },
            ios: {
                defaultOutput: 'speaker',
            },
        });
    }, []);

    const handleEndCall = () => {
        console.log('👋 Ending call');
        navigation.goBack();
    };

    const handleError = (error: Error) => {
        console.error('❌ LiveKit error:', error);
        Alert.alert('Connection Error', 'Failed to connect to video call: ' + error.message, [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    // Final attempt at LiveKit initialization right before room connection
    const performFinalLiveKitSetup = async () => {
        try {
            console.log('🚀 FINAL LIVEKIT SETUP ATTEMPT - RIGHT BEFORE ROOM');

            if (Platform.OS === 'android') {
                // Try our custom module one more time
                try {
                    const { LiveKitSetupModule } = NativeModules;
                    if (LiveKitSetupModule) {
                        const result = await LiveKitSetupModule.initializeLiveKit();
                        console.log('🎯 Final setup result:', result);
                    }
                } catch (e) {
                    console.log('⚠️ Final native attempt failed:', e);
                }

                // Force audio configuration right before room
                await AudioSession.configureAudio({
                    android: {
                        preferredOutputList: ['speaker'],
                        audioTypeOptions: AndroidAudioTypePresets.communication,
                    },
                });
                console.log('🔊 Final audio configuration completed');
            }
        } catch (error) {
            console.error('❌ Final setup error:', error);
        }
    };

    // Perform final setup
    useEffect(() => {
        performFinalLiveKitSetup();
    }, []);

    return (
        <LiveKitRoom
            serverUrl={livekitUrl}
            token={accessToken}
            connect={true}
            options={{
                adaptiveStream: true,
                dynacast: true,
            }}
            audio={true}
            video={true}
            onError={handleError}
            onConnected={() => {
                console.log('✅ Connected to LiveKit room');
            }}
            onDisconnected={() => {
                console.log('👋 Disconnected from LiveKit room');
            }}
        >
            <VideoCallInterface onEndCall={handleEndCall} />
        </LiveKitRoom>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 18,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Outfit',
    },
    videoContainer: {
        flex: 1,
        position: 'relative',
        marginHorizontal: 13.5,
        marginBottom: -10,
    },
    mainVideoContainer: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    mainVideo: {
        width: '100%',
        height: '100%',
    },
    avatarVideoContainer: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 108,
        height: 144,
        borderRadius: 14.4,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3.6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarVideo: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    placeholderText: {
        marginTop: 9,
        fontSize: 12.6,
        color: '#999',
    },
    videoControlsOverlay: {
        position: 'absolute',
        bottom: 18,
        right: 18,
        flexDirection: 'column',
        gap: 9,
    },
    videoControlButton: {
        width: 40.5,
        height: 40.5,
        borderRadius: 20.3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1.8 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    bottomControls: {
        position: 'relative',
        paddingHorizontal: 18,
        paddingBottom: 18,
        paddingTop: 22.5,
        alignItems: 'center',
    },
    endCallButton: {
        position: 'absolute',
        top: -30,
        left: '50%',
        marginLeft: -35,
        width: 63,
        height: 63,
        borderRadius: 31.5,
        backgroundColor: '#8170FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8170FF',
        shadowOffset: { width: 0, height: 3.6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8E3FF',
        borderRadius: 27,
        paddingHorizontal: 18,
        paddingVertical: 16.2,
        width: '100%',
        minHeight: 81,
        marginTop: -5,
        marginBottom: -15,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 22.5,
        paddingHorizontal: 16.2,
        paddingVertical: 10.8,
        minWidth: 81,
    },
    timerDot: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: '#8170FF',
        marginRight: 9,
    },
    timerText: {
        fontSize: 16.2,
        fontWeight: '600',
        color: '#000',
    },
    refreshButton: {
        width: 45,
        height: 45,
        marginLeft: 90,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomNavContainer: {
        marginBottom: 31.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 21.6,
        borderTopRightRadius: 21.6,
        paddingHorizontal: 18,
        paddingVertical: 14.4,
    },
    closeButton: {
        alignSelf: 'center',
        padding: 7.2,
        marginBottom: 7.2,
    },
    suggestionsTitle: {
        fontSize: 16.2,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 14.4,
        fontFamily: 'Inter-SemiBold',
    },
    suggestionsListContainer: {
        gap: 10.8,
    },
    suggestionBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 14.4,
        paddingVertical: 10.8,
        borderWidth: 1,
        borderColor: '#8170FF',
    },
    suggestionText: {
        fontSize: 12.6,
        color: '#8170FF',
        textAlign: 'center',
        fontFamily: 'Inter-Regular',
    },
    // Chat styles
    chatOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 21.6,
        borderTopRightRadius: 21.6,
        paddingHorizontal: 14.4,
        paddingTop: 10.8,
        paddingBottom: 9,
        maxHeight: '70%',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 7.2,
    },
    chatTitle: {
        fontSize: 16.2,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    chatMessages: {
        paddingVertical: 7.2,
        paddingBottom: 10.8,
    },
    chatBubble: {
        maxWidth: '78%',
        paddingHorizontal: 10.8,
        paddingVertical: 7.2,
        borderRadius: 12.6,
        marginBottom: 7.2,
    },
    chatBubbleLeft: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F0F5',
    },
    chatBubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: '#E7E4FF',
    },
    chatSender: {
        fontSize: 9.9,
        color: '#666',
        marginBottom: 3.6,
    },
    chatText: {
        fontSize: 12.6,
        color: '#111',
    },
    chatInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7.2,
        paddingTop: 7.2,
    },
    chatInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 18,
        paddingHorizontal: 12.6,
        paddingVertical: 7.2,
        fontSize: 12.6,
        color: '#111',
    },
    chatSendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8170FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BookedSession;

