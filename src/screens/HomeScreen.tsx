import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  white: '#fff',
  black: '#000',
  gray: '#888',
};

const SPACING = {
  lg: 24,
  md: 16,
  xl: 32,
};

const FONT_SIZES = {
  xxl: 32,
  md: 16,
};

// Simple Button component as a placeholder for '@components'
const Button = ({ title, onPress, variant }: { title: string; onPress: () => void; variant?: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.button,
      { backgroundColor: variant === 'primary' ? COLORS.black : COLORS.gray }
    ]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Uyir!</Text>
      <Text style={styles.subtitle}>
        Your React Native app is ready to go.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={handlePress}
          variant="primary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  button: {
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
});

export default HomeScreen;
