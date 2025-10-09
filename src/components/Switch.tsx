import React from 'react';
import { Switch as RNSwitch } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ value, onValueChange }) => (
  <RNSwitch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: '#ccc', true: '#8170FF' }}
    thumbColor={value ? '#fff' : '#fff'}
  />
);

export default Switch;