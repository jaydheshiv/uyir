import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ProfileSettings from '../../screens/ProfileSettings';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'ProfileSettings',
        key: 'profile-settings-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' },
    }),
}));

// Mock image picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
}));

// Mock imagekit
jest.mock('../../lib/imagekit', () => ({
    getImagekitUrlFromSrc: jest.fn((url) => url),
    applyPreset: jest.fn((url) => url),
}));

describe('ProfileSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({
                    professional: {
                        display_name: 'Test Professional',
                        greeting: 'Welcome!',
                        about: 'About me text',
                    },
                }),
            })
        ) as jest.Mock;
    });

    it('renders correctly', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('Profile Settings')).toBeTruthy();
        });
    });

    it('fetches professional profile on mount', async () => {
        render(<ProfileSettings />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://dev.api.uyir.ai:8081/professional/',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                    }),
                })
            );
        });
    });

    it('displays profile media section', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('Profile Media')).toBeTruthy();
            expect(getByText('Cover Photo')).toBeTruthy();
        });
    });

    it('displays creator details section', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('Creator Details')).toBeTruthy();
            expect(getByText('Creator Name')).toBeTruthy();
            expect(getByText('Greetings')).toBeTruthy();
        });
    });

    it('displays about me section', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('About Me')).toBeTruthy();
        });
    });

    it('displays save button', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('Save')).toBeTruthy();
        });
    });

    it('displays upload new picture button', async () => {
        const { getByText } = render(<ProfileSettings />);

        await waitFor(() => {
            expect(getByText('Upload New Picture')).toBeTruthy();
        });
    });
});
