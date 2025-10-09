import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

export default function ModalOverlay(props: ViewProps) {
  return <View style={[styles.overlay, props.style]} {...props} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
  },
});