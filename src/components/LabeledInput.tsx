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
  container: { marginBottom: 21.6 },
  label: { fontSize: 14.4, color: '#000', marginBottom: 7.2, fontWeight: '500' },
  input: {
    width: '100%',
    height: 43.2,
    borderRadius: 10.8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    paddingHorizontal: 14.4,
    fontSize: 14.4,
    color: '#000',
  },
});

export default LabeledInput;