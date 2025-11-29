import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import SupportPage from '../../screens/SupportPage';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'SupportPage',
        key: 'SupportPage-test',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: 'test-token',
        user: {
            email: 'test@example.com',
            user_id: '123',
        },
    }),
}));

// Mock fetch
globalThis.fetch = jest.fn();

describe('SupportPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders support page correctly', () => {
        render(<SupportPage />);

        expect(screen.getByText('Support')).toBeTruthy();
        expect(screen.getByText('Hi')).toBeTruthy();
        expect(screen.getByText('How can we help?')).toBeTruthy();
    });

    test('displays message card', () => {
        render(<SupportPage />);

        expect(screen.getByText('Send us a message')).toBeTruthy();
        expect(screen.getByText('We reach back in 24-48 hours')).toBeTruthy();
    });

    test('displays FAQ section', () => {
        render(<SupportPage />);

        expect(screen.getByText('FAQ')).toBeTruthy();
        expect(screen.getByText('How to setup my profile?')).toBeTruthy();
        expect(screen.getByText('How to upgrade to pro?')).toBeTruthy();
        expect(screen.getByText('How to share my capsule?')).toBeTruthy();
        expect(screen.getByText('How do I create my avatar?')).toBeTruthy();
        expect(screen.getByText('How to delete my account?')).toBeTruthy();
    });

    test('navigates to SupportPage1 when message card pressed', () => {
        render(<SupportPage />);

        const messageCard = screen.getByText('Send us a message');
        fireEvent.press(messageCard);

        expect(mockNavigate).toHaveBeenCalledWith('SupportPage1');
    });
});
