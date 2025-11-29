import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

const people = [
  { name: 'Ashley Kamin', img: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { name: 'Amber Spiers', img: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Simon Pickford', img: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { name: 'Kristina Pickles', img: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

const shareOptions = [
  { name: 'AirDrop', icon: { uri: 'https://static.wikia.nocookie.net/logopedia/images/8/8e/AirDrop_2025.png/revision/latest?cb=20250613183320' } },
  { name: 'Messages', icon: { uri: 'https://static.wikia.nocookie.net/logopedia/images/9/9c/Messages_2025.png/revision/latest?cb=20250613061810' } },
  { name: 'Mail', icon: { uri: 'https://static.wikia.nocookie.net/logopedia/images/2/29/Mail_2025.png/revision/latest?cb=20250918063530' } },
  { name: 'Notes', icon: { uri: 'https://static.wikia.nocookie.net/logopedia/images/a/ac/Apple_Notes_2025.png/revision/latest?cb=20250611213323' } },
];

const Invite: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sharing Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://wallpapers.com/images/hd/sadhguru-sitting-and-smilling-4grkugynnnp8zhf2.jpg' }}
          style={styles.profileImg}
        />
        <View style={styles.profileInfoRow}>
          <View style={styles.flexContainer}>
            <Text style={styles.profileName}>Sadhguru</Text>
            <Text style={styles.profileDesc}>You can now connect{`\n`}with me on</Text>
            <Text style={styles.profileUyir}>UYIR</Text>
          </View>
          <Image
            source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://uyir.app' }}
            style={styles.qrCode}
          />
        </View>
      </View>

      {/* People on UYIR */}
      <View style={styles.peopleSection}>
        <Text style={styles.peopleTitle}>People on UYIR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.peopleRow}>
          {people.map((p, idx) => (
            <View key={idx} style={styles.personCard}>
              <Image source={{ uri: p.img }} style={styles.personImg} />
              <Text style={styles.personName}>{p.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Share Options */}
      <View style={styles.shareSection}>
        <Text style={styles.shareMore}>MORE</Text>
        <View style={styles.shareRow}>
          {shareOptions.map((opt, idx) => (
            <View key={idx} style={styles.iosShareCard}>
              <View style={styles.iosShareIconWrapper}>
                <Image source={opt.icon} style={styles.iosShareIcon} />
              </View>
              <Text style={styles.iosShareName}>{opt.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 0,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16.2,
    paddingBottom: 16.2,
    backgroundColor: '#F7F7F7',
  },
  backBtn: {
    padding: 3.6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginRight: 7.2,
  },
  headerTitle: {
    fontSize: 25.2,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'Outfit-Bold',
    marginLeft: 36,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 28.8,
    marginHorizontal: 16.2,
    marginBottom: 45,
    marginTop: 45,
    padding: 16.2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  profileImg: {
    width: width - 80,
    height: 198,
    borderRadius: 21.6,
    marginBottom: 10.8,
    borderWidth: 3,
    borderColor: '#4B3AFF',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 7.2,
  },
  profileName: {
    fontSize: 19.8,
    fontWeight: 'bold',
    color: '#7C6BFF',
    marginBottom: 1.8,
    fontFamily: 'Outfit-Bold',
  },
  profileDesc: {
    fontSize: 14.4,
    color: '#222',
    marginBottom: 1.8,
    fontFamily: 'Outfit-Regular',
  },
  profileUyir: {
    fontSize: 19.8,
    color: '#2196F3',
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  qrCode: {
    width: 72,
    height: 72,
    marginLeft: 10.8,
    borderRadius: 10.8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#EDEBFA',
  },
  peopleSection: {
    marginHorizontal: 16.2,
    marginBottom: 10.8,
  },
  peopleTitle: {
    fontSize: 16.2,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 7.2,
    fontFamily: 'Outfit-Bold',
  },
  peopleRow: {
    flexDirection: 'row',
  },
  personCard: {
    alignItems: 'center',
    marginRight: 16.2,
  },
  personImg: {
    width: 57.6,
    height: 57.6,
    borderRadius: 28.8,
    marginBottom: 3.6,
  },
  personName: {
    fontSize: 12.6,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
    maxWidth: 72,
  },
  shareSection: {
    marginHorizontal: 16.2,
    marginBottom: 16.2,
  },
  shareMore: {
    fontSize: 14.4,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 7.2,
    fontFamily: 'Outfit-Bold',
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7.2,
    marginHorizontal: 7.2,
  },
  iosShareCard: {
    width: 57.6,
    alignItems: 'center',
    marginHorizontal: 7.2,
  },
  iosShareIconWrapper: {
    width: 57.6,
    height: 57.6,
    backgroundColor: '#fff',
    borderRadius: 16.2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 3.6,
  },
  iosShareIcon: {
    width: 39.6,
    height: 39.6,
    resizeMode: 'contain',
  },
  iosShareName: {
    fontSize: 11.7,
    color: '#222',
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
    marginTop: 1.8,
  },
  flexContainer: {
    flex: 1,
  },
});

export default Invite;

