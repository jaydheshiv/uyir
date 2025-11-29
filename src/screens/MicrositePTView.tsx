import { useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

import { StackNavigationProp } from '@react-navigation/stack';
import { applyPreset, getImagekitUrlFromSrc } from '../lib/imagekit'; // ✅ ImageKit transformations
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useAvatar, useProfessional } from '../store/useAppStore';

const MicrositePTView: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { token, user } = useAuth();
  const { professionalData } = useProfessional();
  const { avatar, setAvatarUrl } = useAvatar();
  const [professionalImageUrl, setProfessionalImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // ✅ Fetch professional profile image
  useEffect(() => {
    const fetchProfessionalImage = async () => {
      if (!token) return;

      try {
        setLoadingImage(true);
        const backendUrl = 'http://dev.api.uyir.ai:8081/professional/';
        console.log('🖼️ MicrositePTView: Fetching professional profile from:', backendUrl);

        const response = await fetch(backendUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🖼️ MicrositePTView: Professional profile response:', data);

          // API can return one of the following shapes:
          // 1) Dashboard (GET /professional/): { professional: { ... }, subscriber_count, ... }
          // 2) Direct profile (future/public shape): { profile_image_url, cover_image_url, ... }
          const prof = data && data.professional ? data.professional : data;

          // Extract profile and cover image URLs from the right object
          // ✅ Use original DigitalOcean URLs - ImageKit will handle them
          const profileImageUrl = prof?.profile_image_url || prof?.image_url || prof?.avatar_url || null;
          const coverImg = prof?.cover_image_url || null;

          if (profileImageUrl) {
            setProfessionalImageUrl(profileImageUrl);
            console.log('✅ MicrositePTView: Set professional profile image URL:', profileImageUrl);
          } else {
            console.log('ℹ️ MicrositePTView: No profile image URL found in response');
          }

          if (coverImg) {
            setCoverImageUrl(coverImg);
            console.log('✅ MicrositePTView: Set cover image URL:', coverImg);
          } else {
            console.log('ℹ️ MicrositePTView: No cover image URL found in response');
          }
        } else {
          console.log('⚠️ MicrositePTView: Failed to fetch professional profile:', response.status);
        }
      } catch (error) {
        console.error('❌ MicrositePTView: Error fetching professional profile:', error);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchProfessionalImage();
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    if (avatar?.avatarUrl && avatarImageUrl !== avatar.avatarUrl) {
      setAvatarImageUrl(avatar.avatarUrl);
    }

    if (avatar?.avatarUrl || !token || !user?.avatar_id || avatarImageUrl) {
      return () => {
        isMounted = false;
      };
    }

    const fetchAvatarImage = async () => {
      try {
        setLoadingAvatar(true);
        const backendUrl = `http://dev.api.uyir.ai:8081/api/avatar/${user.avatar_id}`;
        console.log('🖼️ MicrositePTView: Fetching avatar image from:', backendUrl);

        const response = await fetch(backendUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data?.photo_path || data?.avatar_url || data?.image_url || data?.url || null;

          if (imageUrl && isMounted) {
            console.log('✅ MicrositePTView: Retrieved avatar image URL:', imageUrl);
            setAvatarImageUrl(imageUrl);
            setAvatarUrl(imageUrl);
          } else {
            console.log('ℹ️ MicrositePTView: No avatar URL found in response');
          }
        } else {
          console.log('⚠️ MicrositePTView: Failed to fetch avatar image:', response.status);
        }
      } catch (error) {
        console.error('❌ MicrositePTView: Error fetching avatar image:', error);
      } finally {
        if (isMounted) {
          setLoadingAvatar(false);
        }
      }
    };

    fetchAvatarImage();

    return () => {
      isMounted = false;
    };
  }, [avatar?.avatarUrl, avatarImageUrl, token, user?.avatar_id, setAvatarUrl]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image with Back Arrow and Edit Icon */}
        <View style={styles.headerImageWrapper}>
          {coverImageUrl ? (
            <Image
              source={{
                uri: getImagekitUrlFromSrc(coverImageUrl, [
                  {
                    width: width, // Full screen width
                    height: 220,
                    cropMode: 'at_max',
                    quality: 85,
                    format: 'auto',
                  }
                ]) || undefined
              }}
              style={styles.headerImage}
              onError={(e) => {
                console.log('Failed to load cover image, using profile image', e?.nativeEvent);
                // Force fallback to profile image by clearing cover URL
                setCoverImageUrl(null);
              }}
            />
          ) : (professionalImageUrl || avatarImageUrl) ? (
            <Image
              source={{
                uri: getImagekitUrlFromSrc(professionalImageUrl || avatarImageUrl, [
                  {
                    width: width,
                    height: 220,
                    cropMode: 'at_max',
                    quality: 85,
                    format: 'auto',
                  }
                ]) || undefined
              }}
              style={styles.headerImage}
              onError={(e) => {
                console.log('Failed to load header image', e?.nativeEvent);
                if (professionalImageUrl) {
                  setProfessionalImageUrl(null);
                } else {
                  setAvatarImageUrl(null);
                  setAvatarUrl(null);
                }
              }}
            />
          ) : (
            loadingImage || loadingAvatar ? (
              <View style={[styles.headerImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' }]}>
                <ActivityIndicator size="large" color="#6C5CE7" />
              </View>
            ) : (
              <View style={[styles.headerImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="image-outline" size={60} color="#999" />
              </View>
            )
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Editing')}>
            <Edit color="#fff" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar Overlap with double border */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarOuterCircle}>
            <View style={styles.avatarInnerCircle}>
              {loadingImage || loadingAvatar ? (
                <ActivityIndicator size="small" color="#6C5CE7" />
              ) : (professionalImageUrl || avatarImageUrl) ? (
                <Image
                  source={{
                    uri: applyPreset(professionalImageUrl || avatarImageUrl, 'profileAvatar', 65) || undefined // 130px diameter / 2
                  }}
                  style={styles.avatarImg}
                  onError={(e) => {
                    console.log('Failed to load microsite avatar image', e?.nativeEvent);
                    if (professionalImageUrl) {
                      setProfessionalImageUrl(null);
                    } else {
                      setAvatarImageUrl(null);
                      setAvatarUrl(null);
                    }
                  }}
                />
              ) : (
                <View style={[styles.avatarImg, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="person" size={60} color="#999" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Name, Share Icon, Welcome Text */}
        <View style={styles.profileInfoWrapper}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>{professionalData?.display_name || 'Professional'}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={() => navigation.navigate('Invite')}>
              <Ionicons name="share-social-outline" size={20} color="#6C5CE7" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome to your personal space !</Text>
        </View>

        {/* Stats Grid - clickable cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statsCard, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.navigate('TotalSubscribers')}>
            <Ionicons name="person-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
            <Text style={[styles.statsValue, { color: theme.text }]}>{professionalData?.subscriber_count || 0}</Text>
            <Text style={[styles.statsLabel, { color: theme.text }]}>Total Subscribers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statsCard, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.navigate('TotalDonations')}>
            <Ionicons name="gift-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
            <Text style={[styles.statsValue, { color: theme.text }]}>$ 0</Text>
            <Text style={[styles.statsLabel, { color: theme.text }]}>Total Donations Received</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statsCard, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.navigate('UpComingSessions')}>
            <Ionicons name="calendar-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
            <Text style={[styles.statsValue, { color: theme.text }]}>{professionalData?.upcoming_session_count || 0}</Text>
            <Text style={[styles.statsLabel, { color: theme.text }]}>Upcoming Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statsCard, { backgroundColor: theme.cardBackground }]} onPress={() => { /* TODO: handle Profile Shares click */ }}>
            <Ionicons name="share-social-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
            <Text style={[styles.statsValue, { color: theme.text }]}>0</Text>
            <Text style={[styles.statsLabel, { color: theme.text }]}>Profile Shares</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation (use shared component) */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerImageWrapper: {
    width: '100%',
    height: 198,
    position: 'relative',
    backgroundColor: '#fff',
    marginTop: 0,
  },
  headerImage: {
    width: '100%',
    height: 198,
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 30,
    left: 12,
    zIndex: 2,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'transparent',
  },
  editBtn: {
    position: 'absolute',
    top: 30,
    right: 12,
    zIndex: 2,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'transparent',
  },
  avatarWrapper: {
    position: 'absolute',
    top: 145,
    left: 18,
    zIndex: 3,
  },
  avatarOuterCircle: {
    width: 117,
    height: 117,
    borderRadius: 58.5,
    borderWidth: 3,
    borderColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerCircle: {
    width: 109.8,
    height: 109.8,
    borderRadius: 54.9,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 104.4,
    height: 104.4,
    borderRadius: 52.2,
  },
  profileInfoWrapper: {
    marginTop: 67.5,
    marginLeft: 18,
    marginRight: 18,
    marginBottom: 10.8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2.7,
    gap: 0,
    justifyContent: 'flex-start',
  },
  nameText: {
    fontSize: 21.6,
    fontWeight: 'bold',
    marginRight: 4,
  },
  shareBtn: {
    padding: 4,
  },
  welcomeText: {
    fontSize: 14.4,
    marginTop: 1.8,
    marginBottom: 5.4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 5.4,
    marginBottom: 21.6,
  },
  statsCard: {
    width: width / 2 - 28,
    height: 140,
    borderRadius: 14.4,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    padding: 2.6,
    margin: 5.4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statsIcon: {
    marginBottom: 5.4,
  },
  statsValue: {
    fontSize: 21.6,
    fontWeight: 'bold',
    marginBottom: 1.8,
  },
  statsLabel: {
    fontSize: 12.6,
    textAlign: 'center',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 0,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

export default MicrositePTView;

