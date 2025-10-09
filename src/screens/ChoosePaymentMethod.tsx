import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  // ...other routes...
  DebitCreditCard: undefined;
};

const ChoosePaymentMethod: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<'gpay' | 'phonepe' | null>(null);

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Choose Payment Method</Text>

      {/* Payment Options */}
      <View style={styles.optionsContainer}>
        {/* Google Pay */}
        <TouchableOpacity
          style={[
            styles.optionRow,
            selected === 'gpay' && styles.optionRowActive,
          ]}
          onPress={() => setSelected('gpay')}
        >
          <Ionicons name="logo-google" size={28} color="#4285F4" style={styles.optionIcon} />
          <Text style={styles.optionText}>Pay</Text>
        </TouchableOpacity>

        {/* PhonePe */}
        <TouchableOpacity
          style={[
            styles.optionRow,
            selected === 'phonepe' && styles.optionRowActive,
          ]}
          onPress={() => setSelected('phonepe')}
        >
          <View style={[styles.optionIcon, styles.phonePeIcon]}>
            <Text style={styles.phonePeText}>पे</Text>
          </View>
          <Text style={styles.optionText}>Phone Pay</Text>
        </TouchableOpacity>

        {/* Debit/Credit Card */}
        <TouchableOpacity
          style={styles.optionRowJustify}
          onPress={() => navigation.navigate('DebitCreditCard')}
        >
          <Text style={styles.optionText}>Debit/Credit Card</Text>
          <Ionicons name="chevron-forward" size={22} color="#222" />
        </TouchableOpacity>

        {/* Internet Banking */}
        <TouchableOpacity style={styles.optionRowJustify}>
          <Text style={styles.optionText}>Internet Banking</Text>
          <Ionicons name="chevron-forward" size={22} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Pay Now Button */}
      <TouchableOpacity
        style={[
          styles.payNowButton,
          (selected === 'gpay' || selected === 'phonepe') && styles.payNowButtonActive,
        ]}
        disabled={!(selected === 'gpay' || selected === 'phonepe')}
      >
        <Text style={[
          styles.payNowText,
          (selected === 'gpay' || selected === 'phonepe') && styles.payNowTextActive,
        ]}>
          Pay Now
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 20,
    marginTop: 25,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 40,
    marginTop: 0,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 48,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
    height: 58,
    backgroundColor: '#fff',
  },
  optionRowActive: {
    borderColor: '#8170FF',
    backgroundColor: '#F3F0FF',
  },
  optionRowJustify: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 0,
    height: 58,
    backgroundColor: '#fff',
  },
  optionIcon: {
    marginRight: 10,
  },
  phonePeIcon: {
    backgroundColor: '#5F259F',
    borderRadius: 100,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  payNowButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 50,
    backgroundColor: '#E6E6E6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowButtonActive: {
    backgroundColor: '#8170FF',
  },
  payNowText: {
    color: '#222',
    fontSize: 18,
    fontWeight: '600',
  },
  payNowTextActive: {
    color: '#fff',
  },
});

export default ChoosePaymentMethod;