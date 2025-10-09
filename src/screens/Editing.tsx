import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

type RootStackParamList = {
  ProfileSettings: undefined;
  SubscriptionSettings: undefined;
  SessionSettings: undefined;
  KnowledgeBase: undefined;
  ContentVisibility: undefined;
};

export default function Editing() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Public View</Text>
        <TouchableOpacity style={styles.editIcon}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('ProfileSettings')}>
          <Text style={styles.menuText}>Profile Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('SubscriptionSettings')}>
          <Text style={styles.menuText}>Subscription Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('SessionSettings')}>
          <Text style={styles.menuText}>Session Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('KnowledgeBase')}>
          <Text style={styles.menuText}>Knowledge Base</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('ContentVisibility')}>
          <Text style={styles.menuText}>Content Visibility</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit',
  },
  bottomNavMargin: {
    marginBottom: 30,
  },
});