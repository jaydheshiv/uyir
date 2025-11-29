import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity
    style={[styles.button, style, disabled && { opacity: 0.6 }]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.text, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderColor: '#8170FF',
    borderWidth: 1.5,
    borderRadius: 21.6,
    height: 43.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 0,
    width: '100%',
  },
  text: {
    color: '#8170FF',
    fontSize: 14.4,
    fontWeight: '600',
  },
});

export default SecondaryButton;