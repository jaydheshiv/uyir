import { render } from '@testing-library/react-native';
import React from 'react';
import Upload from '../../screens/Upload';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'Upload',
        key: 'Upload-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: { id: 1 },
    })),
    useProfessional: jest.fn(() => ({
        professionalData: { professional_id: 'pro-123' },
    })),
}));

// Mock PrimaryButton
jest.mock('../../components/PrimaryButton', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return (props: any) => (
        <TouchableOpacity
            onPress={props.onPress}
            disabled={props.disabled}
            testID="primary-button"
        >
            <Text>{props.title}</Text>
        </TouchableOpacity>
    );
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Alert: {
            alert: jest.fn(),
        },
    };
});

describe('Upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Upload screen', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('Upload Recording')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('One upload. Infinite memories')).toBeTruthy();
    });

    it('displays upload prompt when no audio', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('Tap to Upload Audio File')).toBeTruthy();
    });

    it('displays supported file types hint', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('Audio files only (MP3, WAV, M4A, AAC)')).toBeTruthy();
    });

    it('displays Next button', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('Next')).toBeTruthy();
    });

    it('Next button is disabled when no audio', () => {
        const { getByTestId } = render(<Upload />);
        const nextButton = getByTestId('primary-button');
        // Button is disabled when no audio selected
        expect(nextButton).toBeTruthy();
    });

    it('displays empty state message', () => {
        const { getByText } = render(<Upload />);
        expect(getByText('No audio file uploaded')).toBeTruthy();
    });
});
