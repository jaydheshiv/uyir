import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../store/useAppStore';

type RootStackParamList = {
  GrantedScreen: undefined;
  CreateAvatar1: undefined;
  Avatarhome1: undefined;
  // add other routes here if needed
};

const GrantedScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'GrantedScreen'>>();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Get user status from Zustand
  const { isNewUser, user } = useAuth();

  const handleContinue = () => {
    setIsLoading(true);

    // ✅ Debug logging
    const newUserStatus = isNewUser();
    console.log('=== GRANTED SCREEN DEBUG ===');
    console.log('isNewUser():', newUserStatus);
    console.log('user:', JSON.stringify(user, null, 2));
    console.log('===========================');

    setTimeout(() => {
      setIsLoading(false);

      // ✅ Smart navigation based on user status
      if (newUserStatus) {
        console.log('🆕 New user from GrantedScreen - navigating to CreateAvatar1');
        navigation.navigate('CreateAvatar1');
      } else {
        console.log('👤 Returning user from GrantedScreen - navigating to Avatarhome1');
        navigation.navigate('Avatarhome1');
      }
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
    paddingHorizontal: 21.6,
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
    marginTop: 36,
  },
  illustration: {
    width: 198,
    height: 198,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    marginBottom: 21.6,
  },
  messageText: {
    color: '#000',
    fontSize: 16.2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
    marginBottom: 21.6,
    marginTop: 0,
    width: '100%',
  },
  continueButton: {
    width: '100%',
    maxWidth: 310.5,
    alignSelf: 'center',
    marginBottom: 7.2,
    height: 50.4,
  },
  continueButtonText: {
    fontSize: 16.2,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 0, // Will be set dynamically with insets.bottom
  },
});

export default GrantedScreen;

