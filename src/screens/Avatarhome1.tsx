import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import TopLeftProfileIcon from '../components/TopLeftProfileIcon';
import { applyPreset, imagekitPresets } from '../lib/imagekit'; // ✅ ImageKit transformations
import { useAuth, useAvatar, useProfessional } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

// Define your navigation param list type
type RootStackParamList = {
  Visualizations: undefined;

  Connections: { prompt: string } | undefined;
  // add other routes here if needed
};

export default function AvatarHome1() {
  const [entryCount, setEntryCount] = useState(0); // ✅ Changed to allow state updates
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const [showImage, setShowImage] = useState(false);
  const [visualizedText, setVisualizedText] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState(false); // New state
  const [visualImageUrl, setVisualImageUrl] = useState<string | null>(null);
  const [currentVisualId, setCurrentVisualId] = useState<string | null>(null); // Store visual_id
  const [showAssessment, setShowAssessment] = useState(false); // New state
  const [imageOpacity] = useState(new Animated.Value(0)); // For fade-in effect
  const [assessmentOpacity] = useState(new Animated.Value(0)); // For assessment fade-in
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [professionalImageUrl, setProfessionalImageUrl] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const isActive = inputValue.trim().length > 0;

  // Get token and user from Zustand
  const { token, user } = useAuth();
  const { avatar, syncAvatarFromUser, setAvatarUrl } = useAvatar();
  const { professionalData } = useProfessional();
  const { theme } = useTheme();

  // ✅ Track display name with state for reactive updates - matching ProfileScreen logic
  const [displayName, setDisplayName] = useState(
    professionalData?.display_name || user?.avatar_name || user?.email?.split('@')[0] || 'User'
  );

  // ✅ Update display name when user or professional data changes
  useEffect(() => {
    const newName = professionalData?.display_name || user?.avatar_name || user?.email?.split('@')[0] || 'User';
    setDisplayName(newName);
    console.log('🏠 Avatarhome1: Updated display name to:', newName);
  }, [professionalData?.display_name, user?.avatar_name, user?.email]);

  // ✅ Fetch previous visualization count on mount
  useEffect(() => {
    const fetchVisualizationCount = async () => {
      if (!token || !user) return;

      const user_id = user.user_id || user.id || user.userId;
      if (!user_id) return;

      try {
        const backendUrl = `http://dev.api.uyir.ai:8081/api/visualize/user/${user_id}`;
        console.log('📊 Fetching visualization count from:', backendUrl);

        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const count = data?.total_count || data?.visualizations?.length || 0;
          setEntryCount(count);
          console.log('✅ Loaded visualization count:', count);
        } else {
          console.log('⚠️ Failed to fetch visualization count, using 0');
          setEntryCount(0);
        }
      } catch (error) {
        console.error('❌ Error fetching visualization count:', error);
        setEntryCount(0);
      }
    };

    fetchVisualizationCount();
  }, [token, user]);

  // ✅ Sync avatar data when component mounts
  useEffect(() => {
    syncAvatarFromUser();
    console.log('🏠 Avatarhome1: Synced avatar from user on mount');
  }, [syncAvatarFromUser]);

  // ✅ Fetch user avatar image (from CreateAvatar1)
  const fetchUserAvatarImage = useCallback(async () => {
    if (!user?.avatar_id || !token) {
      console.log('🏠 No avatar_id or token, skipping avatar image fetch');
      return;
    }

    try {
      const backendUrl = `http://dev.api.uyir.ai:8081/api/avatar/${user.avatar_id}`;
      console.log('🏠 Fetching user avatar image from:', backendUrl);

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🏠 Avatar image response:', data);

        // Extract image URL from photo_path field
        const imageUrl = data.photo_path || data.avatar_url || data.image_url || data.url;
        if (imageUrl) {
          setAvatarImageUrl(imageUrl);
          setAvatarUrl(imageUrl);
          console.log('✅ Set avatar image URL:', imageUrl);
        }
      } else {
        console.log('⚠️ Failed to fetch avatar image:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching avatar image:', error);
    }
  }, [setAvatarUrl, token, user?.avatar_id]);

  // ✅ Fetch professional profile image (from CreateAvatar3)
  const fetchProfessionalImage = useCallback(async () => {
    if (!professionalData || !token) {
      console.log('🏠 Not a professional or no token, skipping professional image fetch');
      return;
    }

    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/';
      console.log('🏠 Fetching professional profile from:', backendUrl);

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🏠 Professional profile response:', data);

        // ✅ Extract data from nested professional object
        const prof = data.professional || data;

        const profileImageUrl = prof.profile_image_url || prof.image_url || prof.avatar_url;
        if (profileImageUrl) {
          setProfessionalImageUrl(profileImageUrl);
          console.log('✅ Set professional profile image URL:', profileImageUrl);
        }
      } else {
        console.log('⚠️ Failed to fetch professional profile:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching professional profile:', error);
    }
  }, [professionalData, token]);

  // ✅ Fetch images on mount
  useEffect(() => {
    if (professionalData) {
      fetchProfessionalImage();
    } else {
      fetchUserAvatarImage();
    }
  }, [fetchProfessionalImage, fetchUserAvatarImage, professionalData]);

  useEffect(() => {
    if (avatar?.avatarUrl && avatarImageUrl !== avatar.avatarUrl) {
      setAvatarImageUrl(avatar.avatarUrl);
      return;
    }

    if (professionalData && !professionalImageUrl && !avatarImageUrl && user?.avatar_id && token) {
      fetchUserAvatarImage();
    }
  }, [avatar?.avatarUrl, avatarImageUrl, fetchUserAvatarImage, professionalData, professionalImageUrl, token, user?.avatar_id]);

  const handleSend = () => {
    if (!isActive) return;
    setEntries([...entries, inputValue]);
    setInputValue('');
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    Keyboard.dismiss();
  };

  const handleVisualize = async () => {
    if (!isActive) return;

    // ✅ Increment entry count when visualize is clicked
    setEntryCount(prevCount => prevCount + 1);

    // capture the prompt locally (state updates are async)
    const prompt = inputValue;
    // show the text immediately and start pending state
    setVisualizedText(prompt);
    setShowImage(false);
    setPendingImage(true);
    setShowAssessment(false);
    setVisualImageUrl(null);
    imageOpacity.setValue(0); // Reset image opacity
    assessmentOpacity.setValue(0); // Reset assessment opacity
    setInputValue('');

    if (!token) {
      Alert.alert('Authentication error', 'Please login again');
      setPendingImage(false);
      return;
    }

    const user_id = (user && (user.user_id || user.id || user.userId)) || null;
    const avatar_id = user?.avatar_id || null;

    if (!user_id) {
      Alert.alert('Error', 'User id not found');
      setPendingImage(false);
      return;
    }

    if (!avatar_id) {
      Alert.alert(
        'Avatar Required',
        'Please create your avatar before generating visualizations.\n\n' +
        'Your avatar helps personalize your visualization experience.',
        [
          {
            text: 'Create Avatar',
            onPress: () => navigation.navigate('CreateAvatar1' as any)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      setPendingImage(false);
      return;
    }

    // Prepare request - Use production API with domain
    const backendUrl = 'http://dev.api.uyir.ai:8081/api/visualize';

    try {
      // Test backend connectivity first
      const baseUrl = 'http://dev.api.uyir.ai:8081';
      console.log('🔗 Testing backend connectivity to:', baseUrl);

      try {
        const testResponse = await fetch(`${baseUrl}/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        console.log('✅ Backend is reachable, status:', testResponse.status);
      } catch (testErr) {
        console.error('❌ Backend connectivity test failed:', testErr);
        Alert.alert(
          'Connection Error',
          `Cannot reach backend server at ${baseUrl}\n\n` +
          'Please ensure:\n' +
          '1. Backend API is running (dev.api.uyir.ai)\n' +
          '2. You have internet connection\n' +
          '3. API endpoint is accessible'
        );
        setPendingImage(false);
        return;
      }

      const formData = new FormData();
      formData.append('prompt', prompt || '');
      formData.append('user_id', String(user_id));
      formData.append('avatar_id', String(avatar_id));
      formData.append('tenant_id', '1'); // Default tenant_id
      formData.append('name', 'VIS');

      console.log('🔗 Visualize: POST', backendUrl);
      console.log('🔗 Visualize: prompt:', prompt);
      console.log('🔗 Visualize: user_id:', user_id);
      console.log('🔗 Visualize: avatar_id:', avatar_id);

      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set Content-Type for FormData
        },
        body: formData,
      });

      console.log('🔗 Visualize: response status', res.status);
      const text = await res.text();
      console.log('🔗 Visualize: raw response:', text);

      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
        console.log('🔗 Visualize: parsed data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.warn('Could not parse visualize response JSON, raw text:', text);
      }

      // Accept both 200 and 201 as valid responses (backend returns 201 Created)
      if (res.status !== 200 && res.status !== 201) {
        const errMsg = (data && (data.detail || data.message)) || text || `Status ${res.status}`;

        // Special handling for avatar-related errors
        if (res.status === 500 && errMsg.includes('digitaloceanspaces.com')) {
          Alert.alert(
            'Avatar Processing',
            'Your avatar is still being processed. Please wait a few moments and try again.\n\n' +
            'If this issue persists, try uploading a different photo or using the default avatar.',
            [
              { text: 'Try Again', onPress: () => handleVisualize() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else if (res.status === 500 && errMsg.includes('timeout')) {
          Alert.alert(
            'Timeout Error',
            'The server took too long to respond. This might be due to:\n\n' +
            '• Avatar still processing\n' +
            '• Network connectivity issues\n\n' +
            'Please try again in a moment.',
            [
              { text: 'Try Again', onPress: () => handleVisualize() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert('Visualization error', errMsg.toString());
        }

        setPendingImage(false);
        return;
      }

      // ✅ Extract visualization data from response
      let imageUrl = null;
      let visualId = null;

      // Response structure: { status, message, visualization: { visual_id, image_url, ... } }
      if (data?.visualization) {
        const visualization = data.visualization;
        imageUrl = visualization.image_url;
        visualId = visualization.visual_id;

        console.log('✅ Visualization created successfully');
        console.log('   - visual_id:', visualId);
        console.log('   - image_url:', imageUrl);
        console.log('   - refined_prompt:', visualization.refined_prompt);
      } else {
        // Fallback: check other possible locations for backward compatibility
        if (data?.output_url) {
          imageUrl = data.output_url;
          console.log('🔗 Visualize: Found image at data.output_url');
        } else if (data?.image_url) {
          imageUrl = data.image_url;
          console.log('🔗 Visualize: Found image at data.image_url');
        } else if (data?.url) {
          imageUrl = data.url;
          console.log('🔗 Visualize: Found image at data.url');
        }
      }

      console.log('🔗 Visualize: extracted imageUrl:', imageUrl);

      if (imageUrl) {
        // ✅ Store the visual_id and image_url
        setVisualImageUrl(imageUrl);
        setCurrentVisualId(visualId);

        // ✅ Log the stored visualization for user
        if (visualId) {
          console.log('💾 Visualization stored:');
          console.log('   - visual_id:', visualId);
          console.log('   - user_id:', user_id);
          console.log('   - image_url:', imageUrl);
        }

        // ✅ Show image immediately once URL is received (no delay)
        setShowImage(true);
        setPendingImage(false);

        // Start fade-in animation immediately for smooth appearance
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 600, // Slightly faster fade-in
          useNativeDriver: true,
        }).start();

        // Show assessment after a shorter delay
        setTimeout(() => {
          setShowAssessment(true);
          Animated.timing(assessmentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }, 800); // Reduced from 1500ms to 800ms
      } else {
        console.warn('🔗 Visualize: No image URL found in response');
        // No image URL returned, still show assessment after short delay
        setPendingImage(false);
        setTimeout(() => {
          setShowAssessment(true);
          Animated.timing(assessmentOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        }, 800);
      }
    } catch (err) {
      console.error('❌ Visualization failed:', err);
      console.error('❌ Error details:', JSON.stringify(err, null, 2));

      // More detailed error message
      let errorMessage = 'Failed to reach visualization service. ';

      if (err instanceof TypeError && err.message === 'Network request failed') {
        errorMessage += 'Please check:\n\n' +
          '1. You have internet connection\n' +
          '2. Backend API is accessible (dev.api.uyir.ai)\n' +
          '3. Your device can reach HTTPS endpoints\n' +
          '4. Backend URL: http://dev.api.uyir.ai:8081';
      } else {
        errorMessage += (err as Error).message || 'Unknown error';
      }

      Alert.alert('Network error', errorMessage);
      setPendingImage(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />
      {/* Top Left Icon Only */}
      <View style={[styles.topLeftIconContainer, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.navigate('SubscribedProfessionals' as any)}>
          <TopLeftProfileIcon />
        </TouchableOpacity>
      </View>
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {professionalImageUrl ? (
            <Image
              source={{
                uri: applyPreset(professionalImageUrl, 'profileAvatar', 30) || undefined
              }}
              style={styles.profileImage}
              onError={() => {
                console.log('Failed to load professional image');
                setProfessionalImageUrl(null);
              }}
            />
          ) : avatarImageUrl ? (
            <Image
              source={{
                uri: applyPreset(avatarImageUrl, 'profileAvatar', 30) || undefined
              }}
              style={styles.profileImage}
              onError={() => {
                console.log('Failed to load avatar image');
                setAvatarImageUrl(null);
              }}
            />
          ) : avatar?.avatarUrl ? (
            <Image
              source={{
                uri: applyPreset(avatar.avatarUrl, 'profileAvatar', 30) || undefined
              }}
              style={styles.profileImage}
              onError={() => console.log('Failed to load avatar image')}
            />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={30} color="#999" />
            </View>
          )}
          <View>
            <Text style={[styles.profileName, { color: theme.text }]}>{displayName}</Text>
            <Text style={[styles.entryCount, { color: theme.primary }]}>{entryCount + entries.length}</Text>
            <Text style={[styles.entryLabel, { color: theme.textSecondary }]}>Total entries</Text>
          </View>
        </View>

        {/* Main Card (only title and typing bar) */}
        <View style={[styles.mainCard, { backgroundColor: theme.cardBackground }]}>
          {!showImage && !visualizedText && (
            <>
              <View style={styles.cardTitleWrapper}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>What's been on your mind today?</Text>
              </View>
              <View style={styles.iconRow}>
                <Ionicons name="volume-high" size={18} color="#8170FF" />
                <Ionicons name="thumbs-up" size={18} color="#8170FF" style={styles.iconSpacing} />
                <Ionicons name="thumbs-down" size={18} color="#8170FF" style={styles.iconSpacing} />
                <Ionicons name="refresh" size={18} color="#8170FF" style={styles.iconSpacing} />
              </View>
            </>
          )}
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.entriesScrollAboveCard}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={true}
              ref={scrollRef}
            >
              {entries.map((entry, idx) => (
                <View key={idx} style={[styles.entryBubble, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: 1 }]}>
                  <Text style={[styles.entryText, { color: theme.text }]}>{entry}</Text>
                </View>
              ))}
              {visualizedText && (
                <View style={[styles.entryBubble, { backgroundColor: theme.cardBackground, borderColor: theme.border, borderWidth: 1 }]}>
                  <Text style={[styles.entryText, { color: theme.text }]}>{visualizedText}</Text>
                </View>
              )}
              {pendingImage && (
                <View style={styles.pendingImageContainer}>
                  <Text style={styles.pendingImageText}>Visualizing...</Text>
                </View>
              )}
              {showImage && (
                <>
                  <Animated.View style={[styles.animatedImageContainer, { opacity: imageOpacity }]}>
                    {visualImageUrl ? (
                      <Image
                        source={{
                          uri: imagekitPresets.contentImage(screenWidth - 40)[0]
                            ? applyPreset(visualImageUrl, 'contentImage', screenWidth - 40) || undefined
                            : visualImageUrl
                        }}
                        style={styles.imageStyle}
                        resizeMode="cover"
                        onError={() => {
                          console.log('Failed to load visualization image');
                          setVisualImageUrl(null);
                        }}
                      />
                    ) : (
                      <View style={[styles.imageStyle, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={50} color="#999" />
                        <Text style={{ color: '#999', marginTop: 10, fontSize: 14 }}>Visualization failed</Text>
                      </View>
                    )}
                  </Animated.View>
                  {showAssessment && (
                    <Animated.View
                      style={[
                        styles.assessmentContainer,
                        {
                          opacity: imageOpacity, // Use the same fade-in as the image
                          transform: [
                            {
                              translateY: imageOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0], // Slides up as it fades in
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.assessmentText}>
                        Take this 5-question self-assessment to reflect on your well-being over the past two weeks.
                      </Text>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.skipButton}>
                          <Text style={styles.skipButtonText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.takeButton}
                          onPress={() => navigation.navigate('Connections', { prompt: visualizedText || '' })}
                        >
                          <Text style={styles.takeButtonText}>Start now</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
          {/* Typing Card */}
          <View style={[styles.typingCardRow, { backgroundColor: theme.cardBackground }]}>
            <TextInput
              style={[styles.typingPlaceholder, { color: theme.text }]}
              placeholder="Let your thoughts flow"
              placeholderTextColor={theme.inputPlaceholder}
              multiline
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.controlsRow}>
              <TouchableOpacity style={[styles.micButton, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="mic" size={20} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.visualizeButton,
                  { borderColor: theme.textSecondary, backgroundColor: theme.cardBackground },
                  isActive && { borderColor: theme.primary, backgroundColor: theme.primary }
                ]}
                onPress={handleVisualize}
                activeOpacity={isActive ? 0.7 : 1}
                disabled={!isActive}
              >
                <Text style={[
                  styles.visualizeText,
                  { color: theme.textSecondary },
                  isActive && { color: '#fff' }
                ]}>
                  Visualize
                </Text>
                <View style={[styles.visualizeCount, { backgroundColor: theme.cardBackground }, isActive && { backgroundColor: theme.primary }]}>
                  <Text style={[
                    styles.countText,
                    { color: theme.textSecondary },
                    isActive && { color: '#fff' }
                  ]}>🟡 1</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: theme.textSecondary },
                  isActive && { backgroundColor: theme.primary }
                ]}
                onPress={handleSend}
                activeOpacity={isActive ? 0.7 : 1}
                disabled={!isActive}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/* Bottom Navigation (No home indicator) */}
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
    backgroundColor: 'white',
  },
  topLeftIconContainer: {
    paddingTop: 55,
    paddingLeft: 16.2,
    paddingBottom: 7.2,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  topLeftIcon: {
    width: 25.2,
    height: 25.2,
    borderRadius: 12.6,
    backgroundColor: '#E7E4FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10.8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7.2,
    marginBottom: 25,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7E4FF',
  },
  profileName: {
    fontFamily: 'Outfit',
    fontSize: 17,
    fontWeight: '600',
    color: 'black',
  },
  entryCount: {
    fontFamily: 'Outfit',
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  entryLabel: {
    fontFamily: 'Outfit',
    fontSize: 10.8,
    fontWeight: '500',
    color: '#666666',
  },
  mainCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 13.5,
    padding: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.6 },
    shadowOpacity: 0.11,
    shadowRadius: 16.2,
    elevation: 5,
    minHeight: 500,
    width: '105%',
    alignSelf: 'center',
    flexDirection: 'column',      // Ensure column layout
  },
  cardTitleWrapper: {
    marginTop: 16.2,
    padding: 7.2,
  },
  cardTitle: {
    fontFamily: 'Outfit',
    fontSize: 14.4,
    color: 'black',
    marginBottom: 9,
  },
  entriesScroll: {
    flex: 1,
    marginBottom: 27,
  },
  entriesScrollAboveCard: {
    maxHeight: 450,
    marginBottom: 14.4,
    width: '100%',
    alignSelf: 'center',
  },
  entryBubble: {
    backgroundColor: '#fcfcfcff',
    borderRadius: 9,
    padding: 9,
    marginBottom: 5.4,
    width: '95%',
    minHeight: 32.4,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  entryText: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Roboto',
    textAlign: 'left',
  },
  typingCardRow: {
    backgroundColor: '#fff',
    borderRadius: 13.5,
    paddingVertical: 12.6,
    paddingHorizontal: 14.4,
    minHeight: 81,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  typingPlaceholder: {
    color: '#868686',
    fontSize: 12.6,
    fontFamily: 'Roboto',
    fontWeight: '300',
    marginBottom: 18,
    marginLeft: 0,
    textAlign: 'left',
    width: '100%',
    minHeight: 27,
    padding: 0.9,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 5.4,
  },
  micButton: {
    width: 28.8,
    height: 28.8,
    backgroundColor: '#F2F2F2',
    borderRadius: 14.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5.4,
  },
  visualizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12.6,
    paddingVertical: 5.4,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: 31.5,
    backgroundColor: '#fff',
    marginHorizontal: 5.4,
  },
  visualizeText: {
    fontFamily: 'Outfit',
    fontSize: 12.6,
    color: '#B8B8B8',
    marginRight: 5.4,
  },
  visualizeCount: {
    backgroundColor: 'white',
    borderRadius: 6.3,
    paddingHorizontal: 5.4,
    paddingVertical: 2.7,
  },
  countText: {
    fontFamily: 'Inter',
    fontSize: 9.9,
    fontWeight: '600',
    color: '#B8B8B8',
  },
  sendButton: {
    width: 32.4,
    height: 32.4,
    backgroundColor: '#B8B8B8',
    borderRadius: 16.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5.4,
  },
  bottomNav: {
    backgroundColor: '#F6F6F6',
    paddingVertical: 28.8, // Increased from 22 for a taller bar
    paddingHorizontal: 45, // Increased from 27 for wider spacing
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 35,
    elevation: 5,
    marginBottom: 21.6, // Keeps the bar raised vabove the bottom
    borderTopLeftRadius: 21.6, // Optional: make corners more rounded
    borderTopRightRadius: 21.6,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 54,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5.4,
    marginLeft: 5.4,
  },
  iconSpacing: {
    marginLeft: 10.8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingVertical: 7.2,
  },
  pendingImageContainer: {
    width: '95%',
    height: 135,
    marginTop: 5.4,
    borderRadius: 14.4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pendingImageText: {
    color: '#6C5CE7',
    fontSize: 14.4,
    fontWeight: '600',
  },
  animatedImageContainer: {
    width: '95%',
    alignItems: 'center',
    marginTop: 5.4,
    alignSelf: 'center',
  },
  imageStyle: {
    width: '100%',
    height: 198,
    borderRadius: 14.4,
  },
  assessmentContainer: {
    width: '87%',
    alignSelf: 'center',
    marginTop: 16.2,
    marginBottom: 5.4,
  },
  assessmentText: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Roboto',
    marginBottom: 14.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 21.6,
    paddingVertical: 9,
    marginRight: 5.4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  skipButtonText: {
    color: '#6C5CE7',
    fontWeight: '600',
    fontSize: 12.6,
  },
  takeButton: {
    flex: 1.3,
    backgroundColor: '#6C5CE7',
    borderRadius: 21.6,
    paddingVertical: 9,
    marginLeft: 5.4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12.6,
  },
  selectedButtonStyle: {
    borderColor: '#6C5CE7',
    backgroundColor: '#f5f0ff',
  },
  selectedButtonTextStyle: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  selectedRatingTextStyle: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
  submitButtonStyle: {
    backgroundColor: '#6C5CE7',
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});
