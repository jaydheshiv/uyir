import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ProLite from '../../screens/ProLite';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'ProLite',
        key: 'ProLite-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => children,
}));

describe('ProLite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the ProLite screen', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('Pro Lite')).toBeTruthy();
    });

    it('displays Lite and Plus tabs', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('Pro Lite')).toBeTruthy();
        expect(getByText('Pro Plus')).toBeTruthy();
    });

    it('displays feature list', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('Twin Creation')).toBeTruthy();
        expect(getByText('Chat Interface (Text/Voice)')).toBeTruthy();
    });

    it('displays Subscribe Now button', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('Subscribe Now')).toBeTruthy();
    });

    it('allows switching between Lite and Plus plans', () => {
        const { getByText } = render(<ProLite />);
        const plusTab = getByText('Pro Plus');

        fireEvent.press(plusTab);
        expect(plusTab).toBeTruthy();
    });

    it('displays subscription pricing', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('₹199/month')).toBeTruthy();
    });

    it('displays feature list', () => {
        const { getByText } = render(<ProLite />);
        expect(getByText('Twin Creation')).toBeTruthy();
        expect(getByText('Session Booking (1:1)')).toBeTruthy();
    });
});
