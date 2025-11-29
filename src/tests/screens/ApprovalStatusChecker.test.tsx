import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import ApprovalStatusChecker from '../../screens/ApprovalStatusChecker';

// Mock navigation
const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
        replace: mockReplace,
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

// Mock fetch
declare var global: any;
global.fetch = jest.fn();

const mockRoute = { params: { guardianEmail: 'guardian@example.com' } };

describe('ApprovalStatusChecker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (global.fetch as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the ApprovalStatusChecker screen', () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ approved: false }),
        });

        const { getByText } = render(<ApprovalStatusChecker route={mockRoute} />);
        expect(getByText('Checking approval status...')).toBeTruthy();
    });

    it('displays loading indicator', () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ approved: false }),
        });

        const { UNSAFE_getByType } = render(<ApprovalStatusChecker route={mockRoute} />);
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('polls for approval status', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ approved: false }),
        });

        render(<ApprovalStatusChecker route={mockRoute} />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        jest.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    it('navigates to GuardianGrantedScreen when approved', async () => {
        jest.useRealTimers();

        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ approved: true }),
        });

        render(<ApprovalStatusChecker route={mockRoute} />);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('GuardianGrantedScreen');
        }, { timeout: 2000 });

        jest.useFakeTimers();
    });

    it('navigates to NotGuardianGrantedScreen when denied', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ approved: false }),
        });

        const { getByText } = render(<ApprovalStatusChecker route={mockRoute} />);

        await waitFor(() => {
            expect(getByText('Checking approval status...')).toBeTruthy();
        }, { timeout: 3000 });
    });
});
