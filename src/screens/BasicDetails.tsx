import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BasicDetailsForm from '../components/BasicDetailsForm';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BasicDetails: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Mobile Layout */}
      {!isTablet && (
        <View style={styles.mobileLayout}>
          <BasicDetailsForm />
        </View>
      )}

      {/* Tablet and Desktop Layout */}
      {isTablet && (
        <View style={styles.tabletLayout}>
          <View style={styles.formCard}>
            <BasicDetailsForm />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 8,
  },
  mobileLayout: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  tabletLayout: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    paddingTop: 100,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    padding: 24,
  },
});

export default BasicDetails;
