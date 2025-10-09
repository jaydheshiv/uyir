import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const sessions = [
  { from: 'Emly White', time: '1:30 PM', date: '30/08/2025', status: 'Start' },
  ...Array(12).fill({ from: 'John Doe', time: '1 Hour', date: '20/08/2025', status: 'Completed' })
];

const ComingSessions: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      {/* Header with Back Arrow aligned */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleNoMargin]}>All Booked Sessions</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_3]}>From</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex0_9]}>Time</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Date</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_1]}>Status</Text>
        </View>
        <FlatList
          data={sessions}
          keyExtractor={(_, idx) => idx.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellFlex1]}>{item.from}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex0_9Center]}>{item.time}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex1_5Center]}>{item.date}</Text>
              <View style={styles.statusContainer}>
                {item.status === 'Start' ? (
                  <TouchableOpacity style={styles.startBtn}>
                    <Text style={styles.startBtnText}>Start</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.completedText}>Completed</Text>
                )}
              </View>
            </View>
          )}
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  editBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
    // Remove negative margin to avoid overlap
  },
  tableWrapper: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    paddingBottom: 8,
    flex: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  tableHeaderCell: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  startBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 22,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  completedText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  headerTitleNoMargin: {
    marginLeft: 0,
  },
  tableCellFlex1_3: {
    flex: 1.3,
  },
  tableCellFlex0_9: {
    flex: 0.9,
  },
  tableCellFlex1_5: {
    flex: 1.5,
  },
  tableCellFlex1_1: {
    flex: 1.1,
  },
  tableCellFlex1: {
    flex: 1,
  },
  tableCellFlex0_9Center: {
    flex: 0.9,
    textAlign: 'center',
  },
  tableCellFlex1_5Center: {
    flex: 1.5,
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default ComingSessions;
