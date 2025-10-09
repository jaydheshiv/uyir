import React from 'react';
import { Picker } from '@react-native-picker/picker';

interface DropdownProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
}

const Dropdown: React.FC<DropdownProps> = ({ selectedValue, onValueChange, items }) => (
  <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
    {items.map(item => (
      <Picker.Item key={item.value} label={item.label} value={item.value} />
    ))}
  </Picker>
);

export default Dropdown;