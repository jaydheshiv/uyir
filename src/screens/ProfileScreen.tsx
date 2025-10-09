// ProfileScreen.js
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProfileContext } from '../store/ProfileContext';
import { useTheme } from '../store/ThemeContext';
// Import this hook for perfect bottom spacing
import { useNavigation } from '@react-navigation/native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import CustomBottomNav from '../components/CustomBottomNav'; // Add this import at the top

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
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === 'dark';

  // Dynamic styles for dark mode
  const dynamicStyles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDarkTheme ? '#232336' : 'white', // slightly darker dark bg
    },
    menuSection: {
      backgroundColor: isDarkTheme ? '#2D2D44' : '#F2F2F2', // slightly darker card bg
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    menuItemLabel: {
      fontSize: 14,
      color: isDarkTheme ? '#F2F2F2' : 'black', // lighter text for contrast
    },
    userName: {
      color: isDarkTheme ? 'white' : '#222',
    },
    userInfo: {
      color: isDarkTheme ? 'white' : 'black',
    },
    subscriberCount: {
      color: isDarkTheme ? 'white' : '#222',
    },
    subscriberLabel: {
      color: isDarkTheme ? '#B8B8B8' : '#868686',
    },
    analyticsFooter: {
      color: isDarkTheme ? 'white' : '#222',
    },
    analyticsFooterRight: {
      color: isDarkTheme ? '#B8B8B8' : '#868686',
    },
    analyticsCard: {
      backgroundColor: isDarkTheme ? '#3A3A52' : '#fff',
      borderColor: isDarkTheme ? '#4A4A62' : '#EDEDED',
    },
    analyticsLabel: {
      color: isDarkTheme ? '#B8B8B8' : '#868686',
    },
    analyticsValue: {
      color: isDarkTheme ? 'white' : '#222',
    },
    destructiveText: {
      color: isDarkTheme ? '#FF6B6B' : '#C53F3F',
    },
  });

  // Dynamic colors for icons and elements
  const chevronColor = isDarkTheme ? '#F2F2F2' : '#1D1B20';
  const iconColor = isDarkTheme ? '#F2F2F2' : 'black';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { acceptedTerms } = useProfileContext();

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
    <View style={dynamicStyles.screen}>
      {(!acceptedTerms) && <CurvedHeaderBackground />}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          {acceptedTerms ? (
            <>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarContainer, styles.compactAvatar]}>
                  <Image
                    source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.profileInfoContainer}>
                  <Text style={[styles.userName, dynamicStyles.userName, styles.leftAlignedText]}>Sadhguru</Text>
                  <Text style={[styles.subscriberCount, dynamicStyles.subscriberCount, styles.leftAlignedText]}>0</Text>
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
            <>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/5937cf43b006e61aa7a9f8703a57c7d87d14019f?width=221' }}
                  style={styles.avatarImage}
                />
              </View>
              <Text style={[styles.userName, dynamicStyles.userName]}>Arya</Text>
              <Text style={[styles.userInfo, dynamicStyles.userInfo]}>arya0077@gmail.com | +91 1234567890</Text>
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
                          trackColor={{ false: '#D1D5DB', true: '#6C5CE7' }}
                          thumbColor={'#f4f3f4'}
                          ios_backgroundColor="#D1D5DB"
                          onValueChange={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                          value={isDarkTheme}
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
    paddingBottom: 100,
  },
  profileSection: {
    zIndex: 10,
    alignItems: 'center',
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 141,
    height: 141,
    borderRadius: 70.5,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  upgradeButtonContainer: {
    marginTop: 24,
    width: 335,
    backgroundColor: '#483D97',
    borderRadius: 8,
    height: 62,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  upgradeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    flex: 1,
  },
  // upgradeButtonLeft already defined above
  analyticsRowExact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    marginTop: 0,
    paddingHorizontal: 0,
  },
  analyticsCardExact: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 190,
    height: 80,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  analyticsLabelExact: {
    fontSize: 13,
    marginBottom: 2,
    fontWeight: '500',
  },
  analyticsValueExact: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  buttonRowExact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  micrositeBtnExact: {
    backgroundColor: '#8170FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    height: 45,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
    minWidth: 0,
  },
  micrositeBtnTextExact: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    textAlign: 'center',
  },
  upgradeButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  upgradeIconContainer: {
    width: 104,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIconText: {
    fontSize: 24,
  },
  upgradeText: {
    fontSize: 24,
    color: '#E8A23D',
    fontFamily: 'Outfit-SemiBold',
  },
  subscriberCount: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  subscriberLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    marginTop: 2,
    width: '100%',
    paddingHorizontal: 10,
  },
  analyticsCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    fontSize: 13,
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  analyticsFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 18,
    marginTop: 8,
  },
  analyticsFooter: {
    fontSize: 15,
    fontWeight: '700',
  },
  analyticsFooterRight: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  micrositeBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  micrositeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
  },
  settingsContainer: {
    paddingHorizontal: 28,
    zIndex: 10,
  },
  menuSectionsWrapper: {
    gap: 24,
  },
  menuSection: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  menuSectionInner: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemLabel: {
    fontSize: 14,
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
    marginBottom: 8,
    marginRight: -30,
  },
  compactAvatar: {
    width: 100,
    height: 100,
    borderRadius: 45,
    marginRight: 20,
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
    marginLeft: 10,
  },
  analyticsCardRightMargin: {
    marginRight: 10,
  },
  upgradeIconYellow: {
    backgroundColor: '#FDE047',
  },
  conditionalMinHeight: {
    minHeight: 142, // default, will be overridden conditionally
  },
  conditionalMinHeightShort: {
    minHeight: 112,
  },
  noMarginLeft: {
    marginLeft: 0,
  },
  bottomSpacing: {
    marginBottom: 25,
  },
});