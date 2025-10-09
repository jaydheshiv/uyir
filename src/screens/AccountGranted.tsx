import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  // ...other screens if needed
};
const AccountGranted: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/6161ad6eb60dd794952493588dfa688018716b59?width=340' }}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.message}>
          Your space is now ready. Start adding moments, talking to your companion, and creating a timeline that's truly yours.
        </Text>
      </View>
      {/* Bottom fixed Go to Home button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.ctaButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    backgroundColor: '#fff',
  },
  statusTime: { fontSize: 17, fontWeight: '600', color: '#000' },
  statusIcons: { flexDirection: 'row', alignItems: 'center' },
  signalBars: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 8 },
  signalBar: {
    width: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    marginRight: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  illustration: {
    width: 170,
    height: 201,
    marginBottom: 32,
  },
  message: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  ctaButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#8170FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  homeIndicatorContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  homeIndicator: {
    width: 139,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 2.5,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 80, // Increase this value to move the button higher above the bottom
    backgroundColor: '#fff',
  },
});

export default AccountGranted;
