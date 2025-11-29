import { useNavigation } from '@react-navigation/native';
import { Edit, UploadCloud } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { applyPreset, getImagekitUrlFromSrc } from '../lib/imagekit';
import { useAppStore, useAuth } from '../store/useAppStore';

export default function ProfileSettings() {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const [formData, setFormData] = useState({
    creatorName: '',
    greetings: '',
    aboutMe: ''
  });
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const [uploadedProfileUrl, setUploadedProfileUrl] = useState<string | null>(null);

  // ✅ Fetch existing professional profile data on mount
  React.useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const backendUrl = 'http://dev.api.uyir.ai:8081/professional/';
        console.log('📥 Fetching professional profile from:', backendUrl);

        const response = await fetch(backendUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Professional profile data:', data);

          // Extract data from dashboard response
          const prof = data.professional || data;

          // Populate form with existing data
          setFormData({
            creatorName: prof.display_name || '',
            greetings: prof.greeting || '',
            aboutMe: prof.about || prof.about_me || ''
          });

          // Set image URLs
          if (prof.cover_image_url) {
            setUploadedCoverUrl(prof.cover_image_url);
            setCoverImage(prof.cover_image_url);
          }
          if (prof.profile_image_url) {
            setUploadedProfileUrl(prof.profile_image_url);
            setProfileImage(prof.profile_image_url);
          }

          console.log('✅ Loaded profile data:', {
            name: prof.display_name,
            greeting: prof.greeting,
            about: prof.about || prof.about_me,
            coverUrl: prof.cover_image_url,
            profileUrl: prof.profile_image_url
          });
        } else {
          console.log('⚠️ Failed to fetch profile:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverPhotoUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log('User cancelled cover photo picker');
        return;
      }

      if (result.errorCode) {
        console.error('ImagePicker Error:', result.errorMessage);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setCoverImage(asset.uri || null);

        // Upload to backend
        await uploadCoverImageToBackend(asset);
      }
    } catch (error) {
      console.error('Error picking cover image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadCoverImageToBackend = async (asset: any) => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated. Please login again.');
      return;
    }

    setIsUploadingCover(true);
    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/cover-image';

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'cover-photo.jpg',
      } as any);

      console.log('=== UPLOADING PROFESSIONAL COVER IMAGE ===');
      console.log('URL:', backendUrl);
      console.log('File:', asset.fileName);
      console.log('Type:', asset.type);
      console.log('File size:', asset.fileSize, 'bytes');
      console.log('URI:', asset.uri);
      console.log('Network test: Attempting connection...');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Note: Don't set Content-Type for FormData - let browser/RN set it with boundary
        },
        body: formData,
      }).catch(err => {
        console.error('❌ Network connection failed:', err);
        console.error('❌ Error type:', err.constructor.name);
        console.error('❌ Error message:', err.message);
        throw new Error('Cannot connect to server. Please check:\n1. Internet connection\n2. Backend server is running\n3. File size not too large\n4. Emulator network is working');
      });

      const data = await response.json();
      console.log('Cover upload response:', data);
      console.log('📋 Response keys:', Object.keys(data));
      console.log('📋 Full response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ Professional cover image uploaded successfully');
        // DigitalOcean Spaces URL will be in the response
        const imageUrl = data.image_url || data.url || data.cover_image_url || data.cover_url;
        console.log('📸 Uploaded cover image URL:', imageUrl);

        if (imageUrl) {
          setUploadedCoverUrl(imageUrl);
          setCoverImage(imageUrl); // ✅ Also set coverImage to display immediately
          Alert.alert('Success', 'Cover photo uploaded successfully!');
        } else {
          console.error('❌ No image URL found in response');
          Alert.alert('Warning', 'Image uploaded but URL not found in response');
        }
      } else {
        console.error('Cover upload failed:', data);
        Alert.alert('Upload Failed', data.detail || 'Failed to upload cover image. Please try again.');
        setCoverImage(null); // Clear failed selection
      }
    } catch (error) {
      console.error('Error uploading cover image:', error);
      Alert.alert('Network Error', 'Could not connect to server. Please try again.');
      setCoverImage(null); // Clear failed selection
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleProfilePictureUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log('User cancelled profile photo picker');
        return;
      }

      if (result.errorCode) {
        console.error('ImagePicker Error:', result.errorMessage);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setProfileImage(asset.uri || null);

        // Upload to backend
        await uploadProfileImageToBackend(asset);
      }
    } catch (error) {
      console.error('Error picking profile image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImageToBackend = async (asset: any) => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated. Please login again.');
      return;
    }

    setIsUploadingProfile(true);
    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/profile-image';

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile-photo.jpg',
      } as any);

      console.log('=== UPLOADING PROFESSIONAL PROFILE IMAGE ===');
      console.log('URL:', backendUrl);
      console.log('File:', asset.fileName);
      console.log('Type:', asset.type);
      console.log('File size:', asset.fileSize, 'bytes');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Note: Don't set Content-Type for FormData
        },
        body: formData,
      }).catch(err => {
        console.error('❌ Network connection failed:', err);
        console.error('❌ Error details:', err.message);
        throw new Error('Cannot connect to server. Please check your internet connection.');
      });

      const data = await response.json();
      console.log('Profile upload response:', data);
      console.log('📋 Response keys:', Object.keys(data));
      console.log('📋 Full response data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        console.log('✅ Professional profile image uploaded successfully');
        const imageUrl = data.image_url || data.url || data.profile_image_url || data.profile_url;
        console.log('📸 Uploaded profile image URL:', imageUrl);

        if (imageUrl) {
          setUploadedProfileUrl(imageUrl);
          setProfileImage(imageUrl); // ✅ Also set profileImage to display immediately
          Alert.alert('Success', 'Profile picture uploaded successfully!');
        } else {
          console.error('❌ No image URL found in response');
          Alert.alert('Warning', 'Image uploaded but URL not found in response');
        }
      } else {
        console.error('Profile upload failed:', data);
        Alert.alert('Upload Failed', data.detail || 'Failed to upload profile image. Please try again.');
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Network Error', 'Could not connect to server. Please try again.');
      setProfileImage(null);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated. Please login again.');
      return;
    }

    setIsSaving(true);
    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/profile';

      const payload = {
        display_name: formData.creatorName,
        greeting: formData.greetings,
        about_me: formData.aboutMe,
      };

      console.log('=== SAVING PROFESSIONAL PROFILE ===');
      console.log('URL:', backendUrl);
      console.log('Payload:', payload);

      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Save profile response:', data);

      if (response.ok) {
        console.log('✅ Professional profile saved successfully');
        Alert.alert('Success', 'Profile settings saved successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        console.error('Save profile failed:', data);
        Alert.alert('Save Failed', data.detail || 'Failed to save profile settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Network Error', 'Could not connect to server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Dark Theme Toggle */}
      <View style={styles.darkThemeToggleContainer}>
        <View style={styles.darkThemeToggleContent}>
          <Ionicons name="moon" size={20} color="#6C5CE7" />
          <Text style={styles.darkThemeToggleLabel}>Dark Theme</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#E0E0E0', true: '#6C5CE7' }}
          thumbColor="#fff"
          style={styles.darkThemeSwitch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Media Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Media</Text>
          <View style={styles.coverPhotoContainer}>
            <Text style={styles.inputLabel}>Cover Photo</Text>
            <TouchableOpacity
              style={styles.coverPhotoBox}
              onPress={handleCoverPhotoUpload}
              disabled={isUploadingCover}
              activeOpacity={0.7}
            >
              {isUploadingCover ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="large" color="#6C5CE7" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              ) : (
                <>
                  {coverImage || uploadedCoverUrl ? (
                    <Image
                      source={{
                        uri: getImagekitUrlFromSrc(
                          coverImage || uploadedCoverUrl || undefined,
                          [
                            {
                              width: 800, // Wide enough for most screens
                              height: 360, // Maintains aspect ratio with 180px display height
                              cropMode: 'at_max',
                              quality: 85,
                              format: 'auto', // Auto WebP/AVIF conversion
                            }
                          ]
                        ) || undefined
                      }}
                      style={styles.coverPhotoImage}
                      onError={() => {
                        console.log('Failed to load cover image');
                        setCoverImage(null);
                        setUploadedCoverUrl(null);
                      }}
                    />
                  ) : (
                    <View style={[styles.coverPhotoImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="image-outline" size={50} color="#999" />
                    </View>
                  )}
                  <View style={styles.coverPhotoOverlay}>
                    <UploadCloud color="black" size={40} style={styles.uploadIcon} />
                    <Text style={styles.uploadText}>Click or drag to upload</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
            {uploadedCoverUrl && !isUploadingCover && (
              <Text style={styles.successText}>✓ Cover photo uploaded successfully</Text>
            )}
          </View>
          <View style={styles.profilePicRow}>
            {profileImage || uploadedProfileUrl ? (
              <Image
                source={{
                  uri: applyPreset(
                    profileImage || uploadedProfileUrl || undefined,
                    'profileAvatar',
                    60 // Display size (will be 120px for retina)
                  ) || undefined
                }}
                style={styles.profilePicture}
                onError={() => {
                  console.log('Failed to load profile picture');
                  setProfileImage(null);
                  setUploadedProfileUrl(null);
                }}
              />
            ) : (
              <View style={[styles.profilePicture, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={50} color="#999" />
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleProfilePictureUpload}
              disabled={isUploadingProfile}
            >
              {isUploadingProfile ? (
                <>
                  <ActivityIndicator size="small" color="#6C5CE7" />
                  <Text style={styles.uploadButtonText}>Uploading...</Text>
                </>
              ) : (
                <>
                  <UploadCloud color="#777777BB" size={20} />
                  <Text style={styles.uploadButtonText}>Upload New Picture</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          {uploadedProfileUrl && !isUploadingProfile && (
            <Text style={styles.successText}>✓ Profile picture uploaded successfully</Text>
          )}
        </View>

        {/* Creator Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Creator Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Creator Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.creatorName}
              onChangeText={(value) => handleInputChange('creatorName', value)}
              placeholder="Enter creator name"
              placeholderTextColor="#777777BB"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Greetings</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.greetings}
              onChangeText={(value) => handleInputChange('greetings', value)}
              placeholder="Enter greeting message"
              placeholderTextColor="#777777BB"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* About Me Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.aboutMe}
            onChangeText={(value) => handleInputChange('aboutMe', value)}
            placeholder="..............................."
            placeholderTextColor="#777777BB"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 18,
    paddingBottom: -30,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  darkThemeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginVertical: 9,
    borderRadius: 10.8,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  darkThemeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkThemeToggleLabel: {
    fontSize: 14.4,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Outfit-Medium',
  },
  darkThemeSwitch: {
    marginLeft: 10,
  },
  backBtn: {
    padding: 7.2,
    borderRadius: 18,
    marginBottom: 72,
    marginLeft: -10,
  },
  editIcon: {
    padding: 7.2,
    borderRadius: 18,
    marginBottom: 70,
    marginLeft: 36,
  },
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -30,
    marginTop: -10,
    fontFamily: 'Outfit',
    marginBottom: -10,
  },
  headerWrapper: {
    paddingBottom: 9,
    backgroundColor: '#F7F7F7',
  },
  headerButton: {
    padding: 5.4,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 90,
    paddingTop: -10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14.4,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Outfit-Bold',
    marginBottom: 10.8,
  },
  coverPhotoContainer: {
    marginBottom: 12.6,
  },
  inputLabel: {
    fontSize: 12.6,
    color: 'black',
    fontFamily: 'Outfit-Bold',
    marginBottom: 5.4,
    marginLeft: 2.7,
  },
  coverPhotoBox: {
    width: '100%',
    height: 162,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 10.8,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
    position: 'relative',
    marginBottom: 9,
  },
  coverPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    opacity: 0.7,
  },
  uploadText: {
    fontSize: 12.6,
    color: 'black',
    opacity: 0.8,
    marginTop: 5.4,
    fontFamily: 'Outfit-Regular',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
  },
  uploadingText: {
    fontSize: 12.6,
    color: '#6C5CE7',
    marginTop: 9,
    fontFamily: 'Outfit-Regular',
  },
  successText: {
    fontSize: 11.7,
    color: '#4CAF50',
    marginTop: 5.4,
    marginLeft: 2.7,
    fontWeight: '600',
    fontFamily: 'Outfit-Medium',
  },
  profilePicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5.4,
  },
  profilePicture: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E0E0E0',
    marginRight: 10.8,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#D1C9F7',
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 10.8,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  uploadButtonText: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    marginLeft: 5.4,
  },
  inputGroup: {
    marginBottom: 10.8,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 12.6,
    paddingVertical: 10.8,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 10.8,
    backgroundColor: '#fff',
    fontSize: 13.5,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10.8,
  },
  saveButton: {
    marginTop: 9,
    width: '100%',
    height: 45,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22.5,
    marginBottom: 18,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#B8B0FF',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});
