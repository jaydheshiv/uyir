import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const PaymentSuccessful: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
          onPress={() => navigation.navigate('LetUsKnowYou')}
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
    paddingHorizontal: 18,
  },
  circlesContainer: {
    marginBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 234,
    height: 234,
    borderRadius: 117,
    backgroundColor: '#D8F5E6', // success-lighter
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#A3E9C7', // success-light
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 135,
    height: 135,
    borderRadius: 67.5,
    backgroundColor: '#22C55E', // success
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 36,
  },
  successTitle: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 7.2,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  successSubtitle: {
    fontSize: 14.4,
    color: '#222',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
  },
  ctaButton: {
    width: width - 40,
    backgroundColor: '#8170FF',
    paddingVertical: 13.5,
    borderRadius: 23.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -30,
    bottom: -90,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default PaymentSuccessful;
