import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LabeledInput from '../components/LabeledInput';

type RootStackParamList = {
  LoginFlow: undefined;
  BasicDetails: undefined;
  Home: undefined;
  OTPVerificationScreen: { code: string; email?: string; mobile?: string };
  OTPVerificationScreenlogin: { code?: string; email?: string; mobile?: string };
};

const LoginFlow: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [_error, _setError] = useState('');

  const handleContinue = async () => {
    setLoading(true);

    // Validate that at least email OR mobile is provided
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();

    if (!trimmedEmail && !trimmedMobile) {
      Alert.alert(
        'Login Required',
        'Please enter either your email address or mobile number to login.'
      );
      setLoading(false);
      return;
    }

    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        // Backend /auth/login endpoint accepts either email or mobile
        const body: any = {};

        if (trimmedEmail) {
          body.email = trimmedEmail;
        }

        if (trimmedMobile) {
          // Ensure mobile has +91 prefix
          body.mobile = trimmedMobile.startsWith('+91') ? trimmedMobile : `+91${trimmedMobile}`;
        }

        // Call FastAPI login endpoint
        const backendUrl = 'http://dev.api.uyir.ai:8081/auth/login';

        console.log('🔐 Calling login endpoint:', backendUrl);
        console.log('📧 Login body:', JSON.stringify(body, null, 2));

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
          response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          console.log('✅ Got response, status:', response.status);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('❌ Fetch failed:', fetchError);
          throw fetchError;
        }

        const data = await response.json();
        console.log('📨 Login response:', data);

        if (response.ok) {
          console.log('✅ Login successful, navigating to OTP verification');
          // Navigate to OTPVerificationScreenlogin with code and email/mobile
          navigation.navigate('OTPVerificationScreenlogin', {
            code: data.otp,
            email: trimmedEmail || undefined,
            mobile: trimmedMobile ? (trimmedMobile.startsWith('+91') ? trimmedMobile : `+91${trimmedMobile}`) : undefined,
          });
          setLoading(false);
          return;
        } else {
          console.error('❌ Login failed:', data);

          // Handle specific error cases
          if (typeof data.detail === 'string' && data.detail.includes('not verified')) {
            Alert.alert(
              'Account Not Verified',
              'Your account exists but needs verification. The backend needs to be updated to resend OTP for unverified accounts. Please contact support or ask the backend team to add this feature.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Contact Support',
                  onPress: () => {
                    Alert.alert(
                      'Workaround',
                      'Ask your backend team to:\n\n1. Either manually verify your account in the database, OR\n2. Update /auth/login to send OTP to unverified accounts, OR\n3. Add a "resend verification" endpoint'
                    );
                  }
                }
              ]
            );
          } else {
            Alert.alert('Error', typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
          }

          setLoading(false);
          return;
        }
      } catch (err: any) {
        lastError = err;
        console.error('❌ Network error during login:', (err instanceof Error ? err.message : String(err)));
        console.error('❌ Error name:', err?.name);
        console.error('❌ Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

        // Check if it's a timeout error
        if (err?.name === 'AbortError') {
          console.error('❌ Request timed out after 10 seconds');
          Alert.alert(
            'Connection Timeout',
            'The server is taking too long to respond. Please check:\n\n1. Backend server is running\n2. URL is correct: http://dev.api.uyir.ai:8081\n3. Your network connection'
          );
          setLoading(false);
          return;
        }

        retries -= 1;
        if (retries === 0) {
          Alert.alert(
            'Network error',
            `Could not connect to server. Please try again later.\n\nError: ${err?.message || 'Unknown error'}`
          );
        } else {
          console.log(`🔄 Retrying login... (${3 - retries} attempt(s) left)`);
        }
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button and Login header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Login</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.headerTitle}>Login to your Uyir account</Text>

        {/* Email */}
        <LabeledInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          inputStyle={styles.marginBottom8}
        />

        {/* Password */}
        <View style={styles.inputContainer}>
          <LabeledInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            inputStyle={styles.passwordInputStyle}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev: boolean) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#A8A8A8" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Mobile number */}
        <Text style={styles.label}>Enter Mobile Number</Text>
        <View style={styles.socialLoginContainer}>
          {/* Flag */}
          <View style={styles.indiaFlagButton}>
            {/* Indian Flag stripes */}
            <View style={styles.flagContainer}>
              <View style={styles.flagStripeOrange} />
              <View style={styles.flagStripeWhite} />
              <View style={styles.flagStripeGreen} />
              <View style={styles.flagWheel} />
            </View>
          </View>
          <Text style={styles.continueWithText}>+91</Text>
          <LabeledInput
            label=""
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholder=""
            containerStyle={styles.flexOne}
            inputStyle={styles.buttonHeight48}
          />
        </View>
        <Text style={styles.disclaimerText}>Enter your mobile number we'll send you a OTP</Text>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.loginButton, styles.marginTop16, loading && styles.opacity06]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Continue...' : 'Continue'}</Text>
        </TouchableOpacity>

        {/* Social login buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={20} color="#8170FF" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="apple" size={22} color="#8170FF" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 21.6,
    paddingTop: 7.2,
    paddingBottom: 40,
  },
  headerTitle: { fontSize: 14.4, fontWeight: '700', color: '#000', textAlign: 'left', marginBottom: 14.4 },
  label: { fontSize: 12.6, color: '#000', marginBottom: 5.4, marginTop: 0.9 },
  input: {
    height: 43.2,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10.8,
    paddingHorizontal: 10.8,
    backgroundColor: '#fff',
    fontSize: 12.6,
    marginBottom: 7.2,
  },
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
    marginTop: 12,
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
  // New styles for inline style cleanup
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    marginTop: 27,
    marginBottom: 18,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitleText: {
    fontSize: 16.2,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  marginBottom8: {
    marginBottom: 7.2,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 14.4,
  },
  passwordInputStyle: {
    paddingRight: 36,
    marginBottom: 0,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -12,
    marginBottom: 14.4,
    paddingVertical: 0,
    paddingHorizontal: 3.6,
  },
  forgotPasswordText: {
    color: '#6C5CE7',
    fontSize: 11.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10.8,
  },
  dividerLine: {
    flex: 1,
    height: 0.9,
    backgroundColor: '#D6D6D6',
  },
  dividerText: {
    marginHorizontal: 9,
    color: '#A8A8A8',
    fontSize: 12.6,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 7.2,
  },
  indiaFlagButton: {
    width: 43.2,
    height: 43.2,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7.2,
    backgroundColor: '#fff',
  },
  flagContainer: {
    width: 21.6,
    height: 15.3,
    borderRadius: 2.7,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagStripeOrange: {
    width: 21.6,
    height: 4.5,
    backgroundColor: '#FF9933',
  },
  flagStripeWhite: {
    width: 21.6,
    height: 4.5,
    backgroundColor: '#fff',
  },
  flagStripeGreen: {
    width: 21.6,
    height: 4.5,
    backgroundColor: '#128807',
  },
  flagWheel: {
    position: 'absolute',
    top: 5.4,
    left: 9,
    width: 3.6,
    height: 3.6,
    borderRadius: 1.8,
    backgroundColor: '#000088',
  },
  continueWithText: {
    fontSize: 12.6,
    color: '#A8A8A8',
    marginRight: 3.6,
    alignSelf: 'flex-end',
    paddingBottom: 10.8,
  },
  flexOne: {
    flex: 1,
    marginBottom: 0,
  },
  buttonHeight48: {
    height: 43.2,
    marginBottom: 0,
  },
  disclaimerText: {
    color: '#A8A8A8',
    fontSize: 9.9,
    marginTop: 1.8,
    marginBottom: 3.6,
  },
  marginTop16: {
    marginTop: 50,
  },
  opacity06: {
    opacity: 0.6,
  },
});

export default LoginFlow;

