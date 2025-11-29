import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth, useAvatar } from '../store/useAppStore';

type RootStackParamList = {
  AccountGranted: undefined;
  CreateAccount: { avatarId?: string | null } | undefined;
  LoginFlow: undefined;
};

const CreateAccount: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateAccount'>>();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [aboutMe, setAboutMe] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // ✅ Get auth and avatar from Zustand
  const { token, markProfileComplete, setUser } = useAuth();
  const { avatar, markAvatarCreated, setAvatarName } = useAvatar();

  const handleContinue = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for your avatar');
      return;
    }

    if (!dateOfBirth.trim()) {
      Alert.alert('Validation Error', 'Please enter your date of birth');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert(
        'Invalid Date Format',
        'Please enter date in YYYY-MM-DD format\nExample: 1990-05-15'
      );
      return;
    }

    if (!aboutMe.trim()) {
      Alert.alert('Validation Error', 'Please tell us about yourself');
      return;
    }

    if (!gender) {
      Alert.alert('Validation Error', 'Please select your gender');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Get token from Zustand
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        navigation.navigate('LoginFlow' as any);
        return;
      }

      // ✅ Get avatar_id from Zustand store
      const currentAvatarId = avatar.avatarId;

      if (!currentAvatarId) {
        Alert.alert(
          'Error',
          'No avatar ID found. Please upload an avatar image first.'
        );
        return;
      }

      console.log('✅ Using avatar_id from Zustand:', currentAvatarId);

      const backendUrl = `http://dev.api.uyir.ai:8081/api/avatar/personalize/${currentAvatarId}`;

      const requestData = {
        avatar_name: name.trim(),
        avatar_dob: dateOfBirth.trim(),
        avatar_about_me: aboutMe.trim(),
        gender: gender.toLowerCase(), // Backend expects lowercase: "male", "female", etc.
      };

      console.log('=== AVATAR PERSONALIZATION REQUEST ===');
      console.log('URL:', backendUrl);
      console.log('Avatar ID:', currentAvatarId);
      console.log('Request data:', requestData);
      console.log('Request body (stringified):', JSON.stringify(requestData));
      console.log('Date format validation:', dateRegex.test(dateOfBirth.trim()));
      console.log('=====================================');

      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response data (parsed):', data);
      } catch (e) {
        console.error('Could not parse response as JSON:', e);
        data = { detail: responseText };
      }

      if (response.ok) {
        console.log('Avatar personalized successfully:', data);

        // ✅ Mark avatar as created and profile as complete
        markAvatarCreated();
        markProfileComplete();

        // ✅ Save avatar_name to Zustand for use in other screens
        setAvatarName(name.trim());

        // ✅ Update user object with ALL avatar fields (not just avatar_name)
        setUser({
          avatar_name: name.trim(),
          avatar_dob: dateOfBirth.trim(),
          avatar_about_me: aboutMe.trim(),
        });

        Alert.alert('Success', 'Avatar details saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('AccountGranted') }
        ]);
      } else {
        // Show detailed error from backend
        console.error('=== API ERROR RESPONSE ===');
        console.error('Status:', response.status);
        console.error('Full response:', JSON.stringify(data, null, 2));
        console.error('========================');

        let errorMessage = 'Failed to save avatar details';

        // Handle FastAPI validation errors (422)
        if (response.status === 422 && data.detail) {
          if (Array.isArray(data.detail)) {
            // FastAPI validation errors are arrays
            const errors = data.detail.map((err: any) => {
              const field = err.loc ? err.loc.join('.') : 'unknown';
              return `• ${field}: ${err.msg}`;
            }).join('\n');
            errorMessage = `Validation Error:\n\n${errors}`;
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }

        Alert.alert(
          `Error (${response.status})`,
          errorMessage + '\n\nData sent:\n' + JSON.stringify(requestData, null, 2)
        );
      }
    } catch (error) {
      console.error('Personalization error:', error);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please ensure:\n\n' +
        '1. You have internet connection\n' +
        '2. Backend API is accessible (dev.api.uyir.ai)\n\n' +
        'Error: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Give Your Avatar a Name</Text>
        <Text style={styles.subtitle}>This is how your avatar will introduce themselves to you.</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Date of Birth Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>DoB (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="1990-05-15"
            placeholderTextColor="#999"
            maxLength={10}
          />
          <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 1990-05-15)</Text>
        </View>

        {/* Gender Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowGenderOptions(!showGenderOptions)}
          >
            <Text style={[styles.genderText, !gender && styles.placeholderText]}>
              {gender || 'Select your gender'}
            </Text>
            <Ionicons
              name={showGenderOptions ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          {showGenderOptions && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.option, gender === 'Male' && styles.selectedOption]}
                onPress={() => {
                  setGender('Male');
                  setShowGenderOptions(false);
                }}
              >
                <Text style={[styles.optionText, gender === 'Male' && styles.selectedOptionText]}>
                  Male
                </Text>
                {gender === 'Male' && (
                  <Ionicons name="checkmark" size={20} color="#8170FF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, gender === 'Female' && styles.selectedOption]}
                onPress={() => {
                  setGender('Female');
                  setShowGenderOptions(false);
                }}
              >
                <Text style={[styles.optionText, gender === 'Female' && styles.selectedOptionText]}>
                  Female
                </Text>
                {gender === 'Female' && (
                  <Ionicons name="checkmark" size={20} color="#8170FF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, gender === 'Others' && styles.selectedOption]}
                onPress={() => {
                  setGender('Others');
                  setShowGenderOptions(false);
                }}
              >
                <Text style={[styles.optionText, gender === 'Others' && styles.selectedOptionText]}>
                  Others
                </Text>
                {gender === 'Others' && (
                  <Ionicons name="checkmark" size={20} color="#8170FF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* About Me Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>About me</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Tell us about yourself"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomButtonsContainer, { paddingBottom: 22 + insets.bottom }]}>
        <PrimaryButton
          title={isLoading ? 'Saving...' : 'Continue'}
          onPress={handleContinue}
          disabled={isLoading}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#8170FF"
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingHorizontal: 21.6,
    paddingTop: 31.5,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48.6,
    marginBottom: 13.5
  },
  backButton: {
    padding: 0.9,
    marginBottom: 27,
  },
  title: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#000',
    marginBottom: 9,
    marginTop: -20,
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  subtitle: {
    fontSize: 14.4,
    color: '#000',
    marginBottom: 31.5,
    lineHeight: 21.6,
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14.4,
    fontWeight: '600',
    color: '#000',
    marginBottom: 7.2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10.8,
    paddingHorizontal: 14.4,
    paddingVertical: 14.4,
    fontSize: 14.4,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 10.8,
    color: '#666',
    marginTop: 3.6,
    fontStyle: 'italic',
  },
  genderText: {
    fontSize: 14.4,
    color: '#000',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 14.4,
    top: 14.4,
  },
  optionsContainer: {
    marginTop: 7.2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10.8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14.4,
    paddingVertical: 12.6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedOption: {
    backgroundColor: '#F5F3FF',
  },
  optionText: {
    fontSize: 14.4,
    color: '#000',
  },
  selectedOptionText: {
    color: '#8170FF',
    fontWeight: '600',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 21.6,
    paddingTop: 9,
    paddingBottom: 21.6,
    backgroundColor: '#fff',
  },
});

export default CreateAccount;

