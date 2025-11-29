import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { getGenerateCallLinkEndpoint, LIVEKIT_CONFIG } from '../config/livekit.config';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

// Types for API response
interface CallHistoryEntry {
  session_id: string;
  professional_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  call_start_time?: string;
  call_end_time?: string;
  call_duration?: number;
  call_status?: string;
  creator_joined_time?: string;
  caller_joined_time?: string;
  cost?: number;
  created_at: string;
}

interface SessionsPageResponse {
  items: CallHistoryEntry[];
  next_cursor: string | null;
}

interface GenerateCallLinkResponse {
  session_id: string;
  room_name: string;
  room_sid: string;
  call_url: string;
  livekit_url: string;
  participant_identity: string;
  participant_role: string;
  access_token: string;
  token_ttl_seconds: number;
}

const ComingSessions: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { token } = useAuth();

  // State management
  const [sessions, setSessions] = useState<CallHistoryEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  // Fetch sessions from backend
  const fetchSessions = async (cursor?: string, isRefresh: boolean = false) => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const backendUrl = 'http://dev.api.uyir.ai:8081';

      // Build query parameters
      const params = new URLSearchParams({
        limit: '20',
      });
      if (cursor) {
        params.append('cursor', cursor);
      }

      const url = `${backendUrl}/professional/sessions?${params.toString()}`;
      console.log('📡 Fetching sessions from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data: SessionsPageResponse = await response.json();
        console.log('✅ Sessions fetched:', data.items.length, 'sessions');

        // Update sessions list
        if (isRefresh || !cursor) {
          // Fresh load or refresh - replace all data
          setSessions(data.items);
        } else {
          // Load more - append to existing data
          setSessions(prev => [...prev, ...data.items]);
        }

        // Update pagination cursor
        setNextCursor(data.next_cursor);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch sessions:', response.status, errorText);
        Alert.alert('Error', 'Failed to load sessions');
      }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      Alert.alert('Error', 'Network error while loading sessions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Generate call link and start session
  const handleStartSession = async (sessionId: string) => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    try {
      setStartingSessionId(sessionId);

      const url = getGenerateCallLinkEndpoint(sessionId);
      console.log('📡 Generating call link for session:', sessionId);
      console.log('📡 Endpoint:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data: GenerateCallLinkResponse = await response.json();
        console.log('✅ Call link generated:', data.call_url);
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
          'The session can only be started during its scheduled time window.'
        );
      } else if (response.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to join this session');
      } else if (response.status === 404) {
        Alert.alert('Session Not Found', 'This session could not be found.');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to generate call link:', response.status, errorText);

        // Check if error is related to LiveKit configuration
        if (errorText.includes('your_livekit_url_here') || errorText.includes('ClientConnectorDNSError')) {
          Alert.alert(
            'Backend Configuration Error',
            'The backend LiveKit configuration is not set up correctly. Please contact your backend team to update the LiveKit URL from "your_livekit_url_here" to "wss://uyir-dm431fc1.livekit.cloud".\n\nSee BACKEND_LIVEKIT_CONFIG_FIX.md for details.'
          );
        } else {
          Alert.alert('Error', 'Failed to start session. Please try again or contact support.');
        }
      }
    } catch (error) {
      console.error('❌ Error starting session:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check for network errors related to DNS/backend
      if (errorMessage.includes('Network request failed') || errorMessage.includes('Failed to fetch')) {
        Alert.alert(
          'Network Error',
          'Could not connect to backend. Please check:\n1. Backend is running\n2. Internet connection is active\n3. Backend LiveKit configuration is correct'
        );
      } else {
        Alert.alert('Network Error', 'Could not connect to backend. Please check your internet connection.');
      }
    } finally {
      setStartingSessionId(null);
    }
  };

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchSessions(undefined, true);
  };

  // Handle load more (pagination)
  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetchSessions(nextCursor);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Returns DD/MM/YYYY
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get session status
  const getSessionStatus = (session: CallHistoryEntry) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    if (session.call_status === 'completed' || session.call_end_time) {
      return 'Completed';
    } else if (now >= startTime && now <= endTime) {
      return 'Start';
    } else if (now > endTime) {
      return 'Completed';
    } else {
      return 'Scheduled';
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header with Back Arrow aligned */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleNoMargin, { color: theme.text }]}>All Booked Sessions</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Edit color={theme.text} size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_3]}>User ID</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex0_9]}>Time</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Date</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_1]}>Status</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions found</Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.session_id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#7C3AED']}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={styles.loadMoreText}>Loading more...</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const status = getSessionStatus(item);
              const isStarting = startingSessionId === item.session_id;

              return (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableCellFlex1]} numberOfLines={1}>
                    {item.user_id.substring(0, 8)}...
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellFlex0_9Center]}>
                    {formatTime(item.start_time)}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellFlex1_5Center]}>
                    {formatDate(item.start_time)}
                  </Text>
                  <View style={styles.statusContainer}>
                    {status === 'Start' ? (
                      <TouchableOpacity
                        style={[styles.startBtn, isStarting && styles.startBtnDisabled]}
                        onPress={() => handleStartSession(item.session_id)}
                        disabled={isStarting}
                      >
                        {isStarting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.startBtnText}>Start</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.completedText}>{status}</Text>
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
    // Remove negative margin to avoid overlap
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 10.8,
    paddingHorizontal: 12.6,
    backgroundColor: '#fff',
  },
  tableHeaderCell: {
    fontSize: 12.6,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 9.9,
    paddingHorizontal: 12.6,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  startBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 6.3,
    paddingVertical: 4.5,
    paddingHorizontal: 16.2,
    minWidth: 55.8,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28.8,
  },
  loadingText: {
    marginTop: 9,
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28.8,
  },
  emptyText: {
    fontSize: 12.6,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  loadMoreContainer: {
    paddingVertical: 10.8,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: 5.4,
    fontSize: 11.7,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  headerTitleNoMargin: {
    marginLeft: 0,
  },
  tableCellFlex1_3: {
    flex: 1.3,
  },
  tableCellFlex0_9: {
    flex: 0.9,
  },
  tableCellFlex1_5: {
    flex: 1.5,
  },
  tableCellFlex1_1: {
    flex: 1.1,
  },
  tableCellFlex1: {
    flex: 1,
  },
  tableCellFlex0_9Center: {
    flex: 0.9,
    textAlign: 'center',
  },
  tableCellFlex1_5Center: {
    flex: 1.5,
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

export default ComingSessions;

