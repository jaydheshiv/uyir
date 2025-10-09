import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Learnmore from './Learnmore';

const CreateAvatar3: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingDuration, _setRecordingDuration] = useState(35);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handleImageUpload = () => {
    // Show Learn More popup when plus button is clicked
    setShowLearnMore(true);
  };

  const handleLearnMoreDone = () => {
    // Add sample image when Done is clicked in Learn More popup
    const sampleImageUrl = 'https://media.istockphoto.com/id/1477871619/photo/portrait-of-happy-businesswoman-arms-crossed-looking-at-camera-on-white-background-stock-photo.jpg?s=612x612&w=0&k=20&c=vH666X9xpurnAfKaxvHE43O-b0WxmF4_VpOfALsg0PY=';
    setSelectedImage(sampleImageUrl);

    // Close the modal
    setShowLearnMore(false);
  };

  const handleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        setHasRecording(true);
      }, 2000);
    }
  };

  const isFormComplete = selectedImage; // Only require image to be selected

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Let us set up your pro account</Text>
          <Text style={styles.subtitle}>This improves your avatar's expressiveness</Text>
          <TouchableOpacity onPress={() => setShowLearnMore(true)}>
            <Text style={styles.learnMore}>Learn more</Text>
          </TouchableOpacity>
        </View>

        {/* Image Upload Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.imageUploadCard}>
            <View style={styles.cardContent}>
              <Text style={styles.cardText}>Pick an image that captures your happiest self 😊</Text>
              <TouchableOpacity
                onPress={handleImageUpload}
                style={styles.imageUploadButton}
                activeOpacity={0.7}
              >
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.dashedBorder} />
                  </View>
                )}
                <View style={styles.plusCircle}>
                  <Ionicons name="add" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Voice Recording Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.voiceRecordCard}>
            <Text style={styles.voiceTitle}>Add the sound of you to your twin</Text>

            {/* Recording Button */}
            <TouchableOpacity
              onPress={handleRecording}
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            <Text style={styles.recordInstruction}>
              {isRecording ? "Recording..." : "Tap the button to start Recording"}
            </Text>

            {/* Audio Waveform Display */}
            {hasRecording && (
              <View style={styles.audioContainer}>
                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={20} color="#8170FF" />
                </TouchableOpacity>
                <View style={styles.waveformContainer}>
                  <View style={styles.waveform}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveBar,
                          { height: Math.random() * 30 + 10 }
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.duration}>0:{recordingDuration}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomButtons}>
          <PrimaryButton
            title="Continue"
            onPress={() => navigation.navigate('Upload')}
            style={styles.continueButtonSpacing}
            disabled={!isFormComplete}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Upload')}>
            <Text style={styles.syncDataText}>
              Sync my data
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showLearnMore} animationType="slide" transparent>
        <Learnmore
          onClose={() => setShowLearnMore(false)}
          onDone={handleLearnMoreDone}
          nextScreen="Upload"
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: -10,
  },
  backButton: {
    marginBottom: 20,
    marginTop: 25,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingBottom: 24
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
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
  sectionContainer: {
    marginBottom: 24,
  },
  imageUploadCard: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#fff',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    marginRight: 20,
  },
  imageUploadButton: {
    width: 140,
    height: 100,
    position: 'relative',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8170FF',
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  plusCircle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
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
  voiceRecordCard: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  voiceTitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8170FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingActive: {
    backgroundColor: '#FF6B6B',
  },
  recordInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8E3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    marginRight: 12,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    justifyContent: 'space-between',
  },
  waveBar: {
    width: 3,
    backgroundColor: '#8170FF',
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bottomButtons: {
    marginTop: 'auto',
    paddingTop: 20,
    gap: 16,
  },
  continueButtonSpacing: {
    width: '100%',
  },
  syncDataText: {
    color: '#8170FF',
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CreateAvatar3;
