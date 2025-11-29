import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import UploadContent from '../../screens/UploadContent';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'UploadContent',
        key: 'UploadContent-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: { id: 1 },
    })),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
}));

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

describe('UploadContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the UploadContent screen', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText('Upload')).toBeTruthy();
    });

    it('displays subtitle text', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText('Add files to help your avatar learn and respond better.')).toBeTruthy();
    });

    it('displays Documents upload option', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText(/Documents/i)).toBeTruthy();
    });

    it('displays Videos upload option', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText(/Videos/i)).toBeTruthy();
    });

    it('displays Audio upload option', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText(/Audio/i)).toBeTruthy();
    });

    it('displays Images upload option', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText(/Images/i)).toBeTruthy();
    });

    it('displays Skip for Now button', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText('Skip for Now')).toBeTruthy();
    });

    it('displays Upload Files button', () => {
        const { getByText } = render(<UploadContent />);
        expect(getByText('Upload Files')).toBeTruthy();
    });

    it('navigates to LetUsKnowYou2 on Skip button press', () => {
        const { getByText } = render(<UploadContent />);
        const skipButton = getByText('Skip for Now');

        fireEvent.press(skipButton);

        expect(mockNavigate).toHaveBeenCalledWith('LetUsKnowYou2');
    });

    it('navigates to LetUsKnowYou2 on Upload Files button press', () => {
        const { getByText } = render(<UploadContent />);
        const uploadButton = getByText('Upload Files');

        fireEvent.press(uploadButton);

        expect(mockNavigate).toHaveBeenCalledWith('LetUsKnowYou2');
    });
});
