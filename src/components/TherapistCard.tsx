import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      {totalDots > 0 && (
        <>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  therapistCard: {
    backgroundColor: '#E7E3FF',
    borderRadius: 18,
    marginTop: 1.8,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1.8 },
  },
  therapistCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16.2,
    paddingBottom: 8.1,
  },
  therapistImage: {
    width: 81,
    height: 81,
    borderRadius: 18,
    marginRight: 7.2,
    backgroundColor: '#ccc',
  },
  therapistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 3.6,
    textAlign: 'left',
  },
  therapistExp: {
    fontSize: 13.5,
    color: '#222',
    marginBottom: 1.8,
    textAlign: 'left',
  },
  therapistPrice: {
    fontSize: 12.6,
    color: '#222',
    fontWeight: '500',
    marginBottom: 10.8,
    textAlign: 'left',
  },
  profileButton: {
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 9,
    paddingVertical: 5.4,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  profileButtonText: {
    color: '#6C5CE7',
    fontSize: 14.4,
    fontWeight: '500',
  },
  therapyInfo: {
    backgroundColor: '#fff',
    opacity: 0.85,
    padding: 14.4,
    paddingTop: 9,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  therapyTitle: {
    fontSize: 14.4,
    fontWeight: '600',
    color: '#222',
    marginBottom: 1.8,
  },
  therapyDesc: {
    fontSize: 11.7,
    color: '#888',
    marginBottom: 16.2,
  },
  therapyAvailableLabel: {
    fontSize: 10.8,
    color: '#888',
    marginBottom: 1.8,
  },
  therapyAvailable: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#222',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 7.2,
    height: 7.2,
    borderRadius: 3.6,
    backgroundColor: '#fff',
    marginHorizontal: 3.6,
  },
  dotActive: {
    backgroundColor: '#6C5CE7',
  },
});