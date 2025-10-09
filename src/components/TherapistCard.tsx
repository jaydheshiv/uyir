import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressBar from '../components/ProgressBar';

type TherapistCardProps = {
  image: string;
  name: string;
  experience: string;
  price: string;
  onProfilePress?: () => void;
  therapyType: string;
  therapyDesc: string;
  availableVia: string;
  activeDot?: number;
  totalDots?: number;
};

export default function TherapistCard({
  image,
  name,
  experience,
  price,
  onProfilePress,
  therapyType,
  therapyDesc,
  availableVia,
  activeDot = 0,
  totalDots = 3,
}: TherapistCardProps) {
  return (
    <View style={styles.therapistCard}>
      <View style={styles.therapistCardTop}>
        <Image source={{ uri: image }} style={styles.therapistImage} resizeMode="cover" />
        <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', marginLeft: 12 }}>
          <Text style={styles.therapistName}>{name}</Text>
          <Text style={styles.therapistExp}>{experience}</Text>
          <Text style={styles.therapistPrice}>{price}</Text>
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.therapyInfo}>
        <Text style={styles.therapyTitle}>{therapyType}</Text>
        <Text style={styles.therapyDesc}>{therapyDesc}</Text>
        <Text style={styles.therapyAvailableLabel}>Available online via:</Text>
        <Text style={styles.therapyAvailable}>{availableVia}</Text>
      </View>
      <ProgressBar progress={0.46} />
      <View style={styles.paginationDots}>
        {Array.from({ length: totalDots }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === activeDot && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  therapistCard: {
    backgroundColor: '#E7E3FF',
    borderRadius: 20,
    marginTop: 2,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  therapistCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingBottom: 9,
  },
  therapistImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  therapistName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    textAlign: 'left',
  },
  therapistExp: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    textAlign: 'left',
  },
  therapistPrice: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'left',
  },
  profileButton: {
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  profileButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '500',
  },
  therapyInfo: {
    backgroundColor: '#fff',
    opacity: 0.85,
    padding: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  therapyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  therapyDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 18,
  },
  therapyAvailableLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  therapyAvailable: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#6C5CE7',
  },
});