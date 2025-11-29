import React, { useState } from 'react';
import { Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const avatars = [
  {
    id: 1,
    image: require('../assets/avatar-male.png'),
    alt: 'Male avatar option',
  },
  {
    id: 2,
    image: require('../assets/avatar-female.png'),
    alt: 'Female avatar option',
  },
];

const DefaultAvatar: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Select your twin</Text>
        <Text style={styles.subtitle}>Choose how you want your avatar to look.</Text>
        <View style={styles.avatarRow}>
          {avatars.map((avatar) => (
            <TouchableOpacity
              key={avatar.id}
              style={[styles.avatarButton, selectedAvatar === avatar.id && styles.avatarSelected]}
              onPress={() => setSelectedAvatar(avatar.id)}
              activeOpacity={0.8}
            >
              <Image source={avatar.image} style={styles.avatarImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Next Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Next"
          onPress={() => {/* handle next */ }}
          disabled={!selectedAvatar}
          style={styles.nextButtonSpacing}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: {
    flex: 1,
    paddingHorizontal: 21.6,
    paddingTop: 99,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 21.6,
    fontWeight: '700',
    color: '#000',
    marginBottom: 7.2,
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  subtitle: {
    fontSize: 14.4,
    color: '#000',
    marginBottom: 28.8,
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28.8,
    gap: 21.6,
  },
  avatarButton: {
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginHorizontal: 7.2,
    backgroundColor: '#F5F5F5',
  },
  avatarSelected: {
    borderColor: '#8170FF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 72,
  },
  bottomSection: {
    paddingHorizontal: 21.6,
    paddingBottom: 21.6,
    backgroundColor: '#fff',
  },
  nextButtonSpacing: {
    marginBottom: 14.4,
  },
});

export default DefaultAvatar;

