
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const LetUsKnowYou: React.FC = () => {
  const [avatarName, setAvatarName] = useState('');
  const [gender, setGender] = useState('');
  const [greeting, setGreeting] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = () => {
    navigation.navigate('UploadContent');
  };

  return (
    <View style={styles.root}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
  <Ionicons name="arrow-back" size={28} color="#222" onPress={() => navigation.goBack()} />
      </TouchableOpacity>
      {/* Title */}
      <Text style={styles.title}>Let us know you</Text>
      {/* Form Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Avatar Name</Text>
        <TextInput
          style={styles.input}
          value={avatarName}
          onChangeText={setAvatarName}
          placeholder=""
          placeholderTextColor="#8170FF"
        />
        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
          placeholder=""
          placeholderTextColor="#8170FF"
        />
        <Text style={styles.label}>Greeting</Text>
        <View style={styles.inputWithCount}>
          <TextInput
            style={[styles.input, styles.inputWithCountText]}
            value={greeting}
            onChangeText={setGreeting}
            placeholder="Hey! I’m here to guide you through…"
            placeholderTextColor="#BDBDBD"
            maxLength={2000}
          />
          <Text style={styles.countTextInside}>{greeting.length}/2000</Text>
        </View>
        <Text style={styles.label}>About Me</Text>
        <View style={styles.inputWithCount}>
          <TextInput
            style={[styles.input, styles.aboutMeInput, styles.inputWithCountText]}
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder=""
            placeholderTextColor="#8170FF"
            multiline
            maxLength={2000}
          />
          <Text style={styles.countTextInside}>{aboutMe.length}/2000</Text>
        </View>
      </View>
      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Submit</Text>
      </TouchableOpacity>
      {/* Sync Data Button */}
      <TouchableOpacity>
        <Text style={styles.syncText}>Sync my data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: 20,
    marginTop: 25,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  form: {
    marginBottom: 42,
  },
  label: {
    fontSize: 17,
    color: '#222',
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
  input: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#8170FF',
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  inputWithCount: {
    position: 'relative',
    marginBottom: 18,
  },
  countText: {
    display: 'none',
  },
  countTextInside: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    color: '#BDBDBD',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  inputWithCountText: {
    paddingRight: 70,
  },
  aboutMeInput: {
    height: 140,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  submitBtn: {
    backgroundColor: '#8170FF',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  syncText: {
    color: '#8170FF',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 24,
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default LetUsKnowYou;