import { useNavigation } from '@react-navigation/native';
import { Edit, Info } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

export default function SessionSettings() {
  const navigation = useNavigation();
  const [showInfo, setShowInfo] = useState(false);
  const [price, setPrice] = useState('5');
  const uyirFee = 0.15;
  const tierPrice = parseFloat(price) || 0;
  const feeAmount = tierPrice * uyirFee;
  const youEarn = tierPrice - feeAmount;
  const [duration, setDuration] = useState('60');
  // Placeholder for calendar selection
  const [_selectedDate, _setSelectedDate] = useState('2025-01-08');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      {/* Header: Editing.tsx style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Settings</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Session Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Configuration</Text>
          <Text style={styles.inputLabel}>Define the price and duration for your sessions.</Text>
          <View style={styles.inputRow}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Duration</Text>
              <TextInput
                style={styles.textInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="60 minutes"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1MarginLeft}>
              <Text style={styles.inputLabel}>Price per session</Text>
              <View style={styles.priceInputRow}>
                <TextInput
                  style={[styles.textInput, styles.priceInputFlex]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="$5"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="numeric"
                />
                <View style={styles.infoIconPosition}>
                  <TouchableOpacity onPress={() => setShowInfo(v => !v)}>
                    <Info color="#6C5CE7" size={20} />
                  </TouchableOpacity>
                  {showInfo && (
                    <View style={[styles.infoBox, styles.infoBoxPosition, { left: undefined }]}> {/* Pop above and near right of icon */}
                      <Text style={styles.infoTitle}>Earnings updates</Text>
                      <View style={styles.infoRow}><Text style={styles.infoText}>Tier Price</Text><Text style={styles.infoValue}>{`$${tierPrice.toFixed(2)}`}</Text></View>
                      <View style={styles.infoRow}><Text style={styles.infoText}>Uyir Fee (15%)</Text><Text style={styles.infoValue}>{`-$${feeAmount.toFixed(2)}`}</Text></View>
                      <View style={styles.infoRow}><Text style={styles.infoText}>You Earn</Text><Text style={styles.infoEarn}>{`$${youEarn.toFixed(2)}`}</Text></View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.noteText}>Note : The maximum range you can be setting up should not go beyond 250$</Text>
        </View>

        {/* Availability Section */}
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Select the dates on which you will be available.</Text>
          {/* Placeholder calendar UI */}
          <View style={styles.calendarBox}>
            <Text style={styles.calendarMonth}>January 2025</Text>
            <View style={styles.calendarRow}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <Text key={day} style={styles.calendarDay}>{day}</Text>
              ))}
            </View>
            {/* Example days, highlight selected */}
            <View style={styles.calendarGrid}>
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 8;
                return (
                  <Text key={day} style={[styles.calendarDate, isSelected && styles.selectedDate]}>{day}</Text>
                );
              })}
            </View>
          </View>
          <View style={styles.timeRow}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>START TIME</Text>
              <TextInput
                style={styles.textInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder=""
                placeholderTextColor="#BDBDBD"
              />
            </View>
            <View style={styles.flex1MarginLeft}>
              <Text style={styles.inputLabel}>END TIME</Text>
              <TextInput
                style={styles.textInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder=""
                placeholderTextColor="#BDBDBD"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavMargin}>
        <CustomBottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 0,
    marginLeft: -80,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 1,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  editIcon: {
    padding: 4,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -30,
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    padding: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    marginBottom: 8,
  },
  infoBox: {
    position: 'absolute',
    right: 0,
    bottom: 36,
    width: 170,
    backgroundColor: '#fff',
    borderColor: '#6C5CE7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    zIndex: 2,
    elevation: 2,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#222',
  },
  infoValue: {
    color: '#222',
    fontWeight: 'bold',
  },
  infoEarn: {
    color: '#6C5CE7',
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 13,
    color: '#222',
    marginTop: 8,
    marginLeft: 2,
  },
  calendarBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1C9F7',
    padding: 12,
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calendarDay: {
    fontSize: 13,
    color: '#222',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDate: {
    fontSize: 15,
    color: '#222',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
    borderRadius: 16,
    margin: 1,
    backgroundColor: 'transparent',
  },
  selectedDate: {
    backgroundColor: '#FFEB3B',
    color: '#222',
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  saveButton: {
    marginTop: 8,
    width: '100%',
    height: 48,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  flex1: {
    flex: 1,
  },
  flex1MarginLeft: {
    flex: 1,
    marginLeft: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  priceInputFlex: {
    flex: 1,
    paddingRight: 36,
  },
  infoIconPosition: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  infoBoxPosition: {
    right: 0,
    bottom: 36,
  },
  bottomNavMargin: {
    marginBottom: 30,
  },
});