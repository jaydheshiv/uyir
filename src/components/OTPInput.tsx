import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  inputStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 4,
  inputStyle,
  containerStyle,
}) => {
  const inputs = Array(length).fill(0);
  const refs = useRef<TextInput[]>([]);

  const handleChange = (text: string, idx: number) => {
    let newValue = value.split('');
    if (text.length > 1) {
      // Handle paste
      newValue = text.split('').slice(0, length);
      onChange(newValue.join(''));
      if (newValue.length < length) {
        refs.current[newValue.length]?.focus();
      }
      return;
    }
    if (text) {
      newValue[idx] = text[text.length - 1];
      onChange(newValue.join('').slice(0, length));
      if (idx < length - 1) {
        refs.current[idx + 1]?.focus();
      }
    } else {
      newValue[idx] = '';
      onChange(newValue.join(''));
      if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
    }
  };

  return (
    <View style={[styles.row, containerStyle]}>
      {inputs.map((_, idx) => (
        <TextInput
          key={idx}
          ref={ref => { refs.current[idx] = ref!; }}
          style={[
            styles.input,
            inputStyle,
            value.length === idx ? styles.active : {},
            value[idx] ? styles.filled : {},
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={value[idx] || ''}
          onChangeText={text => handleChange(text, idx)}
          autoFocus={idx === 0}
          returnKeyType="next"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    gap: 20, // more space between boxes
    marginBottom: 16,
    alignItems: 'flex-start',
    marginLeft: 0 // adjust as needed for your layout
  },
  input: {
    width: 68, // bigger width
    height: 68, // bigger height
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 16,
    fontSize: 32,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  active: {
    borderColor: '#2196F3',
  },
  filled: {
    borderColor: '#000',
  },
});

export default OTPInput;