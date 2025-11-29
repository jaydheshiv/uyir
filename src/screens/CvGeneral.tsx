import { useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const initialCards = [
  { title: 'Twin Window', active: true },
  { title: 'About', active: true },
  { title: 'Subscribe', active: true },
  { title: 'Book Session', active: true },
  { title: 'Donation', active: false },
];

const CvGeneral: React.FC = () => {
  const navigation = useNavigation();
  const [cards, setCards] = useState(initialCards);

  const handleToggle = (idx: number) => {
    setCards(prev => prev.map((card, i) => i === idx ? { ...card, active: !card.active } : card));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Visibility</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <View style={styles.scrollContent}>
        <Text style={styles.sectionTitle}>General</Text>
        <Text style={styles.sectionDesc}>Select which data are visible on your public profile.</Text>
        <FlatList
          data={cards}
          keyExtractor={(_, idx) => idx.toString()}
          style={styles.flatListMaxHeight}
          showsVerticalScrollIndicator={true}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleToggle(index)} activeOpacity={0.7}>
              <View style={[styles.radioCircle, !item.active && styles.radioInactive]} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNavWrapper}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 49.5,
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
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -30,
    marginTop: 9,
    fontFamily: 'Outfit',
  },
  editIcon: {
    padding: 2.7,
    borderRadius: 16.2,
    marginBottom: 57.6,
    marginLeft: 60,
  },
  scrollContent: {
    paddingHorizontal: 10.8,
    paddingTop: 5.4,
    paddingBottom: 18,
    gap: 9,
  },
  sectionTitle: {
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 3.6,
    marginTop: -30,
    fontFamily: 'Outfit',
    marginLeft: 5,
  },
  sectionDesc: {
    fontSize: 12.6,
    color: '#222',
    marginBottom: 17.1,
    fontFamily: 'Outfit-Regular',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12.6,
    paddingVertical: 12.6,
    paddingHorizontal: 12.6,
    marginBottom: 9,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    elevation: 0,
  },
  radioCircle: {
    width: 19.8,
    height: 19.8,
    borderRadius: 9.9,
    borderWidth: 4,
    borderColor: '#8170FF',
    marginRight: 10.8,
    backgroundColor: '#F7F7F7',
  },
  radioInactive: {
    borderColor: '#7e7e80ff',
    backgroundColor: '#F7F7FF',
  },
  cardTitle: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  saveButton: {
    backgroundColor: '#8170FF',
    borderRadius: 18,
    paddingVertical: 10.8,
    alignItems: 'center',
    marginTop: 170,
    marginBottom: 21.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14.4,
    fontFamily: 'Outfit',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 13.5,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 14.4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  flatListMaxHeight: {
    maxHeight: 324,
  },
});

export default CvGeneral;
