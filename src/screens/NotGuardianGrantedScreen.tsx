import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

const NotGuardianGrantedScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image
          source={{ uri: 'https://api.builder.io/api/v1/image/assets/TEMP/0f0b390f934e1017ad65a69c8ca4b213847e2cca?width=500' }}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          We didn't receive permission from your guardian yet. You won't be able to create an avatar or share memories until we do
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.changeGuardianButton}>
          <Text style={styles.changeGuardianText}>Change Guardian</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendButtonText}>Resend Consent Form</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 21.6,
  },
  illustrationContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 28.8,
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: 225,
    height: 150.3,
  },
  messageContainer: {
    marginBottom: 43.2,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 7.2,
  },
  messageText: {
    color: '#000',
    fontSize: 16.2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Outfit' : undefined,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 310.5,
    alignSelf: 'center',
  },
  changeGuardianButton: {
    height: 50.4,
    borderWidth: 1,
    borderColor: '#9D90FF',
    borderRadius: 25.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14.4,
    backgroundColor: 'transparent',
  },
  changeGuardianText: {
    color: '#000',
    fontSize: 14.4,
    fontWeight: '500',
  },
  resendButton: {
    height: 50.4,
    backgroundColor: '#8170FF',
    borderRadius: 25.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 14.4,
    fontWeight: '500',
  },
});

export default NotGuardianGrantedScreen;

