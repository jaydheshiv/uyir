import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';

const EditProfile: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('Arya');
  const [dob, setDob] = useState('20-07-2004');
  const [email, setEmail] = useState('arya0077@gmail.com');
  const [phone, setPhone] = useState('1234567890');
  const [city, setCity] = useState('Bangalore');

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Update profile</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Full name</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]} value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor={theme.inputPlaceholder} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Date of Birth</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]} value={dob} onChangeText={setDob} placeholder="DD-MM-YYYY" placeholderTextColor={theme.inputPlaceholder} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.inputPlaceholder} keyboardType="email-address" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={[styles.flagBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.flagText}>🇮🇳</Text>
            </View>
            <View style={[styles.codeBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.codeText, { color: theme.text }]}>+91</Text>
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} style={styles.chevronIcon} />
            </View>
            <TextInput style={[styles.input, styles.phoneTextInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={theme.inputPlaceholder} keyboardType="phone-pad" />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>City</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.border }]} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={theme.inputPlaceholder} />
        </View>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 21.6,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginBottom: 18,
    marginTop: 36,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 25.2,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16.2,
    fontFamily: 'Outfit-Bold',
  },
  inputGroup: {
    marginBottom: 16.2,
  },
  label: {
    fontSize: 14.4,
    color: '#222',
    marginBottom: 5.4,
    fontFamily: 'Outfit-Bold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 10.8,
    padding: 12.6,
    fontSize: 14.4,
    color: '#222',
    backgroundColor: '#fff',
    fontFamily: 'Outfit-Regular',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagBox: {
    width: 34.2,
    height: 34.2,
    borderRadius: 7.2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#222',
    marginRight: 7.2,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 7.2,
    paddingHorizontal: 7.2,
    paddingVertical: 5.4,
    marginRight: 7.2,
  },
  saveBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 21.6,
    paddingVertical: 14.4,
    alignItems: 'center',
    marginTop: 16.2,
    marginBottom: 28.8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16.2,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16.2,
    borderTopLeftRadius: 21.6,
    borderTopRightRadius: 21.6,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flagText: {
    fontSize: 19.8,
  },
  codeText: {
    fontSize: 14.4,
    color: '#222',
  },
  chevronIcon: {
    marginLeft: 3.6,
  },
  phoneTextInput: {
    flex: 1,
    marginLeft: 7.2,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

export default EditProfile;

