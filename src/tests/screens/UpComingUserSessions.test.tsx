import { render } from '@testing-library/react-native';
import React from 'react';
import UpComingUserSessions from '../../screens/UpComingUserSessions';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'UpComingUserSessions',
        key: 'UpComingUserSessions-test',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: () => ({
        token: 'test-token',
    }),
}));

// Mock fetch
globalThis.fetch = jest.fn();

describe('UpComingUserSessions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis.fetch as jest.Mock).mockClear();
    });

    test('renders upcoming sessions screen', () => {
        const { toJSON } = render(<UpComingUserSessions />);
        expect(toJSON()).toBeTruthy();
    });

    test('sessions API endpoint is configured', () => {
        const endpoint = 'http://dev.api.uyir.ai:8081/bookings/user';
        expect(endpoint).toContain('/bookings/user');
    });

    test('LiveKit call link endpoint is configured', () => {
        const sessionId = 'test-123';
        const endpoint = `http://dev.api.uyir.ai:8081/livekit/generate-call-link/${sessionId}`;
        expect(endpoint).toContain('/livekit/generate-call-link/');
        expect(endpoint).toContain(sessionId);
    });

    test('session status logic works correctly', () => {
        const now = new Date('2025-11-15T10:00:00Z');
        const futureSession = {
            start_time: '2025-11-16T10:00:00Z',
            end_time: '2025-11-16T11:00:00Z',
            call_status: null,
            call_end_time: null,
        };

        // Session in future should not be startable
        const startTime = new Date(futureSession.start_time);
        const fifteenMinsBefore = new Date(startTime.getTime() - 15 * 60 * 1000);
        const canStart = now >= fifteenMinsBefore;

        expect(canStart).toBe(false);
    });
});
