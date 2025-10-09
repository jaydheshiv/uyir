import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

type QuestionOptionsProps = {
  question: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
};

const { width } = Dimensions.get('window');

export default function QuestionOptions({
  question,
  options,
  selectedOption,
  onSelect,
}: QuestionOptionsProps) {
  return (
    <View>
      <Text style={styles.questionText}>{question}</Text>
      <View>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedOption === option && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  questionText: {
    fontSize: 18,
    color: '#111',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 50,
    fontFamily: 'System',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 28,
    paddingVertical: 14,
    marginBottom: 14,
    backgroundColor: '#ECECEC',
    alignItems: 'center',
    width: width - 100,
    alignSelf: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#A393FA',
    borderColor: '#A393FA',
  },
  optionText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '400',
    fontFamily: 'System',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
});