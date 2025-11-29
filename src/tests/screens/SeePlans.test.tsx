import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import SeePlans from '../../screens/SeePlans';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'SeePlans',
        key: 'SeePlans-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('SeePlans', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the SeePlans screen', () => {
        const { getByText } = render(<SeePlans />);
        expect(getByText('Unlock pro features')).toBeTruthy();
    });

    it('displays description text', () => {
        const { getByText } = render(<SeePlans />);
        expect(getByText(/Create your public twin/i)).toBeTruthy();
    });

    it('displays See Plans button', () => {
        const { getByText } = render(<SeePlans />);
        expect(getByText('See Plans')).toBeTruthy();
    });

    it('handles back button press', () => {
        const { UNSAFE_getAllByType } = render(<SeePlans />);
        const touchables = UNSAFE_getAllByType(TouchableOpacity);

        // First touchable is back button
        fireEvent.press(touchables[0]);
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('navigates to ProLite on button press', () => {
        const { getByText } = render(<SeePlans />);
        const button = getByText('See Plans');

        fireEvent.press(button);

        expect(mockNavigate).toHaveBeenCalledWith('ProLite');
    });
});
