import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton'; // Import your custom back button
import CustomBottomNav from '../components/CustomBottomNav';

import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ProfileStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileStatus'>;
type ProfileStatusScreenRouteProp = RouteProp<RootStackParamList, 'ProfileStatus'>;

type ProfileStatusScreenProps = {
  navigation: ProfileStatusScreenNavigationProp;
  route: ProfileStatusScreenRouteProp;
};

export default function ProfileStatusScreen({ navigation }: ProfileStatusScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState('public');
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} iconSize={22} style={styles.backButtonMargin} />
          <Text style={styles.headerTitle}>Profile Status</Text>
        </View>

        {/* Options */}
        <View style={styles.content}>
          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>Public</Text>
            <TouchableOpacity onPress={() => setSelectedStatus('public')}>
              <View style={[
                styles.radioOuter,
                selectedStatus === 'public' ? styles.radioSelected : styles.radioUnselected
              ]}>
                {selectedStatus === 'public' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>Private</Text>
            <TouchableOpacity onPress={() => setSelectedStatus('private')}>
              <View style={[
                styles.radioOuter,
                selectedStatus === 'private' ? styles.radioSelected : styles.radioUnselected
              ]}>
                {selectedStatus === 'private' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              Alert.alert('Saved', 'Profile status has been saved.', [
                {
                  text: 'OK',
                  onPress: () => navigation.replace('ProfileScreen'),
                },
              ]);
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Bottom Navigation */}
        <View style={{ paddingBottom: insets.bottom }}>
          <CustomBottomNav />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20, // reduced
    paddingTop: 70, // reduced
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 25, // reduced
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10, // reduced
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // reduced
    paddingTop: 20, // reduced
  },
  optionContainer: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12, // reduced
    padding: 12, // reduced
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20, // reduced
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 15, // reduced
    color: '#000000',
  },
  radioOuter: {
    width: 22, // reduced
    height: 22, // reduced
    borderRadius: 11, // reduced
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#7B61FF',
  },
  radioUnselected: {
    borderColor: '#D1D5DB',
  },
  radioInner: {
    width: 10, // reduced
    height: 10, // reduced
    borderRadius: 5, // reduced
    backgroundColor: '#7B61FF',
  },
  saveButtonContainer: {
    paddingHorizontal: 20, // reduced
    marginBottom: 30, // reduced
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#7B61FF',
    paddingVertical: 12, // reduced
    borderRadius: 20, // reduced
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // reduced
    fontWeight: '600',
  },
  backButtonMargin: {
    marginBottom: 20,
  },
});

type RootStackParamList = {
  // ...other screens
  ProfileStatus: undefined;
  ProfileScreen: undefined;
  // ...other screens
};