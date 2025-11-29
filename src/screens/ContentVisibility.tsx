import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

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
    paddingTop: 49.5,
    paddingHorizontal: 18,
    paddingBottom: -30,
    marginLeft: -64,
    backgroundColor: '#F7F7F7',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 0.9,
    borderRadius: 16.2,
    marginBottom: 75.6,
    marginLeft: 60.4,
  },
  headerTitle: {
    fontSize: 21.6,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'left',
    marginLeft: -24,
    marginTop: 7.2,
    fontFamily: 'Outfit',
  },
  editIcon: {
    padding: 2.7,
    borderRadius: 16.2,
    marginBottom: 75.6,
    marginLeft: 50.4,
  },
  menuWrapper: {
    paddingHorizontal: 10.8,
    paddingTop: 0,
    paddingBottom: 18,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16.2,
    paddingVertical: 21.6,
    paddingHorizontal: 18,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 17.1,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22.5,
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});

export default ContentVisibility;
