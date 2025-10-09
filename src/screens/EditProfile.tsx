import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const EditProfile: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [fullName, setFullName] = useState('Arya');
  const [dob, setDob] = useState('20-07-2004');
  const [email, setEmail] = useState('arya0077@gmail.com');
  const [phone, setPhone] = useState('1234567890');
  const [city, setCity] = useState('Bangalore');

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Update profile</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#aaa" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="DD-MM-YYYY" placeholderTextColor="#aaa" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#aaa" keyboardType="email-address" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.flagBox}>
              <Text style={styles.flagText}>🇮🇳</Text>
            </View>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>+91</Text>
              <Ionicons name="chevron-down" size={18} color="#888" style={styles.chevronIcon} />
            </View>
            <TextInput style={[styles.input, styles.phoneTextInput]} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor="#aaa" keyboardType="phone-pad" />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#aaa" />
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
    padding: 24,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginBottom: 20,
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    fontFamily: 'Outfit-Bold',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 6,
    fontFamily: 'Outfit-Bold',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    fontFamily: 'Outfit-Regular',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#222',
    marginRight: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 32,
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 22,
  },
  codeText: {
    fontSize: 16,
    color: '#222',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  phoneTextInput: {
    flex: 1,
    marginLeft: 8,
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default EditProfile;
