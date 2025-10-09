import { useNavigation } from '@react-navigation/native';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const { width } = Dimensions.get('window');

import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const MicrositePTView: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      {/* Header Image with Back Arrow and Edit Icon */}
      <View style={styles.headerImageWrapper}>
        <Image
          source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
          style={styles.headerImage}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={32} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Editing')}>
          <Edit color="black" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Profile Avatar Overlap with double border */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarOuterCircle}>
          <View style={styles.avatarInnerCircle}>
            <Image
              source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
              style={styles.avatarImg}
            />
          </View>
        </View>
      </View>

      {/* Name, Share Icon, Welcome Text */}
      <View style={styles.profileInfoWrapper}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>Sadhguru</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={() => navigation.navigate('Invite')}>
            <Ionicons name="share-social-outline" size={24} color="#6C5CE7" />
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome to your personal space !</Text>
      </View>

      {/* Stats Grid - clickable cards */}
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statsCard} onPress={() => navigation.navigate('TotalSubscribers')}>
          <Ionicons name="person-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
          <Text style={styles.statsValue}>1,234</Text>
          <Text style={styles.statsLabel}>Total Subscribers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statsCard} onPress={() => navigation.navigate('TotalDonations')}>
          <Ionicons name="gift-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
          <Text style={styles.statsValue}>$ 1,522</Text>
          <Text style={styles.statsLabel}>Total Donations Received</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statsCard} onPress={() => navigation.navigate('UpComingSessions')}>
          <Ionicons name="calendar-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
          <Text style={styles.statsValue}>200</Text>
          <Text style={styles.statsLabel}>Upcoming Sessions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statsCard} onPress={() => { /* TODO: handle Profile Shares click */ }}>
          <Ionicons name="share-social-outline" size={32} color="#6C5CE7" style={styles.statsIcon} />
          <Text style={styles.statsValue}>1,234</Text>
          <Text style={styles.statsLabel}>Profile Shares</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation (use shared component) */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImageWrapper: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 18,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 2,
  },
  editBtn: {
    position: 'absolute',
    top: 40,
    right: 18,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 4,
  },
  avatarWrapper: {
    position: 'absolute',
    top: 210,
    left: 25,
    zIndex: 3,
  },
  avatarOuterCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarImg: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  profileInfoWrapper: {
    marginTop: 80,
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },
  shareBtn: {
    backgroundColor: '#EDEBFA',
    borderRadius: 8,
    padding: 6,
  },
  welcomeText: {
    fontSize: 18,
    color: '#222',
    marginTop: 2,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 32,
  },
  statsCard: {
    width: width / 2 - 32,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#6C5CE7',
    padding: 18,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statsIcon: {
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 15,
    color: '#222',
    textAlign: 'center',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default MicrositePTView;
