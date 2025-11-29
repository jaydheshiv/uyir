import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import Editing from '../../screens/Editing';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Editing',
        key: 'Editing-test',
    }),
}));

// Mock Zustand store
const mockSetProfessionalData = jest.fn();
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: 'test-token',
    }),
    useProfessional: () => ({
        professionalData: {
            display_name: 'Dr. Smith',
            bio: 'Licensed therapist',
            specialization: 'Anxiety and Depression',
        },
        setProfessionalData: mockSetProfessionalData,
    }),
}));

// Mock fetch
globalThis.fetch = jest.fn();

// Mock image picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn((options, callback) => {
        callback({
            assets: [{ uri: 'file://test-image.jpg' }],
        });
    }),
}));

describe('Editing Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders editing screen correctly', () => {
        render(<Editing />);

        expect(screen.getByText(/edit public view/i)).toBeTruthy();
    });

    test('displays all menu options', () => {
        render(<Editing />);

        expect(screen.getByText('Profile Settings')).toBeTruthy();
        expect(screen.getByText('Subscription Settings')).toBeTruthy();
        expect(screen.getByText('Session Settings')).toBeTruthy();
        expect(screen.getByText('Knowledge Base')).toBeTruthy();
        expect(screen.getByText('Content Visibility')).toBeTruthy();
    });

    test('navigates to Profile Settings', () => {
        render(<Editing />);

        const profileButton = screen.getByText('Profile Settings');
        fireEvent.press(profileButton);

        expect(mockNavigate).toHaveBeenCalledWith('ProfileSettings');
    });

    test('navigates to Subscription Settings', () => {
        render(<Editing />);

        const subscriptionButton = screen.getByText('Subscription Settings');
        fireEvent.press(subscriptionButton);

        expect(mockNavigate).toHaveBeenCalledWith('SubscriptionSettings');
    });

    test('navigates to Session Settings', () => {
        render(<Editing />);

        const sessionButton = screen.getByText('Session Settings');
        fireEvent.press(sessionButton);

        expect(mockNavigate).toHaveBeenCalledWith('SessionSettings');
    });

    test('navigates to Knowledge Base', () => {
        render(<Editing />);

        const knowledgeButton = screen.getByText('Knowledge Base');
        fireEvent.press(knowledgeButton);

        expect(mockNavigate).toHaveBeenCalledWith('KnowledgeBase');
    });

    test('navigates to Content Visibility', () => {
        render(<Editing />);

        const visibilityButton = screen.getByText('Content Visibility');
        fireEvent.press(visibilityButton);

        expect(mockNavigate).toHaveBeenCalledWith('ContentVisibility');
    });
});
