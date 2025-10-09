import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomBottomNav from '../components/CustomBottomNav';

const visualizations = [
  {
    id: 1,
    date: "Sun, Jun 3",
    time: "8:40am",
    emotion: "Joyful",
    emotionColor: "#FF6CA2",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/967d7642b4734c51e2a729aa6d598fc237cdd71b?width=670",
    textColor: "#7A7A7A",
    selected: false,
  },
  {
    id: 2,
    date: "Sat, Jun 2",
    time: "11:40am",
    emotion: "Vulnerable",
    emotionColor: "#00FFBB",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/249f25e956f04c88d57fbcead36a93fad0b0999a?width=670",
    textColor: "#FFFFFF",
    selected: false,
  },
  {
    id: 3,
    date: "Sat, Jun 2",
    time: "11:40am",
    emotion: "Empathetic",
    emotionColor: "#00FFBB",
    image: "https://api.builder.io/api/v1/image/assets/TEMP/013cc36e1e16ff035594e62d821d1635a9a13f4e?width=678",
    textColor: "#FFFFFF",
    selected: true,
  },
];

import type { StackNavigationProp } from '@react-navigation/stack';

type VisualizationsProps = {
  navigation: StackNavigationProp<any>;
};

function Visualizations({ navigation }: VisualizationsProps) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Visualizations</Text>

      {/* Visualization Cards */}
      <ScrollView
        style={styles.scrollViewFlex}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {visualizations.map((viz) => (
          <View
            key={viz.id}
            style={[
              styles.card,
              viz.selected && styles.cardSelected
            ]}
          >
            <Image
              source={{ uri: viz.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.overlayText}>
              <Text style={styles.cardDate}>
                {viz.date}
                {'\n'}
                {viz.time}
              </Text>
              <Text style={[styles.cardEmotion, { color: viz.emotionColor }]}>
                {viz.emotion}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation - exactly as Avatarhome1 */}
      <View style={styles.bottomNavContainer}>
        <CustomBottomNav
          onClockPress={() => navigation.navigate('Visualizations')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Outfit',
    fontWeight: '400',
    marginLeft: 24,
    marginTop: 90,
    marginBottom: 20,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#E7E4FF',
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 16.2,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 220,
    borderRadius: 22,
  },
  overlayText: {
    position: 'absolute',
    top: 20,
    left: 18,
  },
  cardDate: {
    fontSize: 15,
    fontFamily: 'Roboto',
    marginBottom: 0,
    lineHeight: 16,
    fontWeight: '400',
    color: '#7A7A7A', // Ensure the text color is always gray
    opacity: 0.8,     // Slightly faded for a soft look
  },
  cardEmotion: {
    fontSize: 18,
    fontFamily: 'Lora',
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 130,
  },
  scrollViewFlex: {
    flex: 1,
  },
  cardSelected: {
    borderColor: '#6C5CE7',
    borderWidth: 2,
  },
  bottomNavContainer: {
    marginBottom: 25,
  },
});

export default Visualizations;