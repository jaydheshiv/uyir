import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LabeledInput from '../components/LabeledInput';
import PrimaryButton from '../components/PrimaryButton';

import type { RootStackParamList } from '../navigation/AppNavigator';

export default function SignupFlow() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [_username, _setUsername] = useState('');

  const handleSignup = async () => {
    if (!email && !phone) {
      Alert.alert('Validation', 'Please enter email or phone number.');
      return;
    }
    setLoading(true);
    try {
      const body: any = {
        consent: {
          cloud_sync: true,
          follow: true,
          family_sharing: true
        }
      };
      if (email) body.email = email;
      if (phone) body.mobile = phone.startsWith('+91') ? phone : `+91${phone}`;

      const response = await fetch('http://10.0.2.2:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Verification', 'Verification code sent successfully!');
        if (email) {
          navigation.navigate('OTPVerificationScreen', { code: data.otp, email });
        } else if (phone) {
          navigation.navigate('OTPVerificationPhoneScreen', { code: data.otp, mobile: phone.startsWith('+91') ? phone : `+91${phone}` });
        }
      } else {
        Alert.alert('Error', typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
    } catch (err) {
      Alert.alert('Network error', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Sign up</Text>
        </View>
      </View>
      <Text style={styles.subTitle}>
        Create an Uyir account
      </Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email */}
        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
        />

        {/* Password with eye icon inside */}
        <View style={styles.passwordContainer}>
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="***********"
            inputStyle={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#A8A8A8"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordHint}>The password must be at least 8 characters</Text>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Mobile Number */}
        <Text style={styles.label}>Enter Mobile Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.flagBox}>
            <View style={styles.flagContainer}>
              <View style={[styles.flagStripe, styles.flagStripeOrange]} />
              <View style={[styles.flagStripe, styles.flagStripeWhite]} />
              <View style={[styles.flagStripe, styles.flagStripeGreen]} />
              <View style={styles.flagCircle} />
            </View>
          </View>
          <Text style={styles.countryCode}>+91</Text>
          <LabeledInput
            label=""
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder=""
            containerStyle={styles.phoneInputContainer}
            inputStyle={styles.phoneInputStyle}
          />
        </View>
        <Text style={styles.phoneHint}>Enter your mobile number we'll send you a OTP</Text>

        <Text style={styles.termsText}>
          By signing up, you agree to Uyir's{' '}
          <Text style={styles.termsLink}>terms and conditions</Text>
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={loading ? 'Sending...' : 'Continue'}
            onPress={handleSignup}
            disabled={loading}
            style={styles.primaryButton}
          />

          <TouchableOpacity style={[styles.socialButton, styles.socialButtonSpacing]}>
            <FontAwesome name="google" size={20} color="#8170FF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialButton, styles.socialButtonLast]}>
            <FontAwesome name="apple" size={22} color="#8170FF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 16, color: '#000', marginBottom: 8, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  passwordHint: { color: '#666', fontSize: 12, marginTop: 4, marginBottom: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#000' },
  orText: { marginHorizontal: 12, color: '#000', fontSize: 16 },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  flagBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: '#fff',
  },
  countryCode: { fontSize: 16, color: '#A8A8A8', marginRight: 4, alignSelf: 'flex-end', paddingBottom: 12 },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  flagContainer: { width: 24, height: 17, borderRadius: 3, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  flagStripe: { width: 24, height: 5 },
  flagCircle: { position: 'absolute', top: 6, left: 10, width: 4, height: 4, borderRadius: 2, backgroundColor: '#000088' },
  phoneHint: { color: '#A8A8A8', fontSize: 12, marginTop: 4, marginBottom: 8 },
  termsText: { color: '#8F8F8F', fontSize: 12, textAlign: 'left', marginTop: 8, marginBottom: 16 },
  termsLink: { fontSize: 14, color: '#8170FF', textDecorationLine: 'underline' },
  sendButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#8170FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  socialButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#8170FF',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 80,
  },
  socialIcon: {
    fontSize: 20,
    color: '#8170FF',
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  socialButtonText: {
    color: '#8170FF',
    fontSize: 16,
    fontWeight: '500',
  },
  // New styles for alignment fixes
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 18,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordInput: {
    paddingRight: 36,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 38,
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagStripeOrange: {
    backgroundColor: '#FF9933',
  },
  flagStripeWhite: {
    backgroundColor: '#fff',
  },
  flagStripeGreen: {
    backgroundColor: '#128807',
  },
  phoneInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  phoneInputStyle: {
    height: 48,
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 4,
  },
  primaryButton: {
    marginBottom: 16,
  },
  socialButtonSpacing: {
    marginBottom: 16,
  },
  socialButtonLast: {
    marginBottom: 0,
  },
});
