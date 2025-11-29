import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

type RootStackParamList = {
  Splash: undefined;
  Walkthrough1: undefined;
  Walkthrough2: undefined;
  Walkthrough3: undefined;
  Login: undefined;
  SignUp: undefined;
  PhoneLogin: undefined;
  Home: undefined;
  BasicDetails: undefined;
  GuardianConsent: undefined;
  GrantedScreen: undefined; // Add GrantedScreen to the navigation stack
};

type BasicDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'BasicDetails'>;

const BasicDetailsForm = () => {
  const navigation = useNavigation<BasicDetailsNavigationProp>();
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [dateString, setDateString] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if both fields are filled
  const isFormValid = name.trim() !== '' && dateString !== '';

  // Function to calculate age
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      // Format date as DD/MM/YYYY
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDateString(`${day}/${month}/${year}`);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleContinue = async () => {
    if (!isFormValid) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate saving data (replace with actual save logic)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      setLoading(false);
      
      // Check user's age and navigate accordingly
      const userAge = calculateAge(dateOfBirth);
      
      if (userAge >= 18) {
        // User is 18 or older - go to GrantedScreen
        navigation.navigate('GrantedScreen');
      } else {
        // User is under 18 - go to GuardianConsent page
        navigation.navigate('GuardianConsent');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {/* Title */}
        <Text style={styles.title}>Basic Details</Text>

        {/* Name Field */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[
            styles.input,
            name.trim() !== '' ? styles.inputFilled : styles.inputEmpty
          ]}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder=""
        />

        {/* Date of Birth Field */}
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity 
          style={[
            styles.input,
            styles.dateInput,
            dateString !== '' ? styles.inputFilled : styles.inputEmpty
          ]} 
          onPress={showDatePickerModal}
        >
          <Text style={[
            styles.dateText,
            dateString !== '' ? styles.dateTextFilled : styles.dateTextEmpty
          ]}>
            {dateString || ''}
          </Text>
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton,
            isFormValid ? styles.continueButtonActive : styles.continueButtonInactive,
            loading && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={loading || !isFormValid}
        >
          <Text style={[
            styles.continueButtonText,
            isFormValid ? styles.continueButtonTextActive : styles.continueButtonTextInactive
          ]}>
            {loading ? 'Loading...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 21.6,
  },
  formContainer: {
    flex: 1,
    paddingTop: 9,
  },
  title: {
    fontSize: 25.2,
    fontWeight: '500',
    color: '#000',
    marginBottom: 27,
    textAlign: 'left',
  },
  label: {
    fontSize: 14.4,
    color: '#000',
    marginBottom: 7.2,
    marginTop: 9,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 7.2,
    paddingHorizontal: 14.4,
    fontSize: 14.4,
    color: '#000',
    marginBottom: 7.2,
    borderWidth: 3,
  },
  inputEmpty: {
    borderColor: '#D1D5DB', // Grey border when empty
  },
  inputFilled: {
    borderColor: '#8170FF', // Purple border when filled
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14.4,
  },
  dateTextEmpty: {
    color: '#9CA3AF', // Grey text when empty
  },
  dateTextFilled: {
    color: '#000', // Black text when filled
  },
  continueButton: {
    borderRadius: 22.5,
    paddingVertical: 14.4,
    alignItems: 'center',
    marginTop: 360,
    marginBottom: 36,
  },
  continueButtonInactive: {
    backgroundColor: '#D1D5DB', // Grey when inactive
  },
  continueButtonActive: {
    backgroundColor: '#8170FF', // Purple when active
  },
  continueButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  continueButtonText: {
    fontSize: 15.3,
    fontWeight: '600',
  },
  continueButtonTextInactive: {
    color: '#6B7280', // Grey text when inactive
  },
  continueButtonTextActive: {
    color: '#fff', // White text when active
  },
});

export default BasicDetailsForm;
