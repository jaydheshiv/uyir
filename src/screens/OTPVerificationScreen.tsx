import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OTPInput from '../components/OTPInput';

type RootStackParamList = {
  OTPVerificationScreen: { code: string };
  GrantedScreen: undefined;
  BasicDetails: undefined; // Add this line if you want to navigate to BasicDetails
};

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code, email, mobile } = (route.params || {}) as { code?: string; email?: string; mobile?: string };
  const [otp, setOtp] = useState<string>(code && code.length === 4 ? code : '');

  const handleResend = async () => {
    try {
      const body = email
        ? { email }
        : { mobile };
      const resendEndpoint = '/auth/verify-otp';
      const backendUrl = Platform.OS === 'android'
        ? `http://10.0.2.2:8000${resendEndpoint}`
        : `http://localhost:8000${resendEndpoint}`;
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('OTP resent successfully!');
      } else {
        Alert.alert(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
    } catch (err) {
      Alert.alert('Network error.');
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 4) {
      Alert.alert('Please enter the 4-digit code.');
      return;
    }
    try {
      const body = email
        ? { email, otp }
        : { mobile, otp };

      const backendUrl = Platform.OS === 'android'
        ? 'http://10.0.2.2:8000/auth/verify-otp'
        : 'http://localhost:8000/auth/verify-otp';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        navigation.navigate('BasicDetails');
      } else {
        Alert.alert(data.detail || 'Incorrect code. Please try again.');
      }
    } catch (err) {
      Alert.alert('Network error.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Enter Code</Text>
      <OTPInput value={otp} onChange={setOtp} length={4} />
      <Text style={styles.helperText}>Enter the 4-Digit code we sent to your Email</Text>
      <View style={styles.spacer} />
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't get OTP? </Text>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 17,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 32,
    marginLeft: 0,
    marginTop: 0,
  },
  helperText: {
    color: '#A8A8A8',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 0,
    marginLeft: 0,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#000',
    fontSize: 18,
  },
  resendLink: {
    color: '#6C5CE7',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginLeft: 2,
  },
  verifyButton: {
    height: 56,
    backgroundColor: '#8170FF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 32 : 60,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
});

export default OTPVerificationScreen;
