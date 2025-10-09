import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [email, setEmail] = useState('jv@gmail.co');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [_error, _setError] = useState('');

  const handleContinue = async () => {
    setLoading(true);
    try {
      let body: any = {};
      if (email) body.email = email;
      if (mobile) body.mobile = mobile.startsWith('+91') ? mobile : `+91${mobile}`;
      if (password) body.password = password;
      if (!email && !mobile) {
        Alert.alert('Validation', 'Please enter email or mobile number.');
        setLoading(false);
        return;
      }
      // Call FastAPI login endpoint (assume /auth/login returns OTP code)
      const response = await fetch('http://10.0.2.2:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        // Navigate to OTPVerificationScreenlogin with code and email/mobile
        navigation.navigate('OTPVerificationScreenlogin', {
          code: data.otp,
          email: email || undefined,
          mobile: mobile ? (mobile.startsWith('+91') ? mobile : `+91${mobile}`) : undefined,
        });
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
    <SafeAreaView style={styles.container}>
      {/* ...removed status bar... */}

      {/* Back button and Login header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Login</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerTitle}>Create an Uyir account</Text>

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

        {/* ...removed home indicator... */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000', textAlign: 'left', marginBottom: 24 },
  label: { fontSize: 16, color: '#000', marginBottom: 8, marginTop: 1 },
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
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#8170FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  socialButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#8170FF',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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
  // New styles for inline style cleanup
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    textAlign: 'center',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
    justifyContent: 'flex-start',
  },
  marginBottom8: {
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInputStyle: {
    paddingRight: 40,
    marginBottom: 0,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -25,
    marginBottom: 40,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    color: '#6C5CE7',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#000',
    fontSize: 16,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  indiaFlagButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  flagContainer: {
    width: 24,
    height: 17,
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagStripeOrange: {
    width: 24,
    height: 5,
    backgroundColor: '#FF9933',
  },
  flagStripeWhite: {
    width: 24,
    height: 5,
    backgroundColor: '#fff',
  },
  flagStripeGreen: {
    width: 24,
    height: 5,
    backgroundColor: '#128807',
  },
  flagWheel: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000088',
  },
  continueWithText: {
    fontSize: 16,
    color: '#A8A8A8',
    marginRight: 4,
    alignSelf: 'flex-end',
    paddingBottom: 12,
  },
  flexOne: {
    flex: 1,
    marginBottom: 0,
  },
  buttonHeight48: {
    height: 48,
    marginBottom: 0,
  },
  disclaimerText: {
    color: '#A8A8A8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  marginTop16: {
    marginTop: 16,
  },
  opacity06: {
    opacity: 0.6,
  },
});

export default LoginFlow;
