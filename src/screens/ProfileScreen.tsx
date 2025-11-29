// ProfileScreen.js
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Bell,
  ChevronRight,
  FileText,
  Languages,
  Lock,
  MessageSquareQuote,
  Moon,
  Projector,
  User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav'; // Add this import at the top
import { applyPreset } from '../lib/imagekit'; // ✅ ImageKit transformations
import { useAppStore, useAuth, useAvatar, useProfessional } from '../store/useAppStore'; // ✅ Use Zustand instead
import { useTheme } from '../theme/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const CurvedHeaderBackground = () => (
  <View style={styles.curvedHeaderContainer}>
    <Svg height="220" width={screenWidth} viewBox={`0 0 ${screenWidth} 220`}>
      <Path
        d={`M 0 0 L ${screenWidth} 0 L ${screenWidth} 150 Q ${screenWidth / 2} 220 0 150 Z`}
        fill="#6C5CE7"
      />
    </Svg>
  </View>
);

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const { user, token, logout } = useAuth();
  const { hasAcceptedProTerms, professionalData } = useProfessional();
  const { avatar, syncAvatarFromUser, setAvatarUrl } = useAvatar();
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [professionalImageUrl, setProfessionalImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // ✅ Force re-render when user data changes
  const [displayName, setDisplayName] = useState(user?.avatar_name || user?.email?.split('@')[0] || 'User');

  // ✅ Update display name whenever user changes
  useEffect(() => {
    const newName = user?.avatar_name || user?.email?.split('@')[0] || 'User';
    setDisplayName(newName);
    console.log('👤 ProfileScreen: Updated display name to:', newName);
  }, [user?.avatar_name, user?.email]);

  // ✅ Fetch user avatar image (from CreateAvatar1)
  const fetchUserAvatarImage = useCallback(async () => {
    if (!user?.avatar_id || !token) {
      console.log('👤 No avatar_id or token, skipping avatar image fetch');
      return;
    }

    try {
      setLoadingImage(true);
      const backendUrl = `http://dev.api.uyir.ai:8081/api/avatar/${user.avatar_id}`;
      console.log('👤 Fetching user avatar image from:', backendUrl);

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👤 Avatar image response:', data);
        console.log('👤 Avatar image response keys:', Object.keys(data));

        // Extract image URL from photo_path field
        const imageUrl = data.photo_path || data.avatar_url || data.image_url || data.url;
        console.log('👤 Extracted image URL:', imageUrl);

        if (imageUrl) {
          setAvatarImageUrl(imageUrl);
          setAvatarUrl(imageUrl); // ✅ Save to Zustand for persistence
          console.log('✅ Set avatar image URL:', imageUrl);
        } else {
          console.log('⚠️ No image URL found in response. Available fields:', Object.keys(data));
        }
      } else {
        console.log('⚠️ Failed to fetch avatar image:', response.status);
        const errorText = await response.text();
        console.log('⚠️ Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching avatar image:', error);
    } finally {
      setLoadingImage(false);
    }
  }, [setAvatarUrl, token, user?.avatar_id]);

  // ✅ Fetch professional profile image (from CreateAvatar3)
  const fetchProfessionalImage = useCallback(async () => {
    if (!hasAcceptedProTerms || !token) {
      console.log('👤 Not a professional or no token, skipping professional image fetch');
      return;
    }

    try {
      setLoadingImage(true);
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/';
      console.log('👤 Fetching professional profile from:', backendUrl);

      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👤 Professional profile response:', data);

        // ✅ Extract data from nested professional object
        const prof = data.professional || data;

        // Extract image URLs from response
        const profileImageUrl = prof.profile_image_url || prof.image_url || prof.avatar_url;
        const coverImg = prof.cover_image_url;

        if (profileImageUrl) {
          setProfessionalImageUrl(profileImageUrl);
          console.log('✅ Set professional profile image URL:', profileImageUrl);
        }

        if (coverImg) {
          setCoverImageUrl(coverImg);
          console.log('✅ Set professional cover image URL:', coverImg);
        }
      } else {
        console.log('⚠️ Failed to fetch professional profile:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching professional profile:', error);
    } finally {
      setLoadingImage(false);
    }
  }, [hasAcceptedProTerms, token]);

  // ✅ Fetch images on mount
  useEffect(() => {
    if (hasAcceptedProTerms) {
      fetchProfessionalImage();
    } else {
      fetchUserAvatarImage();
    }
  }, [hasAcceptedProTerms, fetchProfessionalImage, fetchUserAvatarImage]);

  useEffect(() => {
    if (avatar?.avatarUrl && avatarImageUrl !== avatar.avatarUrl) {
      setAvatarImageUrl(avatar.avatarUrl);
      return;
    }

    if (hasAcceptedProTerms && !avatarImageUrl && user?.avatar_id && token) {
      fetchUserAvatarImage();
    }
  }, [avatar?.avatarUrl, avatarImageUrl, fetchUserAvatarImage, hasAcceptedProTerms, token, user?.avatar_id]);

  // ✅ Sync avatar data when screen loads
  useEffect(() => {
    syncAvatarFromUser();
    console.log('👤 ProfileScreen: Synced avatar from user');
  }, []);

  // ✅ Refresh data when screen comes into focus (after returning from Avatar screen)
  useFocusEffect(
    React.useCallback(() => {
      syncAvatarFromUser();
      const newName = user?.avatar_name || user?.email?.split('@')[0] || 'User';
      setDisplayName(newName);

      // Refresh images
      if (hasAcceptedProTerms) {
        fetchProfessionalImage();
      } else {
        fetchUserAvatarImage();
      }

      console.log('👤 ProfileScreen: Refreshed avatar data on focus');
      console.log('👤 Current user data:', JSON.stringify(user, null, 2));
    }, [fetchProfessionalImage, fetchUserAvatarImage, hasAcceptedProTerms, syncAvatarFromUser, user])
  );

  const dynamicStyles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    menuSection: {
      backgroundColor: theme.cardBackground,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0.9 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    menuItemLabel: {
      fontSize: 12.6,
      color: theme.text,
    },
    userName: {
      color: theme.text,
    },
    userInfo: {
      color: theme.text,
    },
    subscriberCount: {
      color: theme.text,
    },
    subscriberLabel: {
      color: theme.textSecondary,
    },
    analyticsFooter: {
      color: theme.text,
    },
    analyticsFooterRight: {
      color: theme.textSecondary,
    },
    analyticsCard: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
    },
    analyticsLabel: {
      color: theme.textSecondary,
    },
    analyticsValue: {
      color: theme.text,
    },
    destructiveText: {
      color: theme.error,
    },
  });

  // Dynamic colors for icons and elements
  const chevronColor = theme.text;
  const iconColor = theme.text;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const hasAvatar = !!user?.avatar_id;

  const menuItems = [
    [
      { icon: <User size={20} color={iconColor} />, label: 'Edit profile information' },
      { icon: <User size={20} color={iconColor} />, label: 'Avatar' },
      { icon: <Lock size={20} color={iconColor} />, label: 'Change Password' },
    ],
    [
      { icon: <Languages size={20} color={iconColor} />, label: 'Language' },
      { icon: <Moon size={20} color={iconColor} />, label: 'Dark theme', hasToggle: true },
      { icon: <Projector size={20} color={iconColor} />, label: 'Support' },
    ],
    [
      { icon: <MessageSquareQuote size={20} color={iconColor} />, label: 'Feedback' },
      { icon: <FileText size={20} color={iconColor} />, label: 'Privacy Policy' },
      { icon: <Bell size={20} color={iconColor} />, label: 'About' },
    ],
    [
      { icon: null, label: 'Profile Status' },
      { icon: null, label: 'Delete Account', isDestructive: true },
      { icon: null, label: 'Logout' },
    ]
  ];

  return (
    <View style={[dynamicStyles.screen, { backgroundColor: theme.background }]}>
      {(!user?.avatar_id) && <CurvedHeaderBackground />}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 10, backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          {hasAcceptedProTerms ? (
            // Professional view (microsite buttons, analytics, etc.)
            <>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarContainer, styles.compactAvatar]}>
                  {professionalImageUrl ? (
                    <Image
                      source={{
                        uri: applyPreset(professionalImageUrl, 'profileAvatar', 55) || undefined
                      }}
                      style={styles.avatarImage}
                      onError={() => {
                        console.log('Failed to load professional image');
                        setProfessionalImageUrl(null);
                      }}
                    />
                  ) : avatarImageUrl ? (
                    <Image
                      source={{
                        uri: applyPreset(avatarImageUrl, 'profileAvatar', 55) || undefined
                      }}
                      style={styles.avatarImage}
                      onError={() => {
                        console.log('Failed to load avatar image');
                        setAvatarImageUrl(null);
                      }}
                    />
                  ) : avatar?.avatarUrl ? (
                    <Image
                      source={{
                        uri: applyPreset(avatar.avatarUrl, 'profileAvatar', 55) || undefined
                      }}
                      style={styles.avatarImage}
                      onError={() => console.log('Failed to load avatar image')}
                    />
                  ) : (
                    <View style={[styles.avatarImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="person" size={55} color="#999" />
                    </View>
                  )}
                </View>
                <View style={styles.profileInfoContainer}>
                  <Text style={[styles.userName, dynamicStyles.userName, styles.leftAlignedText]}>{professionalData?.display_name || displayName}</Text>
                  <Text style={[styles.userInfo, dynamicStyles.userInfo, styles.leftAlignedText, { marginTop: 4, marginBottom: 8 }]}>{user?.email || ''}</Text>
                  <Text style={[styles.subscriberCount, dynamicStyles.subscriberCount, styles.leftAlignedText]}>{professionalData?.subscriber_count || 0}</Text>
                  <Text style={[styles.subscriberLabel, dynamicStyles.subscriberLabel, styles.leftAlignedText]}>Total subscribers</Text>
                </View>
              </View>
              <View style={styles.analyticsFooterRow}>
                <Text style={[styles.analyticsFooter, dynamicStyles.analyticsFooter]}>Avatar analytics</Text>
                <Text style={[styles.analyticsFooterRight, dynamicStyles.analyticsFooterRight]}>Last 28 days</Text>
              </View>
              <View style={styles.analyticsRowExact}>
                <View style={[styles.analyticsCardExact, dynamicStyles.analyticsCard, styles.analyticsCardWithMargin]}>
                  <Text style={[styles.analyticsLabelExact, dynamicStyles.analyticsLabel]}>Views</Text>
                  <Text style={[styles.analyticsValueExact, dynamicStyles.analyticsValue]}>0</Text>
                </View>
                <View style={[styles.analyticsCardExact, dynamicStyles.analyticsCard, styles.analyticsCardRightMargin]}>
                  <Text style={[styles.analyticsLabelExact, dynamicStyles.analyticsLabel]}>Engagement time (hours)</Text>
                  <Text style={[styles.analyticsValueExact, dynamicStyles.analyticsValue]}>0</Text>
                </View>
              </View>
              <View style={styles.buttonRowExact}>
                <TouchableOpacity
                  style={styles.micrositeBtnExact}
                  onPress={() => navigation.navigate('MicrositePTView')}
                >
                  <Text style={styles.micrositeBtnTextExact}>View my microsite</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.micrositeBtnExact} onPress={() => navigation.navigate('PublicMicrositePTView')}>
                  <Text style={styles.micrositeBtnTextExact}>View public microsite</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Basic view (upgrade button, basic info)
            <>
              <View style={styles.avatarContainer}>
                {(() => {
                  console.log('🖼️ Avatar render check:', {
                    avatarImageUrl,
                    'avatar?.avatarUrl': avatar?.avatarUrl,
                    'avatar object': avatar
                  });

                  if (avatarImageUrl) {
                    console.log('✅ Using avatarImageUrl:', avatarImageUrl);
                    return (
                      <Image
                        source={{
                          uri: applyPreset(avatarImageUrl, 'profileAvatar', 85) || undefined
                        }}
                        style={styles.avatarImage}
                        onError={(error) => {
                          console.log('❌ Failed to load avatar image from avatarImageUrl:', error.nativeEvent.error);
                          setAvatarImageUrl(null);
                        }}
                        onLoad={() => console.log('✅ Avatar image loaded successfully from avatarImageUrl')}
                      />
                    );
                  } else if (avatar?.avatarUrl) {
                    console.log('✅ Using avatar.avatarUrl:', avatar.avatarUrl);
                    return (
                      <Image
                        source={{
                          uri: applyPreset(avatar.avatarUrl, 'profileAvatar', 85) || undefined
                        }}
                        style={styles.avatarImage}
                        onError={(error) => {
                          console.log('❌ Failed to load avatar image from avatar.avatarUrl:', error.nativeEvent.error);
                        }}
                        onLoad={() => console.log('✅ Avatar image loaded successfully from avatar.avatarUrl')}
                      />
                    );
                  } else {
                    console.log('⚠️ No avatar URL available, showing placeholder');
                    return (
                      <View style={[styles.avatarImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={85} color="#999" />
                      </View>
                    );
                  }
                })()}
              </View>
              <Text style={[styles.userName, dynamicStyles.userName]}>{displayName}</Text>
              <Text style={[styles.userInfo, dynamicStyles.userInfo, { marginTop: 4 }]}>{user?.email || ''}</Text>
              {user?.mobile && <Text style={[styles.userInfo, dynamicStyles.userInfo, { marginTop: 2 }]}>{user?.mobile || ''}</Text>}
              <TouchableOpacity
                style={styles.upgradeButtonContainer}
                onPress={() => navigation.navigate('SeePlans')}
              >
                <View style={styles.upgradeButtonContent}>
                  <View style={styles.upgradeButtonLeft}>
                    <View style={[styles.upgradeIconContainer, styles.upgradeIconYellow]}>
                      <Text style={styles.upgradeIconText}>⚡</Text>
                    </View>
                    <Text style={styles.upgradeText}>Upgrade</Text>
                  </View>
                  <ChevronRight size={28} color="#F5BD4F" strokeWidth={4} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.settingsContainer}>
          <View style={styles.menuSectionsWrapper}>
            {menuItems.map((section, sectionIndex) => (
              <View
                key={sectionIndex}
                style={[
                  dynamicStyles.menuSection,
                  sectionIndex === 3 ? styles.conditionalMinHeightShort : styles.conditionalMinHeight
                ]}
              >
                <View style={styles.menuSectionInner}>
                  {section.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      style={styles.menuItem}
                      onPress={() => {
                        if (item.label === 'Profile Status') {
                          navigation.navigate('ProfileStatus');
                        } else if (item.label === 'Edit profile information') {
                          navigation.navigate('EditProfile');
                        } else if (item.label === 'Avatar') {
                          // ✅ Check if user has an avatar before navigating
                          if (!user?.avatar_id) {
                            Alert.alert(
                              'No Avatar',
                              'You haven\'t created an avatar yet. Please complete the onboarding flow to create one.',
                              [{ text: 'OK' }]
                            );
                            return;
                          }
                          navigation.navigate('Avatar');
                        } else if (item.label === 'Change Password') {
                          navigation.navigate('PasswordChange');
                        } else if (item.label === 'Language') {
                          navigation.navigate('Language');
                        } else if (item.label === 'Feedback') {
                          navigation.navigate('FeedbackPage');
                        } else if (item.label === 'Privacy Policy') {
                          navigation.navigate('PrivacyPolicy');
                        } else if (item.label === 'About') {
                          navigation.navigate('About');
                        } else if (item.label === 'Delete Account') {
                          navigation.navigate('DeleteAccount');
                        } else if (item.label === 'Support') {
                          navigation.navigate('SupportPage');
                        } else if (item.label === 'Logout') {
                          // ✅ Handle logout: clear Zustand state and navigate to Onboarding
                          Alert.alert(
                            'Logout',
                            'Are you sure you want to logout?',
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel'
                              },
                              {
                                text: 'Logout',
                                style: 'destructive',
                                onPress: () => {
                                  console.log('🚪 User logging out...');
                                  logout();
                                  navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'OnboardingScreen1' }],
                                  });
                                }
                              }
                            ]
                          );
                        }
                      }}
                    >
                      <View style={styles.menuItemLeft}>
                        {item.icon && <View>{item.icon}</View>}
                        <Text
                          style={[
                            dynamicStyles.menuItemLabel,
                            'isDestructive' in item && dynamicStyles.destructiveText,
                            !item.icon && styles.noMarginLeft
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      {'hasToggle' in item && item.hasToggle ? (
                        <Switch
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor={theme.cardBackground}
                          ios_backgroundColor={theme.border}
                          onValueChange={toggleDarkMode}
                          value={isDarkMode}
                          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                        />
                      ) : (
                        <ChevronRight size={24} color={chevronColor} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomSpacing}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  curvedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    // Remove width restriction if present
  },
  scrollContainer: {
    paddingBottom: 90,
  },
  profileSection: {
    zIndex: 10,
    alignItems: 'center',
    paddingBottom: 21.6,
  },
  avatarContainer: {
    width: 153,
    height: 153,
    borderRadius: 76.5,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 14.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 76.5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 1.8,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 12.6,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    marginBottom: 3.6,
  },
  upgradeButtonContainer: {
    marginTop: 21.6,
    width: 301.5,
    backgroundColor: '#483D97',
    borderRadius: 7.2,
    height: 55.8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3.6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  upgradeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14.4,
    flex: 1,
  },
  // upgradeButtonLeft already defined above
  analyticsRowExact: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5.4,
    marginTop: 0,
    paddingHorizontal: 0,
    gap: 14.4,
  },
  analyticsCardExact: {
    borderRadius: 9,
    paddingVertical: 12.6,
    paddingHorizontal: 12.6,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 153,
    height: 61.2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  analyticsLabelExact: {
    fontSize: 10.8,
    marginBottom: 1.8,
    fontWeight: '500',
  },
  analyticsValueExact: {
    fontSize: 14.4,
    fontWeight: '700',
    marginTop: 1.8,
  },
  buttonRowExact: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '95%',
    marginTop: 5.4,
    marginBottom: 5.4,
    paddingHorizontal: 0,
    gap: 1,
  },
  micrositeBtnExact: {
    backgroundColor: '#8170FF',
    borderRadius: 7.2,
    paddingVertical: 9,
    paddingHorizontal: 0,
    height: 36,
    flex: 1,
    marginHorizontal: 7.2,
    alignItems: 'center',
    minWidth: 0,
  },
  micrositeBtnTextExact: {
    color: '#fff',
    fontSize: 12.6,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    textAlign: 'center',
  },
  upgradeButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14.4,
  },
  upgradeIconContainer: {
    width: 93.6,
    height: 43.2,
    borderRadius: 7.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIconText: {
    fontSize: 21.6,
  },
  upgradeText: {
    fontSize: 21.6,
    color: '#E8A23D',
    fontFamily: 'Outfit-SemiBold',
  },
  subscriberCount: {
    fontSize: 16.2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 1.8,
  },
  subscriberLabel: {
    fontSize: 11.7,
    textAlign: 'center',
    marginBottom: 12.6,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1.8,
    marginTop: 1.8,
    width: '100%',
    paddingHorizontal: 9,
  },
  analyticsCard: {
    borderRadius: 10.8,
    paddingVertical: 14.4,
    paddingHorizontal: 21.6,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  analyticsLabel: {
    fontSize: 11.7,
    marginBottom: 3.6,
  },
  analyticsValue: {
    fontSize: 16.2,
    fontWeight: '700',
  },
  analyticsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 7.2,
    marginBottom: 12.6,
    marginTop: 5.4,
  },
  analyticsFooter: {
    fontSize: 12.6,
    fontWeight: '700',
  },
  analyticsFooterRight: {
    fontSize: 10.8,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 9,
    marginBottom: 16.2,
  },
  micrositeBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 7.2,
    paddingVertical: 10.8,
    paddingHorizontal: 9,
    flex: 1,
    marginHorizontal: 3.6,
    alignItems: 'center',
  },
  micrositeBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
  },
  settingsContainer: {
    paddingHorizontal: 25.2,
    zIndex: 10,
  },
  menuSectionsWrapper: {
    gap: 21.6,
  },
  menuSection: {
    borderRadius: 7.2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.9 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  menuSectionInner: {
    paddingHorizontal: 21.6,
    paddingVertical: 14.4,
    gap: 21.6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 16.2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14.4,
  },
  menuItemLabel: {
    fontSize: 12.6,
    fontFamily: 'Outfit-Regular',
  },
  destructiveText: {
    // This is now handled by dynamicStyles
  },
  // New styles for inline style cleanup
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5.4,
    marginRight: -24,
  },
  compactAvatar: {
    width: 99,
    height: 99,
    borderRadius: 49.5,
    marginRight: 14.4,
    marginBottom: 0,
  },
  profileInfoContainer: {
    alignItems: 'flex-start',
  },
  leftAlignedText: {
    textAlign: 'left',
    marginBottom: 0,
  },
  analyticsCardWithMargin: {
    marginLeft: 7.2,
  },
  analyticsCardRightMargin: {
    marginRight: 7.2,
  },
  upgradeIconYellow: {
    backgroundColor: '#FDE047',
  },
  conditionalMinHeight: {
    minHeight: 127.8, // default, will be overridden conditionally
  },
  conditionalMinHeightShort: {
    minHeight: 100.8,
  },
  noMarginLeft: {
    marginLeft: 0,
  },
  bottomSpacing: {
    marginBottom: 31.5,
  },
});
