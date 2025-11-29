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
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
    paddingHorizontal: 18,
  },
  backButton: {
    marginBottom: 16.2,
    marginTop: 14.4,
    alignSelf: 'flex-start',
  },
  header: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 25.2,
    marginTop: 0,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 12.6,
    marginBottom: 28.8,
    height: 34.2,
    alignItems: 'center',
    paddingHorizontal: 3.6,
  },
  cardTypeButton: {
    flex: 1,
    height: 34.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardTypeButtonActive: {},
  cardTypeText: {
    fontSize: 12.6,
    color: '#222',
    fontWeight: '500',
  },
  cardTypeTextActive: {
    color: '#8170FF',
    fontWeight: '600',
  },
  cardTypeUnderline: {
    position: 'absolute',
    bottom: -6,
    left: 39.6,
    width: 57.6,
    height: 2.7,
    backgroundColor: '#8170FF',
    borderRadius: 9,
  },
  inputGroup: {
    marginBottom: 16.2,
  },
  label: {
    fontSize: 12.6,
    color: '#222',
    marginBottom: 5.4,
    fontWeight: '400',
  },
  inputCardNumber: {
    height: 39.6,
    borderWidth: 2,
    borderColor: '#8170FF',
    borderRadius: 9,
    paddingHorizontal: 10.8,
    fontSize: 13.5,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 16.2,
  },
  expiryRow: {
    flexDirection: 'row',
    gap: 5.4,
  },
  expiryPickerContainer: {
    position: 'relative',
    width: 68.4,
    height: 39.6,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 9,
  },
  expiryPicker: {
    width: 68.4,
    height: 45,
    color: '#222',
    fontSize: 13.5,
    backgroundColor: 'transparent',
  },
  expiryChevron: {
    position: 'absolute',
    right: 5.4,
    top: 10.8,
    pointerEvents: 'none',
  },
  expiryInput: {
    width: 68.4,
    height: 39.6,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 9,
    paddingHorizontal: 7.2,
    fontSize: 13.5,
    backgroundColor: '#fff',
  },
  cvvContainer: {
    width: 68.4,
  },
  cvvInput: {
    width: 68.4,
    height: 39.6,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 9,
    paddingHorizontal: 7.2,
    fontSize: 13.5,
    backgroundColor: '#fff',
  },
  inputName: {
    height: 39.6,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 9,
    paddingHorizontal: 10.8,
    fontSize: 13.5,
    backgroundColor: '#fff',
  },
  confirmButton: {
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
  confirmButtonActive: {
    backgroundColor: '#8170FF',
  },
  confirmButtonText: {
    color: '#222',
    fontSize: 14.4,
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
