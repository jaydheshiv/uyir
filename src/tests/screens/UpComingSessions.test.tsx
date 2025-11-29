import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import UpComingSessions from '../../screens/UpComingSessions';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'UpComingSessions',
        key: 'UpComingSessions-key',
    }),
}));

// Mock useAuth
const mockUseAuth = {
    token: 'test-token',
    user: {
        userId: 'user-123',
    },
};

jest.mock('../../store', () => ({
    useAuth: () => mockUseAuth,
}));

// Mock LIVEKIT_CONFIG
jest.mock('../../config/livekit.config', () => ({
    LIVEKIT_CONFIG: {
        url: 'wss://test.livekit.cloud',
    },
    getGenerateCallLinkEndpoint: () => '/generate-call-link',
}));

// Mock CustomBottomNav
import CustomBottomNav from '../../components/CustomBottomNav';
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Declare global fetch for TypeScript
declare var global: any;

// Mock fetch
global.fetch = jest.fn();

const mockSessionsResponse = {
    items: [
        {
            session_id: 'session-1',
            professional_id: 'pro-1',
            user_id: 'user-1',
            start_time: '2024-01-15T10:00:00Z',
            end_time: '2024-01-15T11:00:00Z',
            call_duration: 3600,
            call_status: 'completed',
            created_at: '2024-01-15T09:00:00Z',
        },
        {
            session_id: 'session-2',
            professional_id: 'pro-1',
            user_id: 'user-2',
            start_time: '2024-01-16T14:00:00Z',
            end_time: '2024-01-16T15:00:00Z',
            call_status: 'scheduled',
            created_at: '2024-01-16T13:00:00Z',
        },
    ],
    next_cursor: null,
};

describe('UpComingSessions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders the UpComingSessions screen', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSessionsResponse,
        });

        const { getByText } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(getByText(/All Booked Sessions/i)).toBeTruthy();
        });
    });

    it('handles loading state', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [], next_cursor: null }),
        });

        const { getByText } = render(<UpComingSessions />);
        await waitFor(() => {
            expect(getByText(/No sessions/i)).toBeTruthy();
        });
    });

    it('renders without crashing', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [], next_cursor: null }),
        });

        const { getByText } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(getByText(/All Booked Sessions/i)).toBeTruthy();
        });
    });

    it('displays empty state when no sessions', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [], next_cursor: null }),
        });

        const { getByText } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(getByText(/No sessions/i)).toBeTruthy();
        });
    });

    it('displays table headers', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [], next_cursor: null }),
        });

        const { getByText } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(getByText('User ID')).toBeTruthy();
            expect(getByText('Time')).toBeTruthy();
        });
    });

    it('handles empty session list', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [], nextCursor: null }),
        });

        const { getByText } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(getByText(/No sessions/i)).toBeTruthy();
        });
    });

    it('renders CustomBottomNav component', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSessionsResponse,
        });

        const { UNSAFE_getByType } = render(<UpComingSessions />);

        await waitFor(() => {
            expect(UNSAFE_getByType(CustomBottomNav)).toBeTruthy();
        });
    });
});
