import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Edit } from 'lucide-react-native';
import CustomBottomNav from '../components/CustomBottomNav';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  CvKnowledgeBase: undefined;
  CvGeneral: undefined; // Add this line
  // add other screens here if needed
};

const ContentVisibility: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
      <View style={styles.menuWrapper}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('CvKnowledgeBase')}>
          <Text style={styles.menuText}>Knowledge Base</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('CvGeneral')}>
          <Text style={styles.menuText}>General</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
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
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 4,
    borderRadius: 20,
    marginBottom: 80,
    marginLeft: 70,
  },
  menuWrapper: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});

export default ContentVisibility;