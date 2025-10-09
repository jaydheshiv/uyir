import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';

type RootStackParamList = {
  GrantedScreen: undefined;
  CreateAvatar1: undefined;
  // add other routes here if needed
};

const GrantedScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'GrantedScreen'>>();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CreateAvatar1');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flexGrow}>
        <View style={styles.illustrationWrapper}>
          <Image
            source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/6161ad6eb60dd794952493588dfa688018716b59?width=340' }}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.messageText}>
          Your account has been successfully verified. You're now ready to begin your journey with Uyir.
        </Text>
        <PrimaryButton
          title={isLoading ? 'Loading...' : 'Continue'}
          onPress={handleContinue}
          disabled={isLoading}
          style={styles.continueButton}
          textStyle={styles.continueButtonText}
        />
        <View style={[styles.bottomSpacer, { height: insets.bottom }]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
  },
  flexGrow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
  illustration: {
    width: 220,
    height: 220,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    marginBottom: 24,
  },
  messageText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
    marginBottom: 24,
    marginTop: 0,
    width: '100%',
  },
  continueButton: {
    width: '100%',
    maxWidth: 345,
    alignSelf: 'center',
    marginBottom: 8,
    height: 56,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 0, // Will be set dynamically with insets.bottom
  },
});

export default GrantedScreen;
