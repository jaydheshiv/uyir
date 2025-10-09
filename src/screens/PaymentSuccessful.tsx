import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

// Replace 'RootStackParamList' with your actual stack param list type
type RootStackParamList = {
  CreateAvatar3: undefined;
  // add other screens here if needed
};

const PaymentSuccessful: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'CreateAvatar3'>>();

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.centerContent}>
        {/* Concentric Circles with Checkmark */}
        <View style={styles.circlesContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="checkmark" size={70} color="#fff" />
              </View>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successSubtitle}>You're now a Pro!</Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('CreateAvatar3')}
        >
          <Text style={styles.ctaButtonText}>Create Your Twin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circlesContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#D8F5E6', // success-lighter
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#A3E9C7', // success-light
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#22C55E', // success
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 60,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  ctaButton: {
    width: width - 48,
    backgroundColor: '#8170FF',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -150,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default PaymentSuccessful;