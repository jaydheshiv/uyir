import { useNavigation } from '@react-navigation/native';
import { Edit, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useAuth } from '../store/useAppStore';

interface AvailabilitySlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  is_booked: boolean;
}

export default function SessionSettings() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [showInfo, setShowInfo] = useState(false);
  const [price, setPrice] = useState('5');
  const uyirFee = 0.15;
  const tierPrice = parseFloat(price) || 0;
  const feeAmount = tierPrice * uyirFee;
  const youEarn = tierPrice - feeAmount;
  const [duration, setDuration] = useState('60');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startMeridiem, setStartMeridiem] = useState<'AM' | 'PM'>('AM');
  const [endMeridiem, setEndMeridiem] = useState<'AM' | 'PM'>('AM');
  const [slotId, setSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  // Fetch existing availability slots on mount
  useEffect(() => {
    fetchAvailabilitySlots();
  }, []);

  const fetchAvailabilitySlots = async () => {
    setFetchingSlots(true);
    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/sessions/availability';

      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in {slots: []}
        const slots = Array.isArray(data) ? data : (data.slots || []);

        setAvailabilitySlots(slots);
      } else {
        console.log('Failed to fetch availability slots:', response.status);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setFetchingSlots(false);
    }
  };

  // Helper to format date and time to ISO8601
  const getISODateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    // Build a Date using local date/time then convert to an ISO string (includes timezone info)
    // This results in a proper ISO8601 timestamp like "2025-10-27T09:00:00.000Z" which many
    // backends expect for proper parsing and validation.
    try {
      const dt = new Date(`${date}T${time}:00`);
      if (isNaN(dt.getTime())) return '';
      return dt.toISOString();
    } catch (err) {
      console.warn('Failed to construct ISO datetime for', date, time, err);
      return `${date}T${time}:00`;
    }
  };

  // Format time input automatically (e.g., "500" -> "5:00", "530" -> "5:30")
  const formatTimeInput = (input: string) => {
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length === 1) return digits; // Just "5"
    if (digits.length === 2) return digits; // "05" or "12"

    // 3 or 4 digits: format as H:MM or HH:MM
    if (digits.length === 3) {
      // "500" -> "5:00"
      const hour = digits.substring(0, 1);
      const minute = digits.substring(1, 3);
      return `${hour}:${minute}`;
    }

    if (digits.length >= 4) {
      // "1030" -> "10:30"
      const hour = digits.substring(0, 2);
      const minute = digits.substring(2, 4);
      return `${hour}:${minute}`;
    }

    return input;
  };

  // Validate time format (HH:mm)
  const isValidTime = (time: string) => {
    // Accept 12-hour inputs like 1:00 - 12:59
    const timeRegex12 = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    return timeRegex12.test(time);
  };

  const to24Hour = (time12: string, meridiem: 'AM' | 'PM') => {
    // time12 expected in h:mm or hh:mm
    const parts = time12.split(':');
    if (parts.length !== 2) return '';
    let hour = parseInt(parts[0], 10);
    const minute = parts[1].padStart(2, '0');
    if (isNaN(hour)) return '';
    if (meridiem === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour = hour + 12;
    }
    const hh = hour.toString().padStart(2, '0');
    return `${hh}:${minute}`;
  };

  // Save or update slot
  const handleSave = async () => {
    // Validation
    if (!selectedDate || !startTime || !endTime) {
      Alert.alert('Missing Information', 'Please select date, start time, and end time');
      return;
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      Alert.alert('Invalid Time Format', 'Please enter time in 12-hour format like 5:00 and select AM/PM');
      return;
    }

    if (tierPrice <= 0 || tierPrice > 250) {
      Alert.alert('Invalid Price', 'Price must be between $1 and $250');
      return;
    }

    // Check if end time is after start time
    // Convert 12-hour inputs to 24-hour then compute minutes
    const start24 = to24Hour(startTime, startMeridiem);
    const end24 = to24Hour(endTime, endMeridiem);
    const [startHour, startMin] = start24.split(':').map(Number);
    const [endHour, endMin] = end24.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      Alert.alert('Invalid Time Range', 'End time must be after start time');
      return;
    }

    setLoading(true);
    // start24 and end24 already computed above (converted from 12-hour inputs)
    const startISO = getISODateTime(selectedDate, start24);
    const endISO = getISODateTime(selectedDate, end24);

    try {
      const backendUrl = 'http://dev.api.uyir.ai:8081/professional/sessions/availability';

      const body = {
        start_time: startISO,
        end_time: endISO,
        price_per_hour: tierPrice,
      };

      console.log('📤 === SAVING AVAILABILITY ===');
      console.log('📅 Selected Date:', selectedDate);
      console.log('🕐 Start Time (12h):', startTime, startMeridiem);
      console.log('🕐 End Time (12h):', endTime, endMeridiem);
      console.log('🕐 Start Time (24h):', start24);
      console.log('🕐 End Time (24h):', end24);
      console.log('📤 Request Body:', JSON.stringify(body, null, 2));
      console.log('💰 Price:', tierPrice);
      console.log('🔑 Token present:', !!token);

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Read response as text and attempt to parse JSON to capture validation errors (422)
      const respText = await response.text();
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Body:', respText);

      let data: any = null;
      try {
        data = respText ? JSON.parse(respText) : null;
        console.log('📥 Parsed Response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('⚠️ Response is not JSON');
        data = null;
      }

      if (response.ok) {
        Alert.alert('Success!', `Availability slot created for ${selectedDate}`, [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and refresh slots
              setSelectedDate('');
              setStartTime('');
              setEndTime('');
              setSlotId(null);
              fetchAvailabilitySlots();
            }
          }
        ]);
      } else {
        console.error('❌ Failed to save availability:', response.status, respText);

        // Handle overlap error specifically
        if (respText.includes('overlaps') || respText.includes('overlap')) {
          Alert.alert(
            'Slot Overlap Detected',
            'This time slot overlaps with an existing slot. Please refresh to see all slots or choose a different time.',
            [
              {
                text: 'Refresh Slots',
                onPress: () => fetchAvailabilitySlots(),
              },
              {
                text: 'OK',
                style: 'cancel',
              }
            ]
          );
        } else if (response.status === 400) {
          // 400 Bad Request - show detailed error
          const errDetail = (data && (data.detail || data.message)) || respText;
          Alert.alert(
            'Invalid Request (400)',
            `Backend error:\n\n${errDetail}\n\nCheck console logs for details.`,
            [
              {
                text: 'OK',
                style: 'cancel',
              }
            ]
          );
        } else {
          // Show helpful validation/error info returned from backend when available
          const errMsg = (data && (data.detail || data.message || JSON.stringify(data))) || respText || 'Failed to save availability';
          Alert.alert('Error', `Status ${response.status}:\n${errMsg}`);
        }
      }
    } catch (err) {
      console.error('❌ Error saving availability:', err);
      Alert.alert('Network Error', 'Could not connect to backend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a slot
  const handleDeleteSlot = async (slotId: string) => {
    Alert.alert(
      'Delete Availability',
      'Are you sure you want to delete this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const backendUrl = `http://dev.api.uyir.ai:8081/professional/sessions/availability/${slotId}`;

              const response = await fetch(backendUrl, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Availability slot deleted');
                fetchAvailabilitySlots();
              } else {
                Alert.alert('Error', 'Failed to delete slot');
              }
            } catch (err) {
              Alert.alert('Network Error', 'Could not connect to backend');
            }
          }
        }
      ]
    );
  };

  // Format date string for display
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Check if a session is completed (end time has passed)
  const isSessionCompleted = (endTime: string) => {
    const now = new Date();
    const sessionEnd = new Date(endTime);
    return now > sessionEnd;
  };

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
                    <View style={[styles.infoBox, styles.infoBoxPosition, { left: undefined }]}>
                      <Text style={styles.infoTitle}>Earnings updates</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>Tier Price</Text>
                        <Text style={styles.infoValue}>${tierPrice.toFixed(2)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>Uyir Fee (15%)</Text>
                        <Text style={styles.infoValue}>-${feeAmount.toFixed(2)}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoText}>You Earn</Text>
                        <Text style={styles.infoEarn}>${youEarn.toFixed(2)}</Text>
                      </View>
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
          {/* Real calendar picker */}
          <Calendar
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#FFEB3B' } } : {}}
            minDate={new Date().toISOString().split('T')[0]} // Only allow today and future dates
            theme={{
              selectedDayBackgroundColor: '#FFEB3B',
              todayTextColor: '#6C5CE7',
              arrowColor: '#6C5CE7',
              dotColor: '#6C5CE7',
              textDayFontFamily: 'Outfit-Regular',
              textMonthFontFamily: 'Outfit-Bold',
              textDayHeaderFontFamily: 'Outfit-Bold',
            }}
            style={{ marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D1C9F7' }}
          />
          <View style={styles.timeRow}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>START TIME</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={[styles.textInput, styles.timeInput]}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="e.g. 5:00"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="default"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.meridiemBtn}
                  onPress={() => setStartMeridiem((m) => (m === 'AM' ? 'PM' : 'AM'))}
                >
                  <Text style={styles.meridiemText}>{startMeridiem}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.flex1MarginLeft}>
              <Text style={styles.inputLabel}>END TIME</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={[styles.textInput, styles.timeInput]}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="e.g. 6:00"
                  placeholderTextColor="#BDBDBD"
                  keyboardType="default"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={styles.meridiemBtn}
                  onPress={() => setEndMeridiem((m) => (m === 'AM' ? 'PM' : 'AM'))}
                >
                  <Text style={styles.meridiemText}>{endMeridiem}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Availability</Text>
          )}
        </TouchableOpacity>

        {/* Existing Availability Slots */}
        {fetchingSlots ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={styles.loadingText}>Loading availability slots...</Text>
          </View>
        ) : availabilitySlots.length > 0 ? (
          <View style={styles.slotsSection}>
            <View style={styles.slotsSectionHeader}>
              <Text style={styles.sectionTitle}>Your Availability Slots</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchAvailabilitySlots}
              >
                <Ionicons name="refresh" size={18} color="#6C5CE7" />
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
            {availabilitySlots.map((slot) => (
              <View key={slot.slot_id} style={styles.slotCard}>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotTime}>
                    {formatDateTime(slot.start_time)} - {formatDateTime(slot.end_time)}
                  </Text>
                  <Text style={styles.slotPrice}>${slot.price_per_hour}/hour</Text>
                  <View style={styles.badgeContainer}>
                    {slot.is_booked && (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedText}>BOOKED</Text>
                      </View>
                    )}
                    {slot.is_booked && isSessionCompleted(slot.end_time) && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>COMPLETED</Text>
                      </View>
                    )}
                  </View>
                </View>
                {!slot.is_booked && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSlot(slot.slot_id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No availability slots yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first slot above to get started</Text>
            <TouchableOpacity
              style={styles.refreshButtonCentered}
              onPress={fetchAvailabilitySlots}
            >
              <Ionicons name="refresh" size={18} color="#6C5CE7" />
              <Text style={styles.refreshText}>Refresh Slots</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 45,
    paddingHorizontal: 18,
    paddingBottom: 0,
    marginLeft: -64,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 0.9,
    borderRadius: 16.2,
    marginBottom: 57.6,
    marginLeft: 60,
  },
  editIcon: {
    padding: 2.7,
    borderRadius: 16.2,
    marginBottom: 50.6,
    marginLeft: 60,
  },
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -24,
    marginTop: 10,
    fontFamily: 'Outfit',
  },
  scrollContent: {
    paddingHorizontal: 12.6,
    paddingBottom: 28.8,
    paddingTop: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14.4,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    padding: 12.6,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginBottom: 10.8,
  },
  inputLabel: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginBottom: 5.4,
    marginLeft: 2.7,
    marginTop: 5.4,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 5.4,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 9,
    backgroundColor: '#fff',
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    marginBottom: 5.4,
  },
  infoBox: {
    position: 'absolute',
    right: 0,
    bottom: 27,
    width: 135,
    backgroundColor: '#fff',
    borderColor: '#6C5CE7',
    borderWidth: 1,
    borderRadius: 9,
    padding: 7.2,
    zIndex: 2,
    elevation: 2,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 12.6,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2.7,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1.8,
  },
  infoText: {
    fontSize: 10.8,
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
    fontSize: 10.8,
    color: '#222',
    marginTop: 5.4,
    marginLeft: 1.8,
  },
  calendarBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1C9F7',
    padding: 9,
    marginBottom: 9,
  },
  calendarMonth: {
    fontSize: 12.6,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5.4,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2.7,
  },
  calendarDay: {
    fontSize: 10.8,
    color: '#222',
    width: 25.2,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDate: {
    fontSize: 12.6,
    color: '#222',
    width: 25.2,
    height: 25.2,
    textAlign: 'center',
    lineHeight: 25.2,
    borderRadius: 12.6,
    margin: 0.9,
    backgroundColor: 'transparent',
  },
  selectedDate: {
    backgroundColor: '#FFEB3B',
    color: '#222',
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 5.4,
  },
  saveButton: {
    marginTop: 5.4,
    width: '100%',
    height: 39.6,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 27,
    marginBottom: 14.4,
  },
  saveButtonDisabled: {
    backgroundColor: '#B8B3E6',
  },
  saveButtonText: {
    fontSize: 12.6,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  loadingText: {
    marginTop: 9,
    fontSize: 11.7,
    color: '#666',
    fontFamily: 'Outfit-Regular',
  },
  slotsSection: {
    marginTop: 9,
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5.4,
    borderRadius: 6.3,
    backgroundColor: '#F0EDFF',
    borderWidth: 1,
    borderColor: '#D1C9F7',
  },
  refreshButtonCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12.6,
    paddingVertical: 7.2,
    borderRadius: 6.3,
    backgroundColor: '#F0EDFF',
    borderWidth: 1,
    borderColor: '#D1C9F7',
    marginTop: 9,
  },
  refreshText: {
    fontSize: 11.7,
    fontWeight: '600',
    color: '#6C5CE7',
    marginLeft: 3.6,
    fontFamily: 'Outfit-SemiBold',
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    padding: 10.8,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotInfo: {
    flex: 1,
  },
  slotTime: {
    fontSize: 12.6,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2.7,
  },
  slotPrice: {
    fontSize: 11.7,
    color: '#6C5CE7',
    fontFamily: 'Outfit-Bold',
    marginBottom: 2.7,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5.4,
    marginTop: 2.7,
  },
  bookedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 5.4,
    paddingVertical: 2.7,
    borderRadius: 4.5,
    alignSelf: 'flex-start',
  },
  bookedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  completedBadge: {
    backgroundColor: '#9E9E9E',
    paddingHorizontal: 5.4,
    paddingVertical: 2.7,
    borderRadius: 4.5,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  deleteButton: {
    padding: 5.4,
    borderRadius: 6.3,
    backgroundColor: '#FFE5E5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 25.2,
    paddingHorizontal: 18,
  },
  emptyStateText: {
    fontSize: 12.6,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Outfit-SemiBold',
    marginBottom: 2.7,
  },
  emptyStateSubtext: {
    fontSize: 11.7,
    color: '#999',
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex1MarginLeft: {
    flex: 1,
    marginLeft: 9,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  priceInputFlex: {
    flex: 1,
    paddingRight: 27,
  },
  infoIconPosition: {
    position: 'absolute',
    right: 5.4,
    top: 9,
  },
  infoBoxPosition: {
    right: 0,
    bottom: 27,
  },
  bottomNavMargin: {
    marginBottom: 21.6,
  },
  // Time input with meridiem
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  meridiemBtn: {
    marginLeft: 5.4,
    paddingHorizontal: 9,
    paddingVertical: 5.4,
    borderRadius: 6.3,
    backgroundColor: '#EDEDED',
    borderWidth: 1,
    borderColor: '#D1C9F7',
  },
  meridiemText: {
    fontSize: 11.7,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
});
