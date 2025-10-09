import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Animated, Image, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import TopLeftProfileIcon from '../components/TopLeftProfileIcon';

// Define your navigation param list type
type RootStackParamList = {
  Visualizations: undefined;

  Connections: undefined;
  // add other routes here if needed
};

export default function AvatarHome1() {
  const [entryCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [entries, setEntries] = useState<string[]>([]);
  const [showImage, setShowImage] = useState(false);
  const [visualizedText, setVisualizedText] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState(false); // New state
  const [showAssessment, setShowAssessment] = useState(false); // New state
  const [imageOpacity] = useState(new Animated.Value(0)); // For fade-in effect
  const [assessmentOpacity] = useState(new Animated.Value(0)); // For assessment fade-in
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();

  const isActive = inputValue.trim().length > 0;

  const handleSend = () => {
    if (!isActive) return;
    setEntries([...entries, inputValue]);
    setInputValue('');
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    Keyboard.dismiss();
  };

  // Show text immediately, image after 2 seconds
  const handleVisualize = () => {
    if (!isActive) return;
    setVisualizedText(inputValue);
    setShowImage(false);
    setPendingImage(true);
    setShowAssessment(false);
    setInputValue('');
    imageOpacity.setValue(0); // Reset image opacity
    assessmentOpacity.setValue(0); // Reset assessment opacity
    setTimeout(() => {
      setShowImage(true);
      setPendingImage(false);
      // Fade in the image smoothly
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        setShowAssessment(true);
        Animated.timing(assessmentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 5000);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* Top Left Icon Only */}
      <View style={styles.topLeftIconContainer}>
        <TopLeftProfileIcon />
      </View>
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: "https://api.builder.io/api/v1/image/assets/TEMP/5937cf43b006e61aa7a9f8703a57c7d87d14019f?width=221" }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>Arya</Text>
            <Text style={styles.entryCount}>{entryCount + entries.length}</Text>
            <Text style={styles.entryLabel}>Total entries</Text>
          </View>
        </View>

        {/* Main Card (only title and typing bar) */}
        <View style={styles.mainCard}>
          {!showImage && !visualizedText && (
            <>
              <View style={styles.cardTitleWrapper}>
                <Text style={styles.cardTitle}>What's been on your mind today?</Text>
              </View>
              <View style={styles.iconRow}>
                <Ionicons name="volume-high" size={20} color="#8170FF" />
                <Ionicons name="thumbs-up" size={20} color="#8170FF" style={styles.iconSpacing} />
                <Ionicons name="thumbs-down" size={20} color="#8170FF" style={styles.iconSpacing} />
                <Ionicons name="refresh" size={20} color="#8170FF" style={styles.iconSpacing} />
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
                <View key={idx} style={styles.entryBubble}>
                  <Text style={styles.entryText}>{entry}</Text>
                </View>
              ))}
              {visualizedText && (
                <View style={styles.entryBubble}>
                  <Text style={styles.entryText}>{visualizedText}</Text>
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
                    <Image
                      source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/249f25e956f04c88d57fbcead36a93fad0b0999a?width=670' }}
                      style={styles.imageStyle}
                      resizeMode="cover"
                    />
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
                          onPress={() => navigation.navigate('Connections')}
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
          <View style={styles.typingCardRow}>
            <TextInput
              style={styles.typingPlaceholder}
              placeholder="Let your thoughts flow"
              placeholderTextColor="#868686"
              multiline
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.micButton}>
                <Ionicons name="mic" size={22} color="#8170FF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.visualizeButton,
                  isActive && styles.selectedButtonStyle
                ]}
                onPress={handleVisualize}
                activeOpacity={isActive ? 0.7 : 1}
                disabled={!isActive}
              >
                <Text style={[
                  styles.visualizeText,
                  isActive && styles.selectedButtonTextStyle
                ]}>
                  Visualize
                </Text>
                <View style={styles.visualizeCount}>
                  <Text style={[
                    styles.countText,
                    isActive && styles.selectedRatingTextStyle
                  ]}>🟡 1</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isActive && styles.submitButtonStyle
                ]}
                onPress={handleSend}
                activeOpacity={isActive ? 0.7 : 1}
                disabled={!isActive}
              >
                <Ionicons name="arrow-up" size={22} color="#8170FF" />
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
    paddingTop: 80,
    paddingLeft: 18,
    paddingBottom: 8,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  topLeftIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E7E4FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20, // Add this line or increase the value for more space
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E7E4FF',
  },
  profileName: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  entryCount: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  entryLabel: {
    fontFamily: 'Outfit',
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  mainCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 16.2,
    elevation: 5,
    minHeight: 570,
    width: '105%',
    alignSelf: 'center',
    flexDirection: 'column',      // Ensure column layout
  },
  cardTitleWrapper: {
    marginTop: 18,
    padding: 8,
  },
  cardTitle: {
    fontFamily: 'Outfit',
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  entriesScroll: {
    flex: 1,
    marginBottom: 40,
  },
  entriesScrollAboveCard: {
    maxHeight: 650, // Adjust as needed for your layout
    marginBottom: 20,
    width: '100%',
    alignSelf: 'center',
  },
  entryBubble: {
    backgroundColor: '#fcfcfcff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    width: '95%',
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'center', // Make bubble stretch to card width
  },
  entryText: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Roboto',
    textAlign: 'left', // Align text to the left
  },
  typingCardRow: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 110,
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
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: '300',
    marginBottom: 28,
    marginLeft: 0,
    textAlign: 'left',
    width: '100%',
    minHeight: 36,
    padding: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  micButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F2F2F2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  visualizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: 35,
    backgroundColor: '#fff',
    marginHorizontal: 8,
  },
  visualizeText: {
    fontFamily: 'Outfit',
    fontSize: 16,
    color: '#B8B8B8',
    marginRight: 8,
  },
  visualizeCount: {
    backgroundColor: 'white',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#B8B8B8',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#B8B8B8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bottomNav: {
    backgroundColor: '#F6F6F6',
    paddingVertical: 32, // Increased from 22 for a taller bar
    paddingHorizontal: 50, // Increased from 27 for wider spacing
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 35,
    elevation: 5,
    marginBottom: 24, // Keeps the bar raised vabove the bottom
    borderTopLeftRadius: 24, // Optional: make corners more rounded
    borderTopRightRadius: 24,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 8,
  },
  iconSpacing: {
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  pendingImageContainer: {
    width: '95%',
    height: 180,
    marginTop: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pendingImageText: {
    color: '#6C5CE7',
    fontSize: 18,
    fontWeight: '600',
  },
  animatedImageContainer: {
    width: '95%',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  imageStyle: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  assessmentContainer: {
    width: '87%',
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 8,
  },
  assessmentText: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Roboto',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 24,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  skipButtonText: {
    color: '#6C5CE7',
    fontWeight: '600',
    fontSize: 16,
  },
  takeButton: {
    flex: 1.3,
    backgroundColor: '#6C5CE7',
    borderRadius: 24,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    marginBottom: 25,
  },
});