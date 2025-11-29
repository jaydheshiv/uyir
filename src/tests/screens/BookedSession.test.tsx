import { render } from '@testing-library/react-native';
import React from 'react';
import BookedSession from '../../screens/BookedSession';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        params: {
            livekitUrl: 'wss://test.livekit.cloud',
            accessToken: 'mock-token',
            roomName: 'test-room',
            participantIdentity: 'test-user',
        },
        name: 'BookedSession',
        key: 'BookedSession-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: { id: 1 },
    })),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock LiveKit
jest.mock('@livekit/react-native', () => ({
    LiveKitRoom: ({ children }: any) => children,
    useParticipants: () => [],
    useTracks: () => [],
    VideoTrack: 'VideoTrack',
    AudioSession: {
        configureAudio: jest.fn(),
    },
    AndroidAudioTypePresets: {
        communication: 'communication',
    },
}));

// Mock livekit-client
jest.mock('livekit-client', () => ({
    Track: {
        Source: {
            Camera: 'camera',
            Microphone: 'microphone',
        },
    },
    RoomEvent: {
        DataReceived: 'dataReceived',
    },
}));

describe('BookedSession', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the BookedSession screen', () => {
        const { getByText } = render(<BookedSession />);
        expect(getByText('You are now connected')).toBeTruthy();
    });

    it('displays waiting message when no participants', () => {
        const { getByText } = render(<BookedSession />);
        expect(getByText('Waiting for other participant...')).toBeTruthy();
    });

    it('displays session timer', () => {
        const { getByText } = render(<BookedSession />);
        // Timer starts at 00:00
        expect(getByText(/00:00/)).toBeTruthy();
    });
});
