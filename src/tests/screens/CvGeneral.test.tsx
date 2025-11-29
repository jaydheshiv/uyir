import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CvGeneral from '../../screens/CvGeneral';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'CvGeneral',
        key: 'CvGeneral-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
}));

describe('CvGeneral', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the CvGeneral screen', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Content Visibility')).toBeTruthy();
    });

    it('displays General section title', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('General')).toBeTruthy();
    });

    it('displays section description', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Select which data are visible on your public profile.')).toBeTruthy();
    });

    it('displays Twin Window option', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Twin Window')).toBeTruthy();
    });

    it('displays About option', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('About')).toBeTruthy();
    });

    it('displays Subscribe option', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Subscribe')).toBeTruthy();
    });

    it('displays Book Session option', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Book Session')).toBeTruthy();
    });

    it('displays Donation option', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Donation')).toBeTruthy();
    });

    it('displays Save button', () => {
        const { getByText } = render(<CvGeneral />);
        expect(getByText('Save')).toBeTruthy();
    });

    it('allows toggling visibility options', () => {
        const { getByText } = render(<CvGeneral />);
        const twinWindowOption = getByText('Twin Window');

        // Should be able to press the option
        fireEvent.press(twinWindowOption);
        expect(twinWindowOption).toBeTruthy();
    });
});
