import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  SeePlans: undefined;
  ProLite: undefined;
};

const SeePlans: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Hide the status bar */}
      <StatusBar hidden />

      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Unlock pro features</Text>

      {/* Description */}
      <Text style={styles.description}>
        Create your public twin, connect emotionally, and grow your audience.
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('ProLite')}
      >
        <Text style={styles.ctaButtonText}>See Plans</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 32,
    paddingHorizontal: 18,
  },
  backButton: {
    marginBottom: 21.6,
    marginTop: 27,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 23.4,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10.8,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  description: {
    fontSize: 14.4,
    color: '#222',
    marginBottom: 0,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
    lineHeight: 19.8,
    maxWidth: 270,
  },
  ctaButton: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 49.5,
    backgroundColor: '#7C6BFF',
    height: 46.8,
    borderRadius: 23.4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16.2,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default SeePlans;
