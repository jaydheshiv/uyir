import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

export default function ModalCard({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.modalContainer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#F7F7F9',
    borderTopLeftRadius: 25.2,
    borderTopRightRadius: 25.2,
    paddingBottom: 21.6,
    paddingTop: 0,
    paddingHorizontal: 0,
    width: '100%',
    alignSelf: 'center',
    zIndex: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});