import { render } from '@testing-library/react-native';
import React from 'react';
import CreateAccountScreen from '../../screens/CreateAccountScreen';

// Mock LabeledInput
jest.mock('../../components/LabeledInput', () => {
    const { View, Text, TextInput } = require('react-native');
    return (props: any) => (
        <View>
            <Text>{props.label}</Text>
            <TextInput
                value={props.value}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
                secureTextEntry={props.secureTextEntry}
                keyboardType={props.keyboardType}
            />
        </View>
    );
});

describe('CreateAccountScreen', () => {
    it('renders the CreateAccountScreen', () => {
        const { getByText } = render(<CreateAccountScreen />);
        expect(getByText('Email')).toBeTruthy();
        expect(getByText('Password')).toBeTruthy();
    });

    it('displays email input field', () => {
        const { getByPlaceholderText } = render(<CreateAccountScreen />);
        expect(getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('displays password input field', () => {
        const { getByPlaceholderText } = render(<CreateAccountScreen />);
        expect(getByPlaceholderText('Enter password')).toBeTruthy();
    });

    it('has email and password labels', () => {
        const { getByText } = render(<CreateAccountScreen />);
        expect(getByText('Email')).toBeTruthy();
        expect(getByText('Password')).toBeTruthy();
    });
});
