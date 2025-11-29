import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LabeledInput from '../components/LabeledInput';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/useAppStore';

export default function SignupFlow() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setUser, resetOnboardingState } = useAuth();
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

      const response = await fetch('http://dev.api.uyir.ai:8081/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('📝 === SIGNUP RESPONSE ===');
      console.log('📝 Full response:', JSON.stringify(data, null, 2));
      console.log('📝 User ID:', data.user_id);
      console.log('📝 OTP for testing:', data.otp_for_testing || data.otp);

      if (response.ok) {
        // ✅ Reset onboarding state for new user (clear any old data)
        resetOnboardingState();

        // Store user_id in Zustand
        console.log('💾 Storing user_id in Zustand:', data.user_id);
        setUser({ user_id: data.user_id });
        console.log('✅ User ID saved to Zustand - will be preserved during OTP verification');

        Alert.alert('Verification', 'Verification code sent successfully!');
        if (email) {
          navigation.navigate('OTPVerificationScreen', { code: data.otp, email });
        } else if (phone) {
          navigation.navigate('OTPVerificationPhoneScreen', { code: data.otp, mobile: phone.startsWith('+91') ? phone : `+91${phone}` });
        }
      } else {
        // Handle specific error cases
        const errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);

        if (errorMessage.toLowerCase().includes('already exists')) {
          // User exists but might not be verified - allow them to complete verification
          Alert.alert(
            'Account Exists',
            'An account with this email/mobile already exists but may not be verified. Unfortunately, the backend cannot resend OTP to unverified accounts.\n\nOptions:\n1. Contact support to manually verify your account\n2. Ask backend team to add OTP resend feature',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Try OTP Screen',
                onPress: () => {
                  // Let user try OTP screen anyway in case they have the code
                  Alert.alert(
                    'Manual Entry',
                    'You will be taken to the OTP screen. If you still have the OTP from your original signup, you can enter it there.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Continue',
                        onPress: () => {
                          if (email) {
                            navigation.navigate('OTPVerificationScreen', {
                              code: '',
                              email
                            });
                          } else if (phone) {
                            navigation.navigate('OTPVerificationPhoneScreen', {
                              code: '',
                              mobile: phone.startsWith('+91') ? phone : `+91${phone}`
                            });
                          }
                        }
                      }
                    ]
                  );
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
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
      <View style={styles.contentContainer}>
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
          <TouchableOpacity
            style={[styles.loginButton, styles.marginTop16, loading && styles.opacity06]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Sending...' : 'Continue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={20} color="#8170FF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={22} color="#8170FF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontSize: 12.6, color: '#000', marginBottom: 5.4, marginTop: 7.2 },
  input: {
    height: 39.6,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10.8,
    paddingHorizontal: 10.8,
    backgroundColor: '#fff',
    fontSize: 12.6,
    marginBottom: 5.4,
  },
  passwordHint: { color: '#666', fontSize: 9.9, marginTop: 1.8, marginBottom: 5.4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10.8 },
  divider: { flex: 1, height: 0.9, backgroundColor: '#D6D6D6' },
  orText: { marginHorizontal: 10.8, color: '#A8A8A8', fontSize: 12.6 },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5.4 },
  flagBox: {
    width: 39.6,
    height: 39.6,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3.6,
    backgroundColor: '#fff',
  },
  countryCode: { fontSize: 12.6, color: '#A8A8A8', marginRight: 3.6, alignSelf: 'flex-end', paddingBottom: 10.8 },
  phoneInput: {
    flex: 1,
    height: 39.6,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10.8,
    paddingHorizontal: 10.8,
    backgroundColor: '#fff',
    fontSize: 12.6,
  },
  flagContainer: { width: 21.6, height: 15.3, borderRadius: 2.7, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  flagStripe: { width: 21.6, height: 4.5 },
  flagCircle: { position: 'absolute', top: 5.4, left: 9, width: 3.6, height: 3.6, borderRadius: 1.8, backgroundColor: '#000088' },
  phoneHint: { color: '#A8A8A8', fontSize: 9.9, marginTop: 1.8, marginBottom: 5.4 },
  termsText: { color: '#8F8F8F', fontSize: 9.9, textAlign: 'left', marginTop: 5.4, marginBottom: 10.8 },
  termsLink: { fontSize: 10.8, color: '#8170FF', textDecorationLine: 'underline' },
  loginButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#8170FF',
    borderRadius: 21.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14.4,
  },
  loginButtonText: { color: '#fff', fontSize: 12.6, fontWeight: '500' },
  socialButton: {
    width: '100%',
    height: 45,
    borderRadius: 21.6,
    borderWidth: 1,
    borderColor: '#8170FF',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 18,
  },
  socialIcon: {
    fontSize: 16.2,
    color: '#8170FF',
    marginRight: 7.2,
    width: 18,
    textAlign: 'center',
  },
  socialButtonText: {
    color: '#8170FF',
    fontSize: 12.6,
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
    paddingHorizontal: 18,
    marginTop: 30,
    marginBottom: 10.8,
  },
  backButton: {
    width: 28.8,
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
    fontSize: 14.4,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14.4,
    fontWeight: '700',
    color: '#000',
    marginLeft: 18,
    marginTop: 7.2,
    marginBottom: 10.8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 7.2,
    paddingBottom: 14.4,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 7.2,
  },
  passwordInput: {
    paddingRight: 32.4,
  },
  eyeButton: {
    position: 'absolute',
    right: 10.8,
    top: 34.2,
    height: 28.8,
    width: 28.8,
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
    height: 39.6,
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 3.6,
  },
  marginTop16: {
    marginTop: 20,
  },
  opacity06: {
    opacity: 0.6,
  },
});

