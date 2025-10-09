import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';
import PrimaryButton from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Learnmore from './Learnmore';

const avatarTypes = [
  {
    id: 'happy',
    text: "Pick an image that captures your happiest self 😊",
    emoji: "😊"
  },
  {
    id: 'calm',
    text: "Pick an image that captures your calmest self 😌",
    emoji: "😌"
  },
  {
    id: 'reflective',
    text: "Pick an image that shows your most reflective self 😓",
    emoji: "😓"
  },
  {
    id: 'intense',
    text: "Pick an image that captures your most intense self 😠",
    emoji: "😠"
  }
];

const CreateAvatar1: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: string | null }>(
    { happy: null, calm: null, reflective: null, intense: null }
  );
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [currentAvatarType, _setCurrentAvatarType] = useState(0);

  const handleImageUpload = (_type: string) => {
    setShowLearnMore(true);
  };

  const handleLearnMoreDone = () => {
    // Add a sample image when Done is clicked
    const currentType = avatarTypes[currentAvatarType];
    const sampleImageUrl = 'https://media.istockphoto.com/id/1477871619/photo/portrait-of-happy-businesswoman-arms-crossed-looking-at-camera-on-white-background-stock-photo.jpg?s=612x612&w=0&k=20&c=vH666X9xpurnAfKaxvHE43O-b0WxmF4_VpOfALsg0PY=';

    setSelectedImages(prev => ({
      ...prev,
      [currentType.id]: sampleImageUrl
    }));

    // Close the modal
    setShowLearnMore(false);
  };

  // Check if at least one image is selected
  const isAnyImageSelected = Object.values(selectedImages).some((img) => !!img);

  const currentType = avatarTypes[currentAvatarType];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Add photos to create your avatar</Text>
          <Text style={styles.subtitle}>This improves your avatar’s expressiveness</Text>
          <TouchableOpacity onPress={() => setShowLearnMore(true)}>
            <Text style={styles.learnMore}>Learn more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarCardContainer}>
          <View style={styles.avatarCard}>
            <TouchableOpacity
              onPress={() => handleImageUpload(currentType.id)}
              style={styles.imageUploadButton}
              activeOpacity={0.7}
            >
              {selectedImages[currentType.id] ? (
                <Image source={{ uri: selectedImages[currentType.id] || undefined }} style={styles.avatarImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.dashedBorder} />
                  <View style={styles.plusCircle}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarText}>{currentType.text}</Text>
          </View>
        </View>
        <View style={styles.bottomButtons}>
          <PrimaryButton
            title="Continue"
            onPress={() => navigation.navigate('CreateAccount')}
            style={styles.continueButtonSpacing}
            disabled={!isAnyImageSelected}
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
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    marginBottom: 10,
    paddingLeft: 18,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Outfit'
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Outfit'
  },
  learnMore: {
    color: '#8170FF',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 2
  },
  avatarCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  plusCircle: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8170FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 116,
    height: 116,
    borderRadius: 14,
    resizeMode: 'cover'
  },
  avatarText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  bottomButtons: {
    paddingTop: 20,
    gap: 12,
  },
  continueButtonSpacing: {
    width: '100%',
  },
  defaultAvatarText: {
    color: '#8170FF',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CreateAvatar1;
