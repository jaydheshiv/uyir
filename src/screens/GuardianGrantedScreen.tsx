import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define your stack param list with the correct route names
type RootStackParamList = {
  WelcomeBackScreen: undefined;
  // add other screens if needed
};

const GuardianGrantedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to WelcomeBackScreen after loading
      navigation.navigate('WelcomeBackScreen');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/6161ad6eb60dd794952493588dfa688018716b59?width=340' }}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Thanks! Your guardian has approved. You can now create your avatar and continue your journey.
        </Text>
      </View>
      <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} disabled={isLoading}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
            <Text style={styles.ctaButtonText}>Loading...</Text>
          </View>
        ) : (
          <Text style={styles.ctaButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: 170,
    height: 201,
  },
  messageContainer: {
    marginBottom: 48,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  messageText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 345,
    height: 56,
    backgroundColor: '#8170FF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
});

export default GuardianGrantedScreen;
