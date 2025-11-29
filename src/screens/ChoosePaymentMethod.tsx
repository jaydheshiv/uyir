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
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
    paddingHorizontal: 18,
  },
  backButton: {
    marginBottom: 14.4,
    marginTop: 16.2,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 25.2,
    marginTop: 0,
  },
  optionsContainer: {
    gap: 14.4,
    marginBottom: 32.4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 7.2,
    paddingVertical: 9,
    paddingHorizontal: 12.6,
    marginBottom: 0,
    height: 45,
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
    borderRadius: 7.2,
    paddingVertical: 9,
    paddingHorizontal: 12.6,
    marginBottom: 0,
    height: 45,
    backgroundColor: '#fff',
  },
  optionIcon: {
    marginRight: 9,
  },
  phonePeIcon: {
    backgroundColor: '#5F259F',
    borderRadius: 90,
    width: 23.4,
    height: 23.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePeText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 14.4,
    color: '#222',
    fontWeight: '500',
  },
  payNowButton: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 49.5,
    backgroundColor: '#E6E6E6',
    height: 43.2,
    borderRadius: 21.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowButtonActive: {
    backgroundColor: '#8170FF',
  },
  payNowText: {
    color: '#222',
    fontSize: 14.4,
    fontWeight: '600',
  },
  payNowTextActive: {
    color: '#fff',
  },
});

export default ChoosePaymentMethod;
