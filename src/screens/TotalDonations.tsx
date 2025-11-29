import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const donations = Array(15).fill({
  from: 'John Doe',
  amount: '$25',
  date: '2023-01-15',
});

const TotalDonations: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      {/* Header with Back Arrow aligned */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleNoMargin]}>All Donations</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex2]}>From</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Amount</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex2]}>Date</Text>
        </View>
        <FlatList
          data={donations}
          keyExtractor={(_, idx) => idx.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellFlex2]}>{item.from}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex1]}>{item.amount}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex2]}>{item.date}</Text>
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
    paddingTop: 54,
    paddingHorizontal: 16.2,
    paddingBottom: 16.2,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 3.6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  editBtn: {
    padding: 3.6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  headerTitle: {
    fontSize: 25.2,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
    // Remove negative margin to avoid overlap
  },
  tableWrapper: {
    marginHorizontal: 16.2,
    marginTop: 7.2,
    backgroundColor: '#fff',
    borderRadius: 21.6,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    paddingBottom: 7.2,
    flex: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 14.4,
    paddingHorizontal: 16.2,
    backgroundColor: '#fff',
  },
  tableHeaderCell: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 12.6,
    paddingHorizontal: 16.2,
    backgroundColor: '#fff',
  },
  tableCell: {
    fontSize: 14.4,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  headerTitleNoMargin: {
    marginLeft: 0,
  },
  tableCellFlex2: {
    flex: 2,
  },
  tableCellFlex1_5: {
    flex: 1.5,
  },
  tableCellFlex1: {
    flex: 1,
  },
  bottomNavContainer: {
    marginBottom: 31.5,
  },
});

export default TotalDonations;

