import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';

interface LabeledInputProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, containerStyle, inputStyle, ...props }) => (
  <View style={[styles.container, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={[styles.input, inputStyle]} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 16, color: '#000', marginBottom: 8, fontWeight: '500' },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
});

export default LabeledInput;