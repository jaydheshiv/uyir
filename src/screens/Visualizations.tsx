import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useAuth } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

import type { StackNavigationProp } from '@react-navigation/stack';

type Visualization = {
  visual_id: string;
  name: string;
  input_text: string;
  refined_prompt?: string;
  image_url: string;
  avatar_url?: string;
  created_at: string;
};

type VisualizationsProps = {
  navigation: StackNavigationProp<any>;
};

function Visualizations({ navigation }: VisualizationsProps) {
  const { theme } = useTheme();
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVisualization, setSelectedVisualization] = useState<Visualization | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchVisualizations = async () => {
      console.log('🔍 DEBUG - Starting visualization fetch...');
      console.log('🔍 Token available:', token ? 'YES' : 'NO');
      console.log('🔍 User object:', JSON.stringify(user, null, 2));

      if (!token) {
        Alert.alert('Authentication error', 'Please login again');
        setLoading(false);
        return;
      }

      const user_id = (user && (user.user_id || user.id || user.userId)) || null;
      console.log('🔍 Extracted user_id:', user_id);

      if (!user_id) {
        Alert.alert('Error', 'User id not found');
        setLoading(false);
        return;
      }

      const backendUrl = `http://dev.api.uyir.ai:8081/api/visualize/user/${user_id}`;

      // Alternative endpoints to try if first one fails
      const alternativeUrls = [
        `http://dev.api.uyir.ai:8081/api/visualizations/user/${user_id}`,
      ];

      try {
        console.log('🔗 Fetching visualizations from:', backendUrl);
        console.log('🔗 User ID:', user_id);
        console.log('🔗 Token:', token ? 'Present' : 'Missing');

        let response;
        let successUrl = backendUrl;

        // Try primary URL first
        try {
          response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (fetchError) {
          console.warn('⚠️ Primary URL failed, trying alternatives...');

          // Try alternative URLs
          for (const altUrl of alternativeUrls) {
            try {
              console.log('� Trying alternative URL:', altUrl);
              response = await fetch(altUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              successUrl = altUrl;
              console.log('✅ Alternative URL worked:', altUrl);
              break;
            } catch (altError) {
              console.warn('⚠️ Alternative URL also failed:', altUrl);
            }
          }

          // If all URLs failed
          if (!response) {
            throw new Error(
              'Cannot connect to backend server.\n\n' +
              'Tried URLs:\n' +
              `1. ${backendUrl}\n` +
              alternativeUrls.map((url, i) => `${i + 2}. ${url}`).join('\n') +
              '\n\nPlease ensure:\n' +
              '1. Backend server is running on port 8000\n' +
              '2. The visualization endpoint is implemented\n' +
              '3. Check backend logs for errors'
            );
          }
        }

        console.log('�🔗 Response status:', response.status);
        console.log('🔗 Successful URL:', successUrl);
        console.log('🔗 Response headers:', JSON.stringify(response.headers));
        const text = await response.text();
        console.log('🔗 Raw response:', text.substring(0, 500)); // Limit output

        let data;
        try {
          data = text ? JSON.parse(text) : null;
          console.log('🔗 Parsed data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.error('❌ Failed to parse response JSON:', e);
          console.error('❌ Raw response text:', text.substring(0, 200));
          console.error('❌ This indicates a BACKEND ERROR - check backend logs');

          // If it's a 500 error with invalid JSON, show backend error message
          if (response.status === 500) {
            Alert.alert(
              'Server Error',
              'The backend encountered an error while fetching visualizations.\n\n' +
              'This is a backend issue. Please check:\n' +
              '1. Backend server logs\n' +
              '2. Database connection\n' +
              '3. The /api/visualize/user/{user_id} endpoint implementation'
            );
          } else {
            Alert.alert('Error', 'Invalid response from server');
          }
          setLoading(false);
          return;
        }

        if (!response.ok) {
          // Handle 404 specifically - endpoint might not exist or no visualizations
          if (response.status === 404) {
            console.log('⚠️ 404 Not Found - Checking response details...');
            console.log('⚠️ URL attempted:', backendUrl);
            console.log('⚠️ Response:', data);

            // Check if it's an actual error or just no data
            if (data && (data.detail || data.message)) {
              Alert.alert('Error', data.detail || data.message);
            } else {
              // Show empty state for 404 - user might not have any visualizations
              console.log('⚠️ Treating 404 as empty result set');
              setVisualizations([]);
            }
            setLoading(false);
            return;
          }

          // Handle 500 Internal Server Error
          if (response.status === 500) {
            console.error('❌ 500 Internal Server Error');
            console.error('❌ Backend error details:', JSON.stringify(data, null, 2));
            console.error('❌ This is a BACKEND ERROR - check backend logs');
            console.error('❌ URL:', backendUrl);
            console.error('❌ User ID:', user_id);

            Alert.alert(
              'Server Error',
              'The server encountered an error. This endpoint might not be implemented yet or there\'s a database issue.\n\n' +
              'Error: ' + (data?.detail || text || 'Internal Server Error')
            );
            setLoading(false);
            return;
          }

          const errMsg = (data && (data.detail || data.message)) || text || `Status ${response.status}`;
          console.error('❌ API Error:', response.status, errMsg);
          Alert.alert('Error', `Failed to load visualizations: ${errMsg}`);
          setLoading(false);
          return;
        }

        // ✅ Extract visualizations from backend response
        // Backend returns: { status, message, total_count, visualizations: [...] }
        let vizList: Visualization[] = [];

        if (data?.status === 'success' && data?.visualizations && Array.isArray(data.visualizations)) {
          vizList = data.visualizations;
          console.log('✅ Successfully parsed response:', {
            status: data.status,
            message: data.message,
            count: data.total_count,
            visualizations: vizList.length
          });
        } else if (data?.visualizations && Array.isArray(data.visualizations)) {
          // Fallback: if status field is missing but visualizations array exists
          vizList = data.visualizations;
          console.log('✅ Parsed visualizations (no status field):', vizList.length);
        } else if (Array.isArray(data)) {
          // Fallback: if response is just an array
          vizList = data;
          console.log('✅ Parsed visualizations (direct array):', vizList.length);
        } else {
          console.warn('⚠️ Unexpected response format:', data);
          console.warn('⚠️ Expected format: { status: "success", visualizations: [...] }');
          vizList = [];
        }

        // Already sorted by backend (newest first based on created_at)
        setVisualizations(vizList);
        console.log('✅ Loaded', vizList.length, 'visualizations for user', user_id);
      } catch (error) {
        console.error('❌ Failed to fetch visualizations:', error);
        Alert.alert('Network error', 'Failed to load visualizations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVisualizations();
  }, [token, user]);

  // Format date to "Sun, Jun 3"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time to "8:40am"
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleImagePress = (viz: Visualization) => {
    setSelectedImage(viz.image_url);
    setSelectedVisualization(viz);
  };

  const closeFullScreen = () => {
    setSelectedImage(null);
    setSelectedVisualization(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>Visualizations</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading visualizations...</Text>
        </View>
      ) : visualizations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>No visualizations yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Create your first visualization to see it here</Text>
        </View>
      ) : (
        /* Visualization Cards */
        <ScrollView
          style={[styles.scrollViewFlex, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.cardsContainer}
          showsVerticalScrollIndicator={false}
        >
          {visualizations.map((viz) => (
            <TouchableOpacity
              key={viz.visual_id}
              style={styles.card}
              onPress={() => handleImagePress(viz)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: viz.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.overlayText}>
                <Text style={styles.cardDate}>
                  {formatDate(viz.created_at)}
                  {'\n'}
                  {formatTime(viz.created_at)}
                </Text>
                <Text style={styles.cardEmotion}>
                  {viz.input_text.length > 50
                    ? viz.input_text.substring(0, 50) + '...'
                    : viz.input_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFullScreen}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          {selectedVisualization && (
            <>
              <Image
                source={{ uri: selectedImage || '' }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <View style={styles.fullscreenInfoContainer}>
                <Text style={styles.fullscreenDate}>
                  {formatDate(selectedVisualization.created_at)} at {formatTime(selectedVisualization.created_at)}
                </Text>
                <Text style={styles.fullscreenText}>
                  {selectedVisualization.input_text}
                </Text>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Bottom Navigation - exactly as Avatarhome1 */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav
          onClockPress={() => navigation.navigate('Visualizations')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16.2,
    color: '#000',
    fontFamily: 'Outfit',
    fontWeight: '400',
    marginLeft: 21.6,
    marginTop: 81,
    marginBottom: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 90,
  },
  loadingText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 90,
    paddingHorizontal: 36,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 7.2,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14.4,
    color: '#7A7A7A',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 14.4,
    paddingBottom: 28.8,
  },
  card: {
    backgroundColor: '#E7E4FF',
    borderRadius: 19.8,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.6 },
    shadowOpacity: 0.11,
    shadowRadius: 16.2,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 198,
    borderRadius: 19.8,
  },
  overlayText: {
    position: 'absolute',
    top: 18,
    left: 16.2,
    right: 16.2,
  },
  cardDate: {
    fontSize: 14.4,
    fontFamily: 'Roboto',
    marginBottom: 0,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.8 },
    textShadowRadius: 6,
  },
  cardEmotion: {
    fontSize: 15.3,
    fontFamily: 'Lora',
    fontWeight: '700',
    lineHeight: 21.6,
    marginTop: 117,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.8 },
    textShadowRadius: 6,
  },
  scrollViewFlex: {
    flex: 1,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 18,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
    padding: 7.2,
  },
  fullscreenImage: {
    width: '100%',
    height: '70%',
  },
  fullscreenInfoContainer: {
    position: 'absolute',
    bottom: 36,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 18,
    borderRadius: 14.4,
  },
  fullscreenDate: {
    fontSize: 12.6,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 7.2,
    opacity: 0.8,
  },
  fullscreenText: {
    fontSize: 16.2,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 21.6,
  },
});

export default Visualizations;
