import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import TotalSubscribers from '../../screens/TotalSubscribers';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'TotalSubscribers',
        key: 'TotalSubscribers-key',
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

// Mock CustomBottomNav
import CustomBottomNav from '../../components/CustomBottomNav';
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Declare global fetch for TypeScript
declare var global: any;

// Mock fetch
global.fetch = jest.fn();

const mockSubscribersResponse = {
    subscriber_count: 2,
    items: [
        {
            subscription_id: '1',
            user_id: 'user-1',
            professional_id: 'pro-1',
            status: 'active',
            amount: 99,
            created_at: '2024-01-01',
        },
        {
            subscription_id: '2',
            user_id: 'user-2',
            professional_id: 'pro-1',
            status: 'active',
            amount: 199,
            created_at: '2024-01-15',
        },
    ],
    next_cursor: null,
};

describe('TotalSubscribers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders the TotalSubscribers screen', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSubscribersResponse,
        });

        const { getByText } = render(<TotalSubscribers />);

        await waitFor(() => {
            expect(getByText('All Subscribers')).toBeTruthy();
        });
    });

    it('handles loading state', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ subscriber_count: 0, items: [], next_cursor: null }),
        });

        const { getByText } = render(<TotalSubscribers />);
        await waitFor(() => {
            expect(getByText(/No subscribers/i)).toBeTruthy();
        });
    });

    it('renders without crashing', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ subscriber_count: 0, items: [], next_cursor: null }),
        });

        const { getByText } = render(<TotalSubscribers />);

        await waitFor(() => {
            expect(getByText('All Subscribers')).toBeTruthy();
        });
    });

    it('displays empty state when no subscribers', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ subscriber_count: 0, items: [], next_cursor: null }),
        });

        const { getByText } = render(<TotalSubscribers />);

        await waitFor(() => {
            expect(getByText(/No subscribers/i)).toBeTruthy();
        });
    });

    it('displays table headers', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ subscriber_count: 0, items: [], next_cursor: null }),
        });

        const { getByText } = render(<TotalSubscribers />);

        await waitFor(() => {
            expect(getByText('User ID')).toBeTruthy();
            expect(getByText('Status')).toBeTruthy();
        });
    });

    it('renders CustomBottomNav component', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSubscribersResponse,
        });

        const { UNSAFE_getByType } = render(<TotalSubscribers />);

        await waitFor(() => {
            expect(UNSAFE_getByType(CustomBottomNav)).toBeTruthy();
        });
    });
});
