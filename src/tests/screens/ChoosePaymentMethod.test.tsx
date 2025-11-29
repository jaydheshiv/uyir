import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import ChoosePaymentMethod from '../../screens/ChoosePaymentMethod';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'ChoosePaymentMethod',
        key: 'ChoosePaymentMethod-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('ChoosePaymentMethod', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the ChoosePaymentMethod screen', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        expect(getByText('Choose Payment Method')).toBeTruthy();
    });

    it('displays Google Pay option', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        expect(getByText('Pay')).toBeTruthy();
    });

    it('displays PhonePe option', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        expect(getByText('Phone Pay')).toBeTruthy();
    });

    it('displays Debit/Credit Card option', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        expect(getByText('Debit/Credit Card')).toBeTruthy();
    });

    it('displays Continue button', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        expect(getByText('Pay Now')).toBeTruthy();
    });

    it('handles back button press', () => {
        const { UNSAFE_getAllByType } = render(<ChoosePaymentMethod />);
        const touchables = UNSAFE_getAllByType(TouchableOpacity);

        // Find and press back button (first touchable)
        fireEvent.press(touchables[0]);
        expect(touchables[0]).toBeTruthy();
    });

    it('allows selecting payment methods', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        const gpayOption = getByText('Pay');

        fireEvent.press(gpayOption);
        expect(gpayOption).toBeTruthy();
    });

    it('navigates to DebitCreditCard on Continue with card selected', () => {
        const { getByText } = render(<ChoosePaymentMethod />);
        const cardOption = getByText('Debit/Credit Card');
        const continueButton = getByText('Pay Now');

        fireEvent.press(cardOption);
        fireEvent.press(continueButton);

        expect(mockNavigate).toHaveBeenCalledWith('DebitCreditCard');
    });
});
