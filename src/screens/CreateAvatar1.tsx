import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Asset, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useAvatar } from '../store/useAppStore';
import Learnmore from './Learnmore';

const CreateAvatar1: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Use Zustand for auth and avatar state
  const { token, setUser, user } = useAuth();
  const { avatar, setAvatarImage, setAvatarImageId, setAvatarId, setAvatarUrl } = useAvatar();

  // 🔍 Debug: Log token state on component mount
  React.useEffect(() => {
    console.log('🔍 === CreateAvatar1 MOUNT DEBUG ===');
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Token length:', token?.length || 0);
    console.log('🔍 Token preview:', token ? token.substring(0, 30) + '...' : 'NULL');
    console.log('🔍 User object:', JSON.stringify(user, null, 2));
    console.log('🔍 User ID:', user?.user_id);
    console.log('🔍 =====================================');

    if (!token) {
      console.error('❌ WARNING: No token found when CreateAvatar1 mounted!');
      console.error('❌ User will get 401 error when trying to upload');
      console.error('❌ This means OTP verification did not save the token properly');
    }
  }, [token, user]);  // Single avatar type
  const avatarType = 'profile';

  const uploadImageToServer = async (imageAsset: Asset, avatarType: string) => {
    try {
      setIsUploading(true);

      // ✅ Get token from Zustand store
      console.log('🔐 Token check - exists:', !!token);
      console.log('🔐 Token value (first 30 chars):', token ? token.substring(0, 30) + '...' : 'NULL');

      if (!token) {
        console.error('❌ No token found in Zustand store!');
        Alert.alert('Authentication Error', 'Please login again. Token not found.');
        navigation.navigate('LoginFlow');
        return false;
      }

      const formData = new FormData();

      // Append the image file
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageAsset.uri : imageAsset.uri?.replace('file://', ''),
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || `avatar_${avatarType}_${Date.now()}.jpg`,
      } as any);

      const backendUrl = 'http://dev.api.uyir.ai:8081/api/avatar/upload';

      console.log('📤 === UPLOAD REQUEST START ===');
      console.log('📤 Uploading to:', backendUrl);
      console.log('📤 Token (first 30 chars):', token.substring(0, 30) + '...');
      console.log('📤 Token length:', token.length);
      console.log('📤 Authorization header will be:', `Bearer ${token.substring(0, 20)}...`);
      console.log('📤 Image details:', {
        uri: imageAsset.uri,
        type: imageAsset.type,
        name: imageAsset.fileName
      });
      console.log('📤 === REQUEST HEADERS ===');

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type for multipart/form-data
          // React Native will set it automatically with boundary
        },
        body: formData,
      });

      console.log('📥 === UPLOAD RESPONSE ===');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response status text:', response.statusText);
      console.log('📥 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      console.log('📥 === END RESPONSE ===');

      // Check if response is ok first
      if (response.ok) {
        // Try to parse JSON, but handle empty responses
        let data = null;
        const contentType = response.headers.get('content-type');

        try {
          if (contentType && contentType.includes('application/json')) {
            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (responseText) {
              data = JSON.parse(responseText);
              console.log('Response data:', data);
            }
          } else {
            console.log('Response is not JSON, content-type:', contentType);
          }
        } catch (parseError) {
          console.log('Could not parse JSON response:', parseError);
        }

        // ✅ Store the uploaded image ID to Zustand
        if (data) {
          console.log('📦 Backend response data:', JSON.stringify(data, null, 2));

          const imageId = data.image_id || data.id || data.avatar_id;
          console.log('🆔 Extracted imageId:', imageId);

          if (imageId) {
            setAvatarImageId(avatarType, imageId);
            console.log('✅ Set avatar image ID to Zustand:', avatarType, imageId);
          }

          // Store the avatar_id (main ID for personalization)
          const backendAvatarId = data.avatar_id || data.user_avatar_id || data.id;
          console.log('🎯 Extracted backendAvatarId:', backendAvatarId);
          console.log('🎯 Current avatar.avatarId in store:', avatar.avatarId);

          if (backendAvatarId) {
            console.log('✅ Setting avatar_id to Zustand:', backendAvatarId);
            setAvatarId(backendAvatarId);

            // ✅ Also update user object with avatar_id
            setUser({ avatar_id: backendAvatarId });
            console.log('✅ Updated user object with avatar_id');
          }

          // ✅ Store avatar image URL if available
          const avatarUrl = data.avatar_url || data.image_url || data.url;
          if (avatarUrl) {
            console.log('✅ Setting avatar URL to Zustand:', avatarUrl);
            setAvatarUrl(avatarUrl);
          }
        }

        console.log('Image uploaded successfully!');
        Alert.alert(
          'Success!',
          'Your avatar has been uploaded successfully! You can now continue to create your account.',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        // Try to get error details
        let errorMessage = 'Failed to upload image';
        let responseBody = '';

        try {
          const errorData = await response.json();
          console.log('❌ Error data:', errorData);
          responseBody = JSON.stringify(errorData, null, 2);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          console.log('Could not parse error response');
        }

        // Special handling for 401 Unauthorized
        if (response.status === 401) {
          console.error('❌ 401 UNAUTHORIZED ERROR');
          console.error('❌ This means the token is invalid, expired, or missing');
          console.error('❌ Token used (first 30 chars):', token?.substring(0, 30) + '...');

          Alert.alert(
            'Authentication Error',
            'Your session has expired or the token is invalid.\n\n' +
            'This can happen if:\n' +
            '1. The backend token has expired\n' +
            '2. The token wasn\'t saved properly after signup\n' +
            '3. Backend token validation is failing\n\n' +
            'Please try logging out and logging in again.',
            [
              { text: 'Go to Login', onPress: () => navigation.navigate('LoginFlow') }
            ]
          );
          return false;
        }

        Alert.alert('Upload Error', `${errorMessage} (Status: ${response.status})\n\n${responseBody}`);
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);

      // More specific error message
      let errorMsg = 'An unexpected error occurred during upload.';
      if (error instanceof Error) {
        errorMsg = error.message;

        // Check for specific error types
        if (error.message.includes('Network request failed')) {
          errorMsg = 'Could not connect to server. Please check if the backend is running.';
        }
      }

      Alert.alert(
        'Upload Error',
        errorMsg + '\n\nPlease ensure the backend server is running on port 8000.'
      );
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (type: string) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          // ✅ Set local preview to Zustand store
          if (asset.uri) {
            setAvatarImage(type, asset.uri);
          }

          // Upload to server
          const uploadSuccess = await uploadImageToServer(asset, type);

          if (!uploadSuccess) {
            // Remove local preview if upload failed
            setAvatarImage(type, '');
          }
        }
      }
    );
  };

  const handleLearnMoreDone = () => {
    setShowLearnMore(false);
  };

  // Check if at least one image is selected AND uploaded successfully
  const isAnyImageSelected = Object.values(avatar.selectedImages).some((img) => !!img);
  const hasUploadedImage = !!avatar.avatarId || Object.values(avatar.uploadedImageIds).some((id) => !!id);

  // ✅ FIX: Allow continue if user has existing avatar_id (from previous upload)
  // OR if they just selected and uploaded a new image
  const canContinue = hasUploadedImage && !isUploading;

  // 🔍 Debug: Log button state
  React.useEffect(() => {
    console.log('🔘 === CONTINUE BUTTON STATE DEBUG ===');
    console.log('🔘 isAnyImageSelected:', isAnyImageSelected);
    console.log('🔘 hasUploadedImage:', hasUploadedImage);
    console.log('🔘 isUploading:', isUploading);
    console.log('🔘 canContinue:', canContinue);
    console.log('🔘 avatar.avatarId:', avatar.avatarId);
    console.log('🔘 avatar.uploadedImageIds:', JSON.stringify(avatar.uploadedImageIds));
    console.log('🔘 avatar.selectedImages:', JSON.stringify(Object.keys(avatar.selectedImages)));
    console.log('🔘 selectedImages values:', Object.values(avatar.selectedImages).map(v => v ? 'HAS_VALUE' : 'NULL'));
    console.log('🔘 uploadedImageIds values:', Object.values(avatar.uploadedImageIds).map(v => v ? 'HAS_VALUE' : 'NULL'));
    console.log('🔘 =====================================');
  }, [isAnyImageSelected, hasUploadedImage, isUploading, canContinue, avatar.avatarId, avatar.uploadedImageIds, avatar.selectedImages]);

  const handleContinue = () => {
    // Validate that we have avatar_id before proceeding
    if (!avatar.avatarId) {
      Alert.alert(
        'Upload Required',
        'Please upload at least one avatar image before continuing.'
      );
      return;
    }

    // Avatar ID is already in Zustand, no need to pass as param
    const uploadedData = {
      imageIds: avatar.uploadedImageIds,
      selectedTypes: Object.keys(avatar.uploadedImageIds).filter(key => avatar.uploadedImageIds[key]),
      avatarId: avatar.avatarId,
    };

    console.log('✅ Proceeding to CreateAccount with data:', uploadedData);

    // Show confirmation before proceeding
    Alert.alert(
      'Ready to Continue!',
      'Your avatar has been created successfully. Proceed to account setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => navigation.navigate('CreateAccount') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Add a photo to create your avatar</Text>
          <Text style={styles.subtitle}>Upload one image that captures your happiest self</Text>
          <TouchableOpacity onPress={() => setShowLearnMore(true)}>
            <Text style={styles.learnMore}>Learn more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarCardContainer}>
          <View style={styles.avatarCard}>
            <TouchableOpacity
              onPress={() => handleImageUpload(avatarType)}
              style={styles.imageUploadButton}
              activeOpacity={0.7}
              disabled={isUploading || hasUploadedImage}
            >
              {avatar.selectedImages[avatarType] ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: avatar.selectedImages[avatarType] || undefined }} style={styles.avatarImage} />
                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#8170FF" />
                    </View>
                  )}
                  {hasUploadedImage && !isUploading && (
                    <View style={styles.uploadedBadge}>
                      <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.dashedBorder} />
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#8170FF" />
                  ) : (
                    <View style={styles.plusCircle}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
            {!hasUploadedImage ? (
              <Text style={styles.avatarText}>Pick an image that captures your happiest self 😊</Text>
            ) : (
              <Text style={styles.avatarTextSuccess}>✓ Avatar uploaded successfully! You can now continue.</Text>
            )}
          </View>
        </View>
        <View style={styles.bottomButtons}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButtonSpacing}
            disabled={!canContinue}
          />
          <TouchableOpacity onPress={() => navigation.navigate('DefaultAvatar')}>
            <Text style={styles.defaultAvatarText}>
              Use default avatar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal visible={showLearnMore} animationType="slide" transparent>
        <Learnmore
          onClose={() => setShowLearnMore(false)}
          onDone={handleLearnMoreDone}
          nextScreen="CreateAccount"
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 27
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 45,
    marginBottom: 9,
    paddingLeft: 12.6,
  },
  headerContainer: {
    marginTop: 10.8,
    marginBottom: 21.6,
  },
  title: {
    fontSize: 16.2,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5.4,
    fontFamily: 'Outfit'
  },
  subtitle: {
    fontSize: 12.6,
    color: '#000',
    marginBottom: 2.7,
    fontFamily: 'Outfit'
  },
  learnMore: {
    color: '#8170FF',
    fontSize: 11.7,
    textDecorationLine: 'underline',
    marginTop: 1.8
  },
  avatarCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14.4,
  },
  avatarCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 25.2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 216,
  },
  imageUploadButton: {
    width: 90,
    height: 90,
    borderRadius: 12.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14.4,
    backgroundColor: 'transparent',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dashedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8170FF',
    borderRadius: 12.6,
    backgroundColor: '#F5F5F5',
  },
  plusCircle: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 25.2,
    height: 25.2,
    borderRadius: 12.6,
    backgroundColor: '#8170FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.8 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 86.4,
    height: 86.4,
    borderRadius: 10.8,
    resizeMode: 'cover'
  },
  imageContainer: {
    width: 86.4,
    height: 86.4,
    borderRadius: 10.8,
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12.6,
    color: '#000',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 216,
  },
  avatarTextSuccess: {
    fontSize: 12.6,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 216,
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12.6,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.8 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomButtons: {
    paddingTop: 14.4,
    gap: 9,
  },
  continueButtonSpacing: {
    width: '100%',
  },
  defaultAvatarText: {
    color: '#8170FF',
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CreateAvatar1;

