import React from 'react';
import { View, StyleSheet } from 'react-native';

type ProgressBarProps = {
  progress: number; // 0 to 1
};

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 0,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
});