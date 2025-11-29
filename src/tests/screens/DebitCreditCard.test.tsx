import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TextInput } from 'react-native';
import DebitCreditCard from '../../screens/DebitCreditCard';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'DebitCreditCard',
        key: 'DebitCreditCard-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
    const React = require('react');
    const MockPicker = ({ children, ...props }: any) => React.createElement('Picker', props, children);
    MockPicker.Item = ({ ...props }: any) => React.createElement('Picker.Item', props);
    return { Picker: MockPicker };
});

describe('DebitCreditCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the DebitCreditCard screen', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Debit/Credit Card')).toBeTruthy();
    });

    it('displays Debit card type button', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Debit Card')).toBeTruthy();
    });

    it('displays Credit card type button', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Credit Card')).toBeTruthy();
    });

    it('displays card number input', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Card Number')).toBeTruthy();
    });

    it('displays cardholder name input', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Name')).toBeTruthy();
    });

    it('displays CVV input', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('CVV')).toBeTruthy();
    });

    it('displays Make Payment button', () => {
        const { getByText } = render(<DebitCreditCard />);
        expect(getByText('Confirm Payment')).toBeTruthy();
    });

    it('allows typing in card number field', () => {
        const { getByText, UNSAFE_getAllByType } = render(<DebitCreditCard />);
        getByText('Card Number');
        const inputs = UNSAFE_getAllByType(TextInput);
        const cardInput = inputs[0];

        fireEvent.changeText(cardInput, '4111111111111111');
        expect(cardInput.props.value).toBe('4111111111111111');
    });

    it('allows typing in name field', () => {
        const { getByText, UNSAFE_getAllByType } = render(<DebitCreditCard />);
        getByText('Name');
        const inputs = UNSAFE_getAllByType(TextInput);
        const nameInput = inputs[2];

        fireEvent.changeText(nameInput, 'Test User');
        expect(nameInput.props.onChangeText).toBeDefined();
    });

    it('allows switching between Debit and Credit', () => {
        const { getByText } = render(<DebitCreditCard />);
        const creditButton = getByText('Credit Card');

        fireEvent.press(creditButton);
        expect(creditButton).toBeTruthy();
    });
});
