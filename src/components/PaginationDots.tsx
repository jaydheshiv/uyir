import React from 'react';
import { View, StyleSheet } from 'react-native';

type PaginationDotsProps = {
  count: number;
  activeIndex: number;
};

export default function PaginationDots({ count, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.paginationDots}>
      {Array.from({ length: count }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.dot,
            idx === activeIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#6C5CE7',
  },
});