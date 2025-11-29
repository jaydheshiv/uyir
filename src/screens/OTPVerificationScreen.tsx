import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OTPInput from '../components/OTPInput';
import { useAuth } from '../store/useAppStore';

type RootStackParamList = {
  OTPVerificationScreen: { code: string };
  GrantedScreen: undefined;
  BasicDetails: undefined;
  CreateAvatar1: undefined;
};

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code, email, mobile } = (route.params || {}) as { code?: string; email?: string; mobile?: string };

  // ✅ Initialize OTP properly - handle both pre-filled and empty states
  const initialOtp = code && code.length === 4 ? code : '';
  const [otp, setOtp] = useState<string>(initialOtp);
  const [isVerifying, setIsVerifying] = useState(false);

  console.log('📱 OTP Screen loaded');
  console.log('📱 Route params - code:', code, 'email:', email, 'mobile:', mobile);
  console.log('📱 Initial OTP state:', otp);
  console.log('📱 OTP length:', otp.length);

  // ✅ Use Zustand for auth
  const { setToken, setUser, isNewUser, user } = useAuth();

  // Wrapper to log OTP changes
  const handleOtpChange = (newOtp: string) => {
    console.log('🔢 OTP changed from', otp, 'to', newOtp, '(length:', newOtp.length, ')');
    setOtp(newOtp);
  };

  const handleResend = async () => {
    try {
      const body = email
        ? { email }
        : { mobile };
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
        'Could not connect to the server. Please ensure your backend is running on port 8000.'
      );
    }
  };

  const handleVerify = async () => {
    console.log('🔍 Verify button clicked!');
    console.log('🔍 Current OTP value:', otp);
    console.log('🔍 OTP length:', otp.length);
    console.log('🔍 OTP type:', typeof otp);

    // ✅ Trim and validate OTP
    const trimmedOtp = otp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 4) {
      console.log('❌ OTP validation failed - length:', trimmedOtp.length);
      Alert.alert('Incomplete OTP', `Please enter all 4 digits. Current: ${trimmedOtp.length}/4`);
      return;
    }

    // ✅ Prevent multiple submissions
    if (isVerifying) {
      console.log('⏳ Already verifying, ignoring click');
      return;
    }

    setIsVerifying(true);

    try {
      const body = email
        ? { email, otp: trimmedOtp }
        : { mobile, otp: trimmedOtp };

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
        console.log('✅ Current user object before update:', JSON.stringify(user, null, 2));

        // ✅ NEW BACKEND RESPONSE FORMAT:
        // {
        //   "message": "User account verified successfully.",
        //   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        //   "token_type": "bearer",
        //   "user": { "user_id": "...", "email": "...", ... }
        // }

        // ✅ Extract token from response
        const token = data.access_token || data.token;
        if (token) {
          console.log('🔐 Token found in response:', token.substring(0, 20) + '...');
          setToken(token);
        } else {
          console.error('❌ ERROR: No access_token in response!');
          console.error('❌ Response keys:', Object.keys(data));
          Alert.alert('Authentication Error', 'Server did not provide authentication token. Please contact support.');
          return;
        }

        // ✅ Update user data from response
        if (data.user) {
          console.log('👤 Updating user data from response:', JSON.stringify(data.user, null, 2));

          // Merge with existing user data (preserving user_id from signup if needed)
          const existingUserData = user || {};
          const updatedUserData = {
            ...existingUserData,
            ...data.user,
            is_verified: true,
          };

          console.log('👤 Final merged user data:', JSON.stringify(updatedUserData, null, 2));
          setUser(updatedUserData);
        } else {
          console.warn('⚠️ No user object in response, updating verification status only');
          const existingUserData = user || {};
          setUser({
            ...existingUserData,
            is_verified: true,
            verified_at: new Date().toISOString(),
          });
        }

        // ✅ Always navigate to GrantedScreen after OTP verification
        // GrantedScreen will handle the logic to navigate to the correct next screen
        console.log('✅ OTP verified - navigating to GrantedScreen');
        console.log('🔐 Token saved, user is now authenticated');
        navigation.navigate('GrantedScreen');
      } else {
        console.log('❌ OTP verification failed:', response.status);
        Alert.alert('Verification Failed', data.detail || 'Incorrect code. Please try again.');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please check:\n\n' +
        '1. Backend server is running\n' +
        '2. Your internet connection\n\n' +
        'Error: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Enter Code</Text>
      <OTPInput value={otp} onChange={handleOtpChange} length={4} containerStyle={styles.otpContainer} />
      <Text style={styles.helperText}>Enter the 4-Digit code we sent to your Email</Text>
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
        activeOpacity={0.7}
      >
        <Text style={styles.verifyButtonText}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Text>
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
    backgroundColor: '#B8B3E6',
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

export default OTPVerificationScreen;

