import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HelperTextProps {
  message: string;
  error?: boolean;
}

const HelperText: React.FC<HelperTextProps> = ({ message, error }) => (
  <Text style={[styles.text, error && styles.error]}>{message}</Text>
);

const styles = StyleSheet.create({
  text: { fontSize: 10.8, color: '#888', marginTop: 3.6 },
  error: { color: '#FF3B30' },
});

export default HelperText;