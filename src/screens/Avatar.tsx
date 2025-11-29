import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useAvatar } from '../store/useAppStore';

const Avatar: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [about, setAbout] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get avatarId, user_id, and token from Zustand
  const { token, user, setUser } = useAuth();
  const { avatar, setAvatarUrl, setAvatarName, syncAvatarFromUser } = useAvatar();

  // ✅ CRITICAL: Always use user.avatar_id as the source of truth
  // Never use stale avatar.avatarId from previous users
  const avatarId = user?.avatar_id; // Only from user object
  const userId = user?.user_id || user?.id;

  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);

  const backendUrl = 'http://dev.api.uyir.ai:8081';

  // Fetch existing avatar data
  useEffect(() => {
    // ✅ Sync avatar state with current user first
    syncAvatarFromUser();

    const fetchAvatarData = async () => {
      console.log('🔍 Avatar Debug:', {
        token: token ? 'Present' : 'Missing',
        avatarId,
        userId,
        user: JSON.stringify(user, null, 2)
      });

      if (!token) {
        Alert.alert('Error', 'Missing authentication token. Please login again.');
        setLoading(false);
        return;
      }

      // ✅ Check if user.avatar_id is null - user hasn't created an avatar yet
      if (user?.avatar_id === null || user?.avatar_id === undefined) {
        console.log('⚠️ User has no avatar_id in their profile. They need to create an avatar first.');
        Alert.alert(
          'No Avatar Found',
          'You haven\'t created an avatar yet. Please create one through the onboarding flow.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setLoading(false);
        return;
      }

      if (!avatarId) {
        Alert.alert('Error', 'Avatar ID not found. Please create an avatar first.');
        setLoading(false);
        return;
      }

      try {
        const url = `${backendUrl}/api/avatar/${avatarId}`;
        console.log('📡 Fetching avatar from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📥 Response status:', response.status);

        if (response.status === 403) {
          const errorData = await response.json();
          console.error('❌ 403 Forbidden:', errorData);
          Alert.alert(
            'Access Denied',
            'This avatar belongs to another user. Please create your own avatar through the onboarding flow.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log('📥 Fetched avatar data:', JSON.stringify(data, null, 2));

          // ✅ Log specific fields we're looking for
          console.log('🔍 Checking avatar fields:', {
            has_avatar_name: !!data.avatar_name,
            has_avatar_dob: !!data.avatar_dob,
            has_avatar_about_me: !!data.avatar_about_me,
            has_name: !!data.name,
            has_dob: !!data.dob,
            has_about: !!data.about,
            has_about_me: !!data.about_me,
          });

          console.log('🖼️ Avatar URL fields:', {
            avatar_url: data.avatar_url,
            image_url: data.image_url,
            avatar_image_url: data.avatar_image_url,
            url: data.url,
          });

          // Set the avatar image URL
          let imageUrl = data.avatar_url || data.image_url || data.avatar_image_url || data.url || null;

          // Check if URL needs to be fetched as signed URL
          if (imageUrl && imageUrl.includes('digitaloceanspaces.com')) {
            console.log('🔐 DigitalOcean Spaces URL detected, may need signed URL');
            // Try to fetch signed URL from backend
            try {
              const signedUrlResponse = await fetch(`${backendUrl}/api/avatar/${avatarId}/signed-url`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (signedUrlResponse.ok) {
                const signedData = await signedUrlResponse.json();
                if (signedData.signed_url || signedData.url) {
                  imageUrl = signedData.signed_url || signedData.url;
                  console.log('✅ Using signed URL:', imageUrl);
                }
              } else {
                console.log('⚠️ Signed URL endpoint not available, using original URL');
              }
            } catch (err) {
              console.log('⚠️ Could not fetch signed URL, using original URL');
            }
          }

          console.log('🎯 Final image URL:', imageUrl);
          setAvatarImageUrl(imageUrl);

          // Save avatar URL to Zustand for other screens to access
          setAvatarUrl(imageUrl);

          // ✅ Try to fetch profile data from personalize endpoint
          console.log('📡 Fetching profile data from personalize endpoint...');
          try {
            const profileUrl = `${backendUrl}/api/avatar/personalize/${avatarId}`;
            const profileResponse = await fetch(profileUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log('📥 Fetched profile data:', JSON.stringify(profileData, null, 2));

              const avatarName = profileData.avatar_name || user?.avatar_name || '';
              const avatarDob = profileData.avatar_dob || profileData.dob || '';
              const avatarAboutMe = profileData.avatar_about_me || profileData.about_me || '';

              console.log('📋 Profile fields from personalize endpoint:', {
                avatar_name: avatarName,
                avatar_dob: avatarDob,
                avatar_about_me: avatarAboutMe
              });

              setUsername(avatarName);
              setDob(avatarDob);
              setAbout(avatarAboutMe);

              if (avatarName) {
                setAvatarName(avatarName);
              }
            } else {
              // ✅ Fallback to user object if personalize endpoint fails
              console.log('⚠️ Personalize endpoint not available (status: ' + profileResponse.status + '), using user object');
              const avatarName = user?.avatar_name || '';
              const avatarDob = (user as any)?.avatar_dob || '';
              const avatarAboutMe = (user as any)?.avatar_about_me || '';

              setUsername(avatarName);
              setDob(avatarDob);
              setAbout(avatarAboutMe);

              if (avatarName) {
                setAvatarName(avatarName);
              }
            }
          } catch (err) {
            console.log('⚠️ Error fetching profile data, using user object:', err);
            const avatarName = user?.avatar_name || '';
            const avatarDob = (user as any)?.avatar_dob || '';
            const avatarAboutMe = (user as any)?.avatar_about_me || '';

            setUsername(avatarName);
            setDob(avatarDob);
            setAbout(avatarAboutMe);

            if (avatarName) {
              setAvatarName(avatarName);
            }
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to fetch avatar:', errorText);
          Alert.alert('Error', 'Failed to load avatar data');
        }
      } catch (err) {
        console.error('❌ Network error:', err);
        Alert.alert('Network error', 'Failed to load avatar data');
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarData();
  }, [token, avatarId, userId]);

  // Save text fields only
  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'Missing authentication token');
      return;
    }

    if (!avatarId) {
      Alert.alert('Error', 'Avatar ID not found');
      return;
    }

    setSaving(true);
    try {
      // ✅ Use the CORRECT endpoint for profile data: /api/avatar/personalize/{id}
      const url = `${backendUrl}/api/avatar/personalize/${avatarId}`;

      // Send as JSON instead of form data for better compatibility
      const bodyData = {
        avatar_name: username,
        avatar_dob: dob,
        avatar_about_me: about,
      };

      console.log('💾 Saving avatar profile data to personalize endpoint:', { username, dob, about, url });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Avatar profile updated successfully:', data);

        // ✅ CRITICAL: Update Zustand with ALL profile fields
        setAvatarName(username);

        // ✅ Update user object in Zustand so ProfileScreen shows new data
        if (user) {
          setUser({
            ...user,
            avatar_name: username,
            // Store DOB and About Me in user object for persistence
            avatar_dob: dob,
            avatar_about_me: about,
          });
          console.log('✅ Updated user profile in Zustand:', { username, dob, about });
        }

        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to ProfileScreen to trigger refresh
              navigation.goBack();
            }
          }
        ]);
      } else {
        const errorText = await response.text();
        console.error('❌ Profile update failed:', errorText);
        Alert.alert('Error', `Failed to update profile: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      Alert.alert('Network error', 'Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  // Delete avatar (dummy)
  const handleDelete = () => {
    Alert.alert('Delete Avatar', 'Avatar deleted (demo only).');
  };

  // Image upload logic (gallery)
  const handleUploadGallery = async () => {
    setModalVisible(false);

    if (!token) {
      Alert.alert('Error', 'Missing authentication token');
      return;
    }

    if (!avatarId) {
      Alert.alert('Error', 'Avatar ID not found');
      return;
    }

    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Image Picker Error', response.errorMessage || 'Failed to pick image');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        try {
          const url = `${backendUrl}/api/avatar/${avatarId}`;
          const formData = new FormData();
          formData.append('avatar_name', username);
          formData.append('file', {
            uri: asset.uri,
            name: asset.fileName || 'avatar.jpg',
            type: asset.type || 'image/jpeg',
          } as any);

          console.log('📤 Uploading image...');

          const res = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              // Do not set Content-Type for FormData - browser sets it automatically with boundary
            },
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            console.log('✅ Image uploaded:', data);

            // Update local avatar image immediately without waiting for save
            if (asset.uri) {
              setAvatarImageUrl(asset.uri);
              setAvatarUrl(asset.uri); // Save to Zustand
            }
            // Also update from response if available
            if (data.avatar_url || data.image_url) {
              const url = data.avatar_url || data.image_url;
              setAvatarImageUrl(url);
              setAvatarUrl(url); // Save to Zustand
            }

            Alert.alert('Success', 'Avatar image updated!');
          } else {
            const errorText = await res.text();
            console.error('❌ Image upload failed:', errorText);
            Alert.alert('Error', 'Failed to update image');
          }
        } catch (err) {
          console.error('❌ Network error:', err);
          Alert.alert('Network error', 'Please try again later.');
        }
      }
    });
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    setModalVisible(false);

    if (!token) {
      Alert.alert('Error', 'Missing authentication token');
      return;
    }

    if (!avatarId) {
      Alert.alert('Error', 'Avatar ID not found');
      return;
    }

    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage || 'Failed to take photo');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];

        try {
          const url = `${backendUrl}/api/avatar/${avatarId}`;
          const formData = new FormData();
          formData.append('avatar_name', username);
          formData.append('file', {
            uri: asset.uri,
            name: asset.fileName || 'avatar.jpg',
            type: asset.type || 'image/jpeg',
          } as any);

          console.log('📸 Uploading photo...');

          const res = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            console.log('✅ Photo uploaded:', data);

            // Update local avatar image immediately without waiting for save
            if (asset.uri) {
              setAvatarImageUrl(asset.uri);
              setAvatarUrl(asset.uri); // Save to Zustand
            }
            if (data.avatar_url || data.image_url) {
              const url = data.avatar_url || data.image_url;
              setAvatarImageUrl(url);
              setAvatarUrl(url); // Save to Zustand
            }

            Alert.alert('Success', 'Avatar photo updated!');
          } else {
            const errorText = await res.text();
            console.error('❌ Photo upload failed:', errorText);
            Alert.alert('Error', 'Failed to update photo');
          }
        } catch (err) {
          console.error('❌ Network error:', err);
          Alert.alert('Network error', 'Please try again later.');
        }
      }
    });
  };

  // Delete photo (dummy)
  const handleDeletePhoto = () => {
    setModalVisible(false);
    Alert.alert('Delete Photo', 'Photo deleted (demo only).');
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8170FF" />
          <Text style={styles.loadingText}>Loading avatar data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Avatar</Text>

          {/* Avatar with edit badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {avatarImageUrl ? (
                <Image
                  source={{ uri: avatarImageUrl }}
                  style={styles.avatarImg}
                  onError={() => {
                    // Silently fallback to placeholder on error (403 from DigitalOcean Spaces)
                    setAvatarImageUrl(null);
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully');
                  }}
                />
              ) : (
                <View style={[styles.avatarImg, styles.placeholderContainer]}>
                  <Ionicons name="person" size={50} color="#8170FF" />
                  <Text style={styles.placeholderText}>Upload Avatar</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editBadge} onPress={() => setModalVisible(true)}>
                <View style={styles.editCircleVisible}>
                  <Ionicons name="create-outline" size={25} color="#7B66FF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, styles.inputText]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#A9A9A9"
              editable={!saving}
            />

            <Text style={styles.label}>DoB</Text>
            <TextInput
              style={[styles.input, styles.inputText]}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A9A9A9"
              editable={!saving}
            />

            <Text style={styles.label}>About me</Text>
            <TextInput
              style={[styles.input, styles.textArea, styles.inputText]}
              value={about}
              onChangeText={setAbout}
              placeholder="Write about yourself..............."
              placeholderTextColor="#A9A9A9"
              multiline
              numberOfLines={5}
              editable={!saving}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>

          {/* Delete Avatar */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
            <Text style={styles.deleteText}>Delete Avatar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <TouchableOpacity style={styles.modalBtn} onPress={handleTakePhoto}>
              <Text style={styles.modalBtnText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleUploadGallery}>
              <Text style={styles.modalBtnText}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleDeletePhoto}>
              <Text style={styles.modalBtnText}>Delete Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 21.6,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 14.4,
    fontSize: 14.4,
    color: '#8170FF',
    fontWeight: '500',
  },
  backBtn: {
    marginBottom: 0,
    marginTop: -10,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 25.2,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 21.6,
    marginTop: 14.4,
    fontFamily: 'Outfit-Bold',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 7.2,
    marginBottom: 16.2,
  },
  avatarContainer: {
    position: 'relative',
    width: 99,
    height: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 99,
    height: 99,
    borderRadius: 49.5,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    backgroundColor: '#F0EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8170FF',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 7.2,
    fontSize: 10.8,
    color: '#8170FF',
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    right: 3.6,
    bottom: 3.6,
  },
  editCircleVisible: {
    width: 34.2,
    height: 34.2,
    borderRadius: 17.1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B66FF',
    shadowOffset: { width: 0, height: 2.7 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#7B66FF',
  },
  formSection: {
    marginTop: 7.2,
    marginBottom: 16.2,
  },
  label: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#8170FF',
    marginBottom: 5.4,
    fontFamily: 'Outfit-Bold',
  },
  input: {
    width: '100%',
    minHeight: 50.4,
    borderRadius: 10.8,
    borderWidth: 1.5,
    borderColor: '#222',
    paddingHorizontal: 12.6,
    fontSize: 14.4,
    backgroundColor: '#fff',
    color: '#222',
    marginBottom: 16.2,
    fontFamily: 'Outfit-Regular',
  },
  inputText: {
    fontSize: 14.4,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  textArea: {
    minHeight: 90,
    paddingVertical: 14.4,
    textAlignVertical: 'top',
    marginBottom: 9,
  },
  saveBtn: {
    width: '100%',
    height: 57.6,
    backgroundColor: '#8170FF',
    borderRadius: 21.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    shadowColor: '#8170FF',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#B8B0FF',
    opacity: 0.7,
  },
  saveText: {
    color: '#fff',
    fontSize: 16.2,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  deleteBtn: {
    alignItems: 'center',
    marginTop: 7.2,
    marginBottom: 16.2,
  },
  deleteText: {
    color: '#D74E4E',
    fontSize: 16.2,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  modalOverlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalContentBottom: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16.2,
    borderTopRightRadius: 16.2,
    alignItems: 'center',
    paddingVertical: 28.8,
    paddingHorizontal: 16.2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalBtn: {
    width: '95%',
    height: 43.2,
    borderRadius: 21.6,
    borderWidth: 1,
    borderColor: '#8170FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10.8,
    backgroundColor: '#fff',
  },
  modalBtnText: {
    color: '#222',
    fontSize: 16.2,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  cancelBtn: {
    marginTop: 7.2,
  },
  cancelBtnText: {
    color: '#8170FF',
    fontSize: 14.4,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    textDecorationLine: 'underline',
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

export default Avatar;

