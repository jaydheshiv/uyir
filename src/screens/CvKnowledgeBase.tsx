import { useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const initialCards = [
  { title: 'My First Trip Abroad', date: '20/07/2021', active: true },
  { title: 'University Graduation', date: '20/07/2021', active: true },
  { title: 'Project Alpha Launch', date: '20/07/2021', active: true },
  { title: 'A weekend in the mountains', date: '20/07/2021', active: true },
  { title: 'Yoga Day', date: '20/07/2021', active: true },
  { title: 'Meditation tips', date: '20/07/2021', active: true },
  { title: 'Foundational Course', date: '20/07/2021', active: false },
];

const CvKnowledgeBase: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
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
        <Text style={styles.sectionTitle}>Knowledge Base</Text>
        <Text style={styles.sectionDesc}>Select which data are visible on your public profile.</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search"
            placeholderTextColor="#777"
          />
          <Ionicons name="search" size={24} color="#777" style={styles.searchIconMargin} />
        </View>
        <FlatList
          data={cards}
          keyExtractor={(_, idx) => idx.toString()}
          style={styles.flatListMaxHeight}
          showsVerticalScrollIndicator={true}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleToggle(index)} activeOpacity={0.7}>
              <View style={[styles.radioCircle, !item.active && styles.radioInactive]} />
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('CvKnowledgeBase1')}>
          <Text style={styles.nextButtonText}>Next</Text>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 0,
    marginLeft: -80,
    marginBottom: -30,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 1,
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
  editIcon: {
    padding: 1,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 10,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 0,
    fontFamily: 'Outfit',
  },
  sectionDesc: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    fontFamily: 'Outfit-Regular',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    borderRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 10,
    marginTop: -4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    paddingVertical: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#D1C9F7',
    elevation: 0,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#8170FF',
    marginRight: 16,
    backgroundColor: '#F7F7F7',
  },
  radioInactive: {
    borderColor: '#7e7e80ff',
    backgroundColor: '#F7F7FF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  cardDate: {
    fontSize: 15,
    color: '#868686',
    fontFamily: 'Outfit-Regular',
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: '#8170FF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Outfit',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchIconMargin: {
    marginLeft: 8,
  },
  flatListMaxHeight: {
    maxHeight: 420,
  },
  flex1: {
    flex: 1,
  },
});

export default CvKnowledgeBase;