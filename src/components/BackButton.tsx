import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  iconColor?: string;
  iconSize?: number;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  iconColor = '#000',
  iconSize = 24,
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 28.8,
    alignItems: 'flex-start',
    zIndex: 2,
    padding: 0,
    backgroundColor: 'transparent',
  },
});

export default BackButton;