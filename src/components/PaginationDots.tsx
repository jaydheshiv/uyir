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
    paddingVertical: 9,
    backgroundColor: 'transparent',
  },
  dot: {
    width: 7.2,
    height: 7.2,
    borderRadius: 3.6,
    backgroundColor: '#fff',
    marginHorizontal: 3.6,
  },
  dotActive: {
    backgroundColor: '#6C5CE7',
  },
});