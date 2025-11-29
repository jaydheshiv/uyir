import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { getGenerateCallLinkEndpoint, LIVEKIT_CONFIG } from '../config/livekit.config';
import { RootStackParamList } from '../navigation/AppNavigator';

import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../store/useAppStore';

interface SessionBooking {
    session_id: string;
    professional_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: string;
    cost?: number;
    payment_status: string;
    booking_notes?: string;
    created_at: string;
    availability_slot_id?: string;
    livekit_room_name?: string;
    livekit_room_sid?: string;
    livekit_call_url?: string;
    call_start_time?: string;
    call_end_time?: string;
    call_duration?: number;
    call_status?: string;
    creator_joined_time?: string;
    caller_joined_time?: string;
    call_recording_url?: string;
}

const UpComingUserSessions: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { token, logout } = useAuth();
    const [sessions, setSessions] = useState<SessionBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

    const fetchBookings = async (isRefresh = false) => {
        console.log(`🔍 ${isRefresh ? 'Refreshing' : 'Loading'} sessions...`, token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found!');

        if (!token) {
            console.log('❌ No token available - user not authenticated');
            setLoading(false);
            setRefreshing(false);
            Alert.alert('Authentication Required', 'Please log in to view your bookings');
            return;
        }

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const backendUrl = 'http://dev.api.uyir.ai:8081/sessions/my-bookings';
            console.log('📡 Fetching bookings from:', backendUrl);
            console.log('🔐 Authorization header:', `Bearer ${token.substring(0, 20)}...`);

            const response = await fetch(backendUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Bookings fetched successfully:', data.length, 'sessions');
                setSessions(data);
            } else {
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.detail || JSON.stringify(errorData);
                    console.error('❌ Failed to fetch bookings:', response.status, errorData);

                    // Check if token signature expired
                    if (errorDetails.includes('Signature has expired') || errorDetails.includes('token validation failed')) {
                        console.log('🔓 Token expired - logging out user');
                        logout();
                        Alert.alert(
                            'Session Expired',
                            'Your session has expired. Please log in again.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'Login' }],
                                            })
                                        );
                                    }
                                }
                            ]
                        );
                        return;
                    }
                } catch {
                    errorDetails = await response.text();
                    console.error('❌ Failed to fetch bookings:', response.status, errorDetails);
                }

                setSessions([]);

                if (response.status === 401) {
                    Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
                } else {
                    Alert.alert('Error', 'Failed to fetch bookings');
                }
            }
        } catch (err) {
            console.error('❌ Network error fetching bookings:', err);
            setSessions([]);
            Alert.alert('Network error', 'Could not connect to backend');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings(false);
    }, [token]);

    const handleRefresh = () => {
        fetchBookings(true);
    };

    // Get session status based on time
    const getSessionStatus = (session: SessionBooking) => {
        const now = new Date();
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);

        // Check if session is already completed
        if (session.call_status === 'completed' || session.call_end_time) {
            return { status: 'Completed', canStart: false };
        }

        // Check if current time is within session window (or up to 15 mins before)
        const fifteenMinsBefore = new Date(startTime.getTime() - 15 * 60 * 1000);

        if (now >= fifteenMinsBefore && now <= endTime) {
            return { status: 'Start', canStart: true };
        } else if (now > endTime) {
            return { status: 'Completed', canStart: false };
        } else {
            return { status: 'Scheduled', canStart: false };
        }
    };

    const handleStartSession = async (session_id: string) => {
        if (!token) return;
        setStartingSessionId(session_id);
        try {
            const url = getGenerateCallLinkEndpoint(session_id);

            console.log('🎥 Starting session:', session_id);
            console.log('🎥 Endpoint:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('🎥 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Call link generated successfully');
                console.log('📍 LiveKit URL:', data.livekit_url);
                console.log('📍 Room Name:', data.room_name);
                console.log('👤 Participant:', data.participant_identity);
                console.log('🎭 Role:', data.participant_role);

                // Navigate to BookedSession with LiveKit credentials
                navigation.navigate('BookedSession', {
                    sessionId: data.session_id,
                    callUrl: data.call_url,
                    accessToken: data.access_token,
                    roomName: data.room_name,
                    participantIdentity: data.participant_identity,
                    participantRole: data.participant_role,
                    livekitUrl: data.livekit_url || LIVEKIT_CONFIG.LIVEKIT_URL,
                });
            } else if (response.status === 400) {
                const errorData = await response.json();
                console.error('❌ Session timing error:', errorData);
                Alert.alert(
                    'Session Not Started',
                    'The session can only be started during its scheduled time window. Please wait until the scheduled time.'
                );
            } else if (response.status === 404) {
                Alert.alert('Session Not Found', 'This session could not be found.');
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to start session:', errorText);
                Alert.alert('Error', 'Failed to start session. Please try again or contact support.');
            }
        } catch (err) {
            console.error('❌ Network error:', err);
            Alert.alert('Network Error', 'Could not connect to backend. Please check your internet connection.');
        } finally {
            setStartingSessionId(null);
        }
    };

    return (
        <View style={styles.root}>
            {/* Header with Back Arrow aligned */}
            <View style={styles.headerWrapper}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#222" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, styles.headerTitleNoMargin]}>All Booked Sessions</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} disabled={refreshing}>
                    <RefreshCw
                        color={refreshing ? "#999" : "#6C5CE7"}
                        size={24}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>
            </View>

            {/* Table */}
            <View style={styles.tableWrapper}>
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_3]}>Time</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellFlex0_9]}>Date</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Payment</Text>
                    <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_1, { textAlign: 'center' }]}>Status</Text>
                </View>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
                        <ActivityIndicator size="large" color="#8170FF" />
                    </View>
                ) : (
                    <FlatList
                        data={sessions}
                        keyExtractor={(item) => item.session_id}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={['#6C5CE7']}
                                tintColor="#6C5CE7"
                            />
                        }
                        renderItem={({ item }) => {
                            const { status, canStart } = getSessionStatus(item);
                            const isStarting = startingSessionId === item.session_id;

                            return (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.tableCellFlex1_3]}>
                                        {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.tableCellFlex0_9]}>
                                        {new Date(item.start_time).toLocaleDateString()}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.tableCellFlex1_5]}>
                                        {item.cost ? `$${item.cost}` : '-'}
                                    </Text>
                                    <View style={styles.statusContainer}>
                                        {canStart ? (
                                            <TouchableOpacity
                                                style={[styles.startBtn, isStarting && styles.startBtnDisabled]}
                                                onPress={() => handleStartSession(item.session_id)}
                                                disabled={isStarting}
                                            >
                                                {isStarting ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <Text style={styles.startBtnText} numberOfLines={1}>Start</Text>
                                                )}
                                            </TouchableOpacity>
                                        ) : (
                                            <Text style={styles.completedText} numberOfLines={1}>{status}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNavContainer}>
                <CustomBottomNav />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    headerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 45,
        paddingHorizontal: 12.6,
        paddingBottom: 12.6,
        backgroundColor: '#F7F7F7',
        justifyContent: 'space-between',
    },
    backBtn: {
        padding: 2.7,
        borderRadius: 16.2,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    refreshBtn: {
        padding: 2.7,
        borderRadius: 16.2,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    editBtn: {
        padding: 2.7,
        borderRadius: 16.2,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    headerTitle: {
        fontSize: 21.6,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        textAlign: 'center',
        fontFamily: 'Outfit-Bold',
    },
    tableWrapper: {
        marginHorizontal: 12.6,
        marginTop: 5.4,
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#D1C9F7',
        paddingBottom: 5.4,
        flex: 1,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#E5E5E5',
        paddingVertical: 12.6,
        paddingHorizontal: 12.6,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    tableHeaderCell: {
        fontSize: 13.5,
        fontWeight: 'bold',
        color: '#222',
        fontFamily: 'Outfit-Bold',
        textAlign: 'left',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        paddingVertical: 10.8,
        paddingHorizontal: 12.6,
        backgroundColor: '#fff',
        alignItems: 'center',
        minHeight: 46.8,
    },
    tableCell: {
        fontSize: 12.6,
        color: '#222',
        fontFamily: 'Outfit-Regular',
        textAlign: 'left',
    },
    startBtn: {
        backgroundColor: '#6C5CE7',
        borderRadius: 6.3,
        paddingVertical: 5.4,
        paddingHorizontal: 12.6,
        minWidth: 48.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startBtnDisabled: {
        backgroundColor: '#9E9E9E',
        opacity: 0.7,
    },
    startBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12.6,
        fontFamily: 'Outfit-Bold',
    },
    completedText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 12.6,
        fontFamily: 'Outfit-Bold',
        textAlign: 'center',
    },
    headerTitleNoMargin: {
        marginLeft: 0,
    },
    tableCellFlex1_3: {
        flex: 2,
        textAlign: 'left',
    },
    tableCellFlex0_9: {
        flex: 2.3,
        textAlign: 'left',
    },
    tableCellFlex1_5: {
        flex: .9,
        textAlign: 'left',
    },
    tableCellFlex1_1: {
        flex: 2.5,
        textAlign: 'center',
    },
    tableCellFlex1: {
        flex: 1,
    },
    tableCellFlex0_9Center: {
        flex: 1.7,
        textAlign: 'center',
    },
    tableCellFlex1_5Center: {
        flex: 1.5,
        textAlign: 'center',
    },
    statusContainer: {
        flex: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomNavContainer: {
        marginBottom: 31.5,
    },
});

export default UpComingUserSessions;
