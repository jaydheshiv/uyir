import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface RadioGroupProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, selected, onSelect }) => (
  <View>
    {options.map(opt => (
      <TouchableOpacity key={opt.value} style={styles.row} onPress={() => onSelect(opt.value)}>
        <View style={[styles.circle, selected === opt.value && styles.selected]} />
        <Text style={styles.label}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  circle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#8170FF',
    marginRight: 10, alignItems: 'center', justifyContent: 'center',
  },
  selected: { backgroundColor: '#8170FF' },
  label: { fontSize: 16, color: '#000' },
});

export default RadioGroup;