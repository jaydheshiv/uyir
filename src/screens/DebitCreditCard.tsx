import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';

const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const DebitCreditCard: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  // Check if all fields are filled (currently unused but may be needed for validation)
  // const _isFormComplete =
  //   cardNumber.trim() &&
  //   expiryMonth.trim() &&
  //   expiryYear.trim() &&
  //   cvv.trim() &&
  //   name.trim();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.header}>Debit/Credit Card</Text>

      {/* Card Type Selector */}
      <View style={styles.cardTypeContainer}>
        <TouchableOpacity
          style={[styles.cardTypeButton, cardType === 'debit' && styles.cardTypeButtonActive]}
          onPress={() => setCardType('debit')}
        >
          <Text style={[styles.cardTypeText, cardType === 'debit' && styles.cardTypeTextActive]}>
            Debit Card
          </Text>
          {cardType === 'debit' && <View style={styles.cardTypeUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardTypeButton, cardType === 'credit' && styles.cardTypeButtonActive]}
          onPress={() => setCardType('credit')}
        >
          <Text style={[styles.cardTypeText, cardType === 'credit' && styles.cardTypeTextActive]}>
            Credit Card
          </Text>
          {cardType === 'credit' && <View style={styles.cardTypeUnderline} />}
        </TouchableOpacity>
      </View>

      {/* Card Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.inputCardNumber}
          value={cardNumber}
          onChangeText={text => setCardNumber(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      {/* Expiry Date and CVV */}
      <View style={styles.row}>
        <View style={styles.flexContainer}>
          <Text style={styles.label}>Expiry Date</Text>
          <View style={styles.expiryRow}>
            <View style={styles.expiryPickerContainer}>
              <Picker
                selectedValue={expiryMonth}
                style={styles.expiryPicker}
                onValueChange={setExpiryMonth}
                mode="dropdown"
              >
                <Picker.Item label="MM" value="" />
                {months.map((month) => (
                  <Picker.Item key={month} label={month} value={month} />
                ))}
              </Picker>
              <Ionicons
                name="chevron-down"
                size={20}
                color="#222"
                style={styles.expiryChevron}
              />
            </View>
            <TextInput
              style={styles.expiryInput}
              value={expiryYear}
              onChangeText={text => setExpiryYear(text.replace(/[^0-9]/g, ''))}
              placeholder="YY"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>
        <View style={styles.cvvContainer}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.cvvInput}
            value={cvv}
            onChangeText={text => setCvv(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.inputName}
          value={name}
          onChangeText={text => setName(text.replace(/[^a-zA-Z ]/g, ''))}
        />
      </View>

      {/* Confirm Payment Button */}
      <TouchableOpacity
        style={[styles.confirmButton, styles.confirmButtonActive]}
        disabled={false}
        onPress={() => navigation.navigate('PaymentSuccessful')}
      >
        <Text style={[styles.confirmButtonText, styles.confirmButtonTextActive]}>
          Confirm Payment
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
    marginBottom: 24,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 40,
    marginTop: 0,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    marginBottom: 42,
    height: 41,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cardTypeButton: {
    flex: 1,
    height: 41,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardTypeButtonActive: {},
  cardTypeText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  cardTypeTextActive: {
    color: '#8170FF',
    fontWeight: '600',
  },
  cardTypeUnderline: {
    position: 'absolute',
    bottom: -8,
    left: 52,
    width: 74,
    height: 3,
    backgroundColor: '#8170FF',
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    fontWeight: '400',
  },
  inputCardNumber: {
    height: 48,
    borderWidth: 2,
    borderColor: '#8170FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  expiryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expiryPickerContainer: {
    position: 'relative',
    width: 87,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10,
  },
  expiryPicker: {
    width: 87,
    height: 58,
    color: '#222',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  expiryChevron: {
    position: 'absolute',
    right: 8,
    top: 14,
    pointerEvents: 'none',
  },
  expiryInput: {
    width: 87,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  cvvContainer: {
    width: 87,
  },
  cvvInput: {
    width: 87,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputName: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  confirmButton: {
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
  confirmButtonActive: {
    backgroundColor: '#8170FF',
  },
  confirmButtonText: {
    color: '#222',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButtonTextActive: {
    color: '#fff',
  },
  flexContainer: {
    flex: 1,
  },
});

export default DebitCreditCard;