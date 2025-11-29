import { render } from '@testing-library/react-native';
import React from 'react';
import CustomBottomNav from '../../components/CustomBottomNav';
import SupportPage2 from '../../screens/SupportPage2';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'SupportPage2',
        key: 'SupportPage2-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('SupportPage2', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the SupportPage2 screen', () => {
        const { getByText } = render(<SupportPage2 />);
        expect(getByText('Support')).toBeTruthy();
    });

    it('displays thanks message', () => {
        const { getByText } = render(<SupportPage2 />);
        expect(getByText(/Thanks for reaching out/i)).toBeTruthy();
    });

    it('displays response time information', () => {
        const { getByText } = render(<SupportPage2 />);
        expect(getByText(/2-3 workind days/i)).toBeTruthy();
    });

    it('renders CustomBottomNav component', () => {
        const { UNSAFE_getByType } = render(<SupportPage2 />);
        expect(UNSAFE_getByType(CustomBottomNav)).toBeTruthy();
    });
});
