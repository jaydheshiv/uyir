import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { RootStackParamList } from '../navigation/AppNavigator';

const subscribers = Array(15).fill({
  name: 'John Doe',
  tier: 'Pro Tier',
  since: '2023-01-15',
});

const TotalSubscribers: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      {/* Header with Back Arrow aligned */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, styles.headerTitleNoMargin]}>
          All Subscribers
        </Text>
        <TouchableOpacity style={styles.editBtn}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Table */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1_5]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex2_3]}>Tier Subscriber</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellFlex1]}>Since</Text>
        </View>
        <FlatList
          data={subscribers}
          keyExtractor={(_, idx) => idx.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellFlex1_7]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex1_6]}>{item.tier}</Text>
              <Text style={[styles.tableCell, styles.tableCellFlex1_3]}>{item.since}</Text>
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
  },
  tableCell: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
  },
  headerTitleNoMargin: {
    marginLeft: 0,
  },
  tableCellFlex1_5: {
    flex: 1.5,
  },
  tableCellFlex2_3: {
    flex: 2.3,
  },
  tableCellFlex1: {
    flex: 1,
  },
  tableCellFlex1_7: {
    flex: 1.7,
  },
  tableCellFlex1_6: {
    flex: 1.6,
  },
  tableCellFlex1_3: {
    flex: 1.3,
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default TotalSubscribers;