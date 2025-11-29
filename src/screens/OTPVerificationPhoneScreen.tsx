import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../components/BackButton';
import OTPInput from '../components/OTPInput';
import { useAuth } from '../store/useAppStore';

type RootStackParamList = {
  OTPVerificationPhoneScreen: { code: string; mobile?: string };
  GrantedScreen: undefined;
  BasicDetails: undefined;
  CreateAvatar1: undefined;
};

const OTPVerificationPhoneScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code, mobile } = (route.params || {}) as { code?: string; mobile?: string };

  // Initialize OTP properly - handle both pre-filled and empty states
  const initialOtp = code && code.length === 4 ? code : '';
  const [otp, setOtp] = useState<string>(initialOtp);
  const [isVerifying, setIsVerifying] = useState(false);

  console.log('📱 Phone OTP Screen loaded');
  console.log('📱 Route params - code:', code, 'mobile:', mobile);
  console.log('📱 Initial OTP state:', otp);

  // Use Zustand for auth
  const { setToken, setUser, isNewUser, user } = useAuth();

  // Wrapper to log OTP changes
  const handleOtpChange = (newOtp: string) => {
    console.log('🔢 OTP changed from', otp, 'to', newOtp, '(length:', newOtp.length, ')');
    setOtp(newOtp);
  };

  const handleResend = async () => {
    try {
      const body = { mobile };
      const resendEndpoint = '/auth/signup/resend';
      const backendUrl = `http://dev.api.uyir.ai${resendEndpoint}`;

      console.log('Resending OTP to:', backendUrl, body);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP resent successfully!');
      } else {
        Alert.alert('Error', typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please ensure your backend is running.'
      );
    }
  };

  const handleVerify = async () => {
    console.log('🔍 Verify button clicked!');
    console.log('🔍 Current OTP value:', otp);
    console.log('🔍 OTP length:', otp.length);

    // Trim and validate OTP
    const trimmedOtp = otp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 4) {
      console.log('❌ OTP validation failed - length:', trimmedOtp.length);
      Alert.alert('Incomplete OTP', `Please enter all 4 digits. Current: ${trimmedOtp.length}/4`);
      return;
    }

    // Prevent multiple submissions
    if (isVerifying) {
      console.log('⏳ Already verifying, ignoring click');
      return;
    }

    setIsVerifying(true);

    try {
      const body = { mobile, otp: trimmedOtp };
      const backendUrl = 'http://dev.api.uyir.ai/auth/verify-otp';

      console.log('🔗 Verifying OTP with:', backendUrl);
      console.log('🔗 Request body:', JSON.stringify(body, null, 2));

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('OTP verification response:', data);

      if (response.ok) {
        console.log('✅ === OTP VERIFICATION SUCCESS ===');
        console.log('✅ Response data:', JSON.stringify(data, null, 2));

        // Extract token from response
        const token = data.access_token || data.token;
        if (token) {
          console.log('🔐 Token found in response:', token.substring(0, 20) + '...');
          setToken(token);
        } else {
          console.error('❌ ERROR: No access_token in response!');
          Alert.alert('Authentication Error', 'Server did not provide authentication token. Please contact support.');
          setIsVerifying(false);
          return;
        }

        // Update user data from response
        if (data.user) {
          console.log('👤 Updating user data from response:', JSON.stringify(data.user, null, 2));

          const existingUserData = user || {};
          const updatedUserData = {
            ...existingUserData,
            ...data.user,
            is_verified: true,
          };

          console.log('👤 Final merged user data:', JSON.stringify(updatedUserData, null, 2));
          setUser(updatedUserData);

          // Check if user already has avatar
          const hasAvatar = updatedUserData.avatar_id || (updatedUserData.avatars && updatedUserData.avatars.length > 0);

          console.log('🎭 Checking avatar status...');
          console.log('🎭 avatar_id:', updatedUserData.avatar_id);
          console.log('🎭 avatars array:', updatedUserData.avatars);
          console.log('🎭 Has avatar?', hasAvatar);

          Alert.alert('Success', 'Phone number verified successfully!', [
            {
              text: 'OK',
              onPress: () => {
                if (hasAvatar) {
                  console.log('🏠 User has avatar - navigating to GrantedScreen');
                  navigation.navigate('GrantedScreen');
                } else {
                  console.log('📝 New user - navigating to BasicDetails');
                  navigation.navigate('BasicDetails');
                }
              },
            },
          ]);
        } else {
          console.error('❌ ERROR: No user data in response!');
          Alert.alert('Verification Error', 'Could not retrieve user information. Please try again.');
          setIsVerifying(false);
        }
      } else {
        console.error('❌ Verification failed:', data);
        const errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        Alert.alert('Verification Failed', errorMessage);
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Enter OTP</Text>
      <OTPInput value={otp} onChange={handleOtpChange} length={4} />
      <Text style={styles.helperText}>Enter the 4-Digit code we sent to your Mobile Number</Text>
      <View style={styles.spacer} />
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't get OTP? </Text>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
        onPress={handleVerify}
        disabled={isVerifying}
      >
        <Text style={styles.verifyButtonText}>{isVerifying ? 'Verifying...' : 'Verify'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 81,
  },
  backButton: {
    position: 'absolute',
    top: 36,
    left: 15.3,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 7.2,
  },
  title: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#000',
    marginBottom: 21.6,
    marginLeft: 0,
    marginTop: 0,
  },
  otpContainer: {
    alignSelf: 'flex-start',
    marginLeft: 0,
  },
  helperText: {
    color: '#A8A8A8',
    fontSize: 12.6,
    marginTop: 10.8,
    marginBottom: 0,
    marginLeft: 0,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  resendText: {
    color: '#000',
    fontSize: 12.6,
  },
  resendLink: {
    color: '#6C5CE7',
    fontSize: 12.6,
    textDecorationLine: 'underline',
    marginLeft: 1.8,
  },
  verifyButton: {
    height: 39.6,
    backgroundColor: '#8170FF',
    borderRadius: 19.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 40,
  },
  verifyButtonDisabled: {
    backgroundColor: '#B0A8FF',
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
});

export default OTPVerificationPhoneScreen;

