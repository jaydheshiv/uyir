import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 34,
    marginTop: 30,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Bold' : undefined,
  },
  description: {
    fontSize: 18,
    color: '#222',
    marginBottom: 0,
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Regular' : undefined,
    lineHeight: 26,
    maxWidth: 340,
  },
  ctaButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: '#7C6BFF',
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Outfit-Medium' : undefined,
  },
});

export default SeePlans;