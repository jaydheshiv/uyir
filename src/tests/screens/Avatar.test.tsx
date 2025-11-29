import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import Avatar from '../../screens/Avatar';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'Avatar',
        key: 'Avatar-key',
    }),
}));

// Mock Zustand stores
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: {
            id: 1,
            user_id: 1,
            avatar_id: 123,
            avatar_name: 'Test Avatar',
        },
        setUser: jest.fn(),
    })),
    useAvatar: jest.fn(() => ({
        avatar: {
            avatarId: 123,
            avatarUrl: null,
            avatarName: 'Test Avatar',
        },
        setAvatarUrl: jest.fn(),
        setAvatarName: jest.fn(),
        syncAvatarFromUser: jest.fn(),
    })),
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
    launchCamera: jest.fn(),
    launchImageLibrary: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock fetch API
globalThis.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
            Promise.resolve({
                avatar_id: 123,
                avatar_name: 'Test Avatar',
                avatar_dob: '2000-01-01',
                avatar_about_me: 'Test about me',
                avatar_url: 'https://example.com/avatar.jpg',
            }),
        text: () => Promise.resolve(''),
    })
) as jest.Mock;

describe('Avatar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Avatar screen', async () => {
        const { getByText } = render(<Avatar />);

        await waitFor(() => {
            expect(getByText('Edit Avatar')).toBeTruthy();
        });
    });

    it('displays loading state initially', () => {
        const { getByText } = render(<Avatar />);
        expect(getByText('Loading avatar data...')).toBeTruthy();
    });

    it('fetches avatar data on mount', async () => {
        render(<Avatar />);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/avatar/123'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token',
                    }),
                })
            );
        });
    });

    it('displays form fields after loading', async () => {
        const { getByText, getByPlaceholderText } = render(<Avatar />);

        await waitFor(() => {
            expect(getByText('Username')).toBeTruthy();
            expect(getByText('DoB')).toBeTruthy();
            expect(getByText('About me')).toBeTruthy();
            expect(getByPlaceholderText('Enter username')).toBeTruthy();
        });
    });

    it('displays save button', async () => {
        const { getByText } = render(<Avatar />);

        await waitFor(() => {
            expect(getByText('Save')).toBeTruthy();
        });
    });

    it('displays delete avatar button', async () => {
        const { getByText } = render(<Avatar />);

        await waitFor(() => {
            expect(getByText('Delete Avatar')).toBeTruthy();
        });
    });
});
