import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OTPInput from '../components/OTPInput';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore, useAuth, useAvatar } from '../store/useAppStore';

// Helper: Test backend connectivity before sending OTP
const testBackendConnectivity = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'GET' });
    return response.ok;
  } catch (err) {
    return false;
  }
};

const OTPVerificationScreenlogin: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code, email, mobile } = (route.params || {}) as { code?: string; email?: string; mobile?: string };
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Track loading state

  // ✅ Use ref to prevent multiple simultaneous verification attempts
  const isVerifying = useRef<boolean>(false);

  // ✅ Use Zustand for auth and avatar
  const { setToken, setUser, isNewUser, markProfileComplete } = useAuth();
  const { markAvatarCreated } = useAvatar();

  // ✅ Set initial OTP from route params only once on mount
  useEffect(() => {
    if (code && code.length === 4) {
      setOtp(code);
    }

    // ✅ Cleanup function to reset verification state on unmount
    return () => {
      isVerifying.current = false;
      console.log('🧹 OTP screen unmounted - reset verification state');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // ✅ Function to check if user has professional profile
  const checkProfessionalProfile = async (userToken: string) => {
    const backendUrl = 'http://dev.api.uyir.ai/professional/';

    console.log('🔍 Checking professional profile...');
    console.log('🔍 URL:', backendUrl);

    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      try {
        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Professional profile response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Professional profile found:', JSON.stringify(data, null, 2));

          const store = useAppStore.getState();
          const storeAny = store as any;

          if (data?.professional && typeof storeAny.setProfessionalData === 'function') {
            storeAny.setProfessionalData(data.professional);
            console.log('✅ Professional data stored:', {
              display_name: data.professional.display_name,
              subscriber_count: data.professional.subscriber_count,
              follower_count: data.professional.follower_count,
              upcoming_session_count: data.professional.upcoming_session_count,
            });
          }

          if (typeof storeAny.markProfessionalCreated === 'function') {
            storeAny.markProfessionalCreated();
          }
          if (typeof storeAny.markProTermsAccepted === 'function') {
            storeAny.markProTermsAccepted();
          }

          console.log('✅ Professional user confirmed - full dashboard unlocked');
          return { isProfessional: true, needsOnboarding: false };
        } else if (response.status === 404) {
          console.log('⚠️ No professional profile found (404) - ProfileScreen will show Upgrade button');

          // ✅ Reset ALL professional-related state
          const store = useAppStore.getState();
          const storeAny = store as any;

          if (typeof storeAny.setProfessionalData === 'function') {
            storeAny.setProfessionalData(null);
          }

          if (typeof storeAny.markProfessionalNotCreated === 'function') {
            storeAny.markProfessionalNotCreated();
            console.log('✅ Called markProfessionalNotCreated()');
          } else {
            console.log('⚠️ markProfessionalNotCreated function is missing in Zustand store');
          }

          // ✅ Also reset pro terms to ensure upgrade flow works
          if (typeof storeAny.markProTermsAccepted === 'function') {
            // Don't mark as accepted - user hasn't gone through pro upgrade yet
            console.log('✅ Professional state fully reset for non-professional user');
          }

          return { isProfessional: false, needsOnboarding: false };
        } else {
          const errorText = await response.text();
          console.log('⚠️ Error checking professional profile:', response.status, errorText);

          const store = useAppStore.getState();
          const storeAny = store as any;
          if (typeof storeAny.setProfessionalData === 'function') {
            storeAny.setProfessionalData(null);
          }
          if (typeof storeAny.markProfessionalNotCreated === 'function') {
            storeAny.markProfessionalNotCreated();
          }
          return { isProfessional: false, needsOnboarding: false };
        }
      } catch (error) {
        attempts++;
        console.error(`❌ Error checking professional profile (attempt ${attempts}):`, error);
        if (attempts >= maxRetries) {
          console.error('❌ Max retries reached. Network request failed.');

          // ✅ Mark as not professional on error
          const store = useAppStore.getState();
          const storeAny = store as any;
          if (typeof storeAny.setProfessionalData === 'function') {
            storeAny.setProfessionalData(null);
          }
          if (typeof storeAny.markProfessionalNotCreated === 'function') {
            storeAny.markProfessionalNotCreated();
          }
          return { isProfessional: false, needsOnboarding: false };
        }
        console.log(`🔄 Retrying professional profile check (attempt ${attempts + 1}/${maxRetries})...`);
      }
    }

    // ✅ If loop exits without returning, mark as not professional
    console.log('⚠️ Professional check loop ended without result - treating as not professional');
    const store = useAppStore.getState();
    const storeAny = store as any;
    if (typeof storeAny.setProfessionalData === 'function') {
      storeAny.setProfessionalData(null);
    }
    if (typeof storeAny.markProfessionalNotCreated === 'function') {
      storeAny.markProfessionalNotCreated();
    }
    return { isProfessional: false, needsOnboarding: false };
  };

  const handleResend = async () => {
    // ✅ Prevent resend while verification is in progress
    if (loading || isVerifying.current) {
      console.log('⚠️ Cannot resend while verification is in progress');
      return;
    }

    try {
      setLoading(true);
      const body = email
        ? { email }
        : { mobile };
      const resendEndpoint = '/auth/login/resend';
      const backendUrl = `http://dev.api.uyir.ai${resendEndpoint}`;

      console.log('📤 Resending OTP...');
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
      console.error('❌ Resend error:', err);
      Alert.alert('Network error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    // ✅ Prevent duplicate requests using both state and ref
    if (loading || isVerifying.current) {
      console.log('⚠️ Verification already in progress, ignoring duplicate call');
      return;
    }

    const entered = otp;
    if (entered.length !== 4) {
      Alert.alert('Please enter the 4-digit code.');
      return;
    }

    // ✅ Set both loading state and ref to prevent duplicate calls
    setLoading(true);
    isVerifying.current = true;
    console.log('🔐 Starting OTP verification...');
    let retries = 3;
    let lastError = null;
    const backendUrl = 'http://dev.api.uyir.ai/auth/login/verify';

    // Test backend connectivity before starting OTP verification
    const isBackendUp = await testBackendConnectivity('http://dev.api.uyir.ai/');
    if (!isBackendUp) {
      Alert.alert('Cannot reach backend', 'Please check your server and network connection.');
      setLoading(false);
      isVerifying.current = false;
      return;
    }

    while (retries > 0) {
      try {
        const body = email
          ? { email, otp: entered }
          : { mobile, otp: entered };

        console.log('🔗 handleVerify: Sending POST to', backendUrl);
        console.log('🔗 handleVerify: Request body:', body);
        let response;
        try {
          response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } catch (fetchError) {
          lastError = fetchError;
          console.error('❌ Fetch threw error:', (fetchError instanceof Error ? fetchError.message : String(fetchError)));
          retries -= 1;
          if (retries === 0) {
            Alert.alert('Network error (fetch failed). Please try again later.');
            setLoading(false);
            isVerifying.current = false;
            return;
          } else {
            console.log(`🔄 Retrying OTP verification... (${3 - retries} attempt(s) left)`);
            continue;
          }
        }
        console.log('🔗 handleVerify: Response status:', response.status);
        let data;
        try {
          data = await response.json();
          console.log('🔗 handleVerify: Response JSON:', data);
        } catch (jsonError) {
          console.error('❌ Failed to parse response as JSON:', jsonError);
          const text = await response.text();
          console.log('🔗 handleVerify: Raw response text:', text);
          Alert.alert('Network error (invalid response format).');
          setLoading(false);
          isVerifying.current = false;
          return;
        }
        if (response.ok) {
          console.log('📦 Full login response:', JSON.stringify(data, null, 2));
          console.log('🔍 Checking for user data in response...');
          console.log('   - data.user exists?', !!data.user);
          console.log('   - data.user_data exists?', !!data.user_data);
          console.log('   - data.token exists?', !!data.token);
          console.log('   - data.access_token exists?', !!data.access_token);

          // ✅ Save token and user data to Zustand (auto-persists to AsyncStorage)
          if (data.token || data.access_token) {
            const token = data.token || data.access_token;
            setToken(token);
            console.log('✅ Token saved to Zustand:', token.substring(0, 20) + '...');

            // ✅ Get user data from login response
            const userData = data.user || data.user_data;

            console.log('🔍 User data check:');
            console.log('   - userData exists?', !!userData);
            if (userData) {
              console.log('   - userData.avatar_id:', userData.avatar_id);
              console.log('   - userData.email:', userData.email);
              console.log('   - userData.id:', userData.id || userData.user_id);
            }

            if (!userData) {
              console.log('⚠️ No user data in login response');
              console.log('⚠️ Backend /auth/login/verify should return user object!');
              console.log('⚠️ Treating as new user - redirecting to onboarding');

              // Navigate to onboarding for new users
              navigation.navigate('GrantedScreen');
              setLoading(false);
              return;
            }

            // ✅ Save user data to Zustand
            setUser(userData);
            console.log('✅ User data from login response:', JSON.stringify(userData, null, 2));
            console.log('✅ Retrieved user_id:', userData.user_id || userData.id);

            // ✅ CRITICAL: Fetch latest avatar data from backend after login
            if (userData.avatar_id) {
              console.log('🔄 Fetching latest avatar data for avatar_id:', userData.avatar_id);
              try {
                // ✅ Use the correct GET endpoint for avatar data
                const avatarUrl = `http://dev.api.uyir.ai/api/avatar/${userData.avatar_id}`;

                const avatarResponse = await fetch(avatarUrl, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (avatarResponse.ok) {
                  const avatarData = await avatarResponse.json();
                  console.log('✅ Fetched avatar data from backend:', JSON.stringify(avatarData, null, 2));

                  // ✅ Update user object with latest avatar data
                  const updatedUserData = {
                    ...userData,
                    avatar_name: avatarData.avatar_name || userData.avatar_name,
                    avatar_dob: avatarData.avatar_dob || undefined,
                    avatar_about_me: avatarData.avatar_about_me || undefined,
                  };

                  setUser(updatedUserData);
                  console.log('✅ Updated user with avatar data:', {
                    avatar_name: updatedUserData.avatar_name,
                    avatar_dob: updatedUserData.avatar_dob,
                    avatar_about_me: updatedUserData.avatar_about_me,
                  });
                } else {
                  console.log('⚠️ Could not fetch avatar data (status ' + avatarResponse.status + '), using user data from login');
                  // Not a critical error - we already have basic user data from login
                }
              } catch (avatarErr) {
                console.log('⚠️ Error fetching avatar data:', avatarErr);
                // Not a critical error - we already have basic user data from login
              }
            }

            // ✅ Check if user has already completed onboarding (has avatar_id)
            if (userData.avatar_id) {
              console.log('✅ Returning user with avatar_id:', userData.avatar_id);
              console.log('✅ User ID for this account:', userData.user_id || userData.id);

              // Mark as returning user
              markAvatarCreated();
              markProfileComplete();

              // ✅ Check if user has professional profile
              console.log('🔍 Checking professional status for user_id:', userData.user_id || userData.id);
              const professionalStatus = await checkProfessionalProfile(token);

              if (professionalStatus?.isProfessional) {
                console.log('✅ Professional user detected - navigating directly to Avatarhome1');
              } else {
                if (professionalStatus?.needsOnboarding) {
                  console.log('⚠️ Professional profile flagged for onboarding, proceeding with base experience');
                }
                console.log('✅ Basic user detected - navigating directly to Avatarhome1');
              }

              // ✅ FIXED: Navigate directly to Avatarhome1 for returning users
              // This avoids the race condition with Zustand state persistence
              console.log('🏠 Navigating directly to Avatarhome1 (returning user)');
              setLoading(false);
              isVerifying.current = false;
              navigation.reset({
                index: 0,
                routes: [{ name: 'Avatarhome1' as never }],
              });
              return; // ✅ Exit immediately after navigation

            } else {
              console.log('⚠️ New user - no avatar_id found');
              console.log('✅ New user ID:', userData.user_id || userData.id);
              console.log('🎯 Navigating to GrantedScreen (will show onboarding)');

              // ✅ New user - show onboarding flow through GrantedScreen
              setLoading(false);
              isVerifying.current = false;
              navigation.navigate('GrantedScreen');
              return; // ✅ Exit immediately after navigation
            }
          } else {
            console.log('⚠️ No token returned from backend');
            Alert.alert('Login Error', 'No authentication token received');
            setLoading(false);
            isVerifying.current = false;
            return; // ✅ Exit on error
          }

          // ✅ Exit the function after successful verification and navigation
          return;

        } else {
          Alert.alert(data.detail || 'Incorrect code. Please try again.');
          setLoading(false);
          isVerifying.current = false;
          return;
        }
      } catch (err) {
        lastError = err;
        console.error('Verification error:', (err instanceof Error ? err.message : String(err)));
        retries -= 1;
        if (retries === 0) {
          Alert.alert('Network error. Please try again later.');
          setLoading(false);
          isVerifying.current = false;
          return;
        } else {
          console.log(`🔄 Retrying OTP verification... (${3 - retries} attempt(s) left)`);
        }
      }
    }
    setLoading(false);
    isVerifying.current = false;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Enter Code</Text>
      <OTPInput value={otp} onChange={setOtp} length={4} containerStyle={styles.otpContainer} />
      <Text style={styles.helperText}>Enter the 4-Digit code we sent to your Email</Text>
      <View style={styles.spacer} />
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't get OTP? </Text>
        <TouchableOpacity onPress={handleResend} disabled={loading}>
          <Text style={styles.resendLink}>{loading ? 'Please wait...' : 'Resend OTP'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.verifyButtonLoading]}
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
            <Text style={styles.verifyButtonText}>Verifying...</Text>
          </View>
        ) : (
          <Text style={styles.verifyButtonText}>Verify</Text>
        )}
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
  backArrow: {
    fontSize: 21.6,
    color: '#000',
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 9,
    marginBottom: 10.8,
  },
  otpInput: {
    width: 50.4,
    height: 50.4,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10.8,
    fontSize: 25.2,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginRight: 10.8,
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
    height: 45,
    backgroundColor: '#8170FF',
    borderRadius: 19.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 40,
  },
  verifyButtonLoading: {
    backgroundColor: '#9B8CFF',
    opacity: 0.8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 9,
  },
  spacer: {
    flex: 1,
  },
});

export default OTPVerificationScreenlogin;

