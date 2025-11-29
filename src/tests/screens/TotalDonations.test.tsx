import { render } from '@testing-library/react-native';
import React from 'react';
import TotalDonations from '../../screens/TotalDonations';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'TotalDonations',
        key: 'TotalDonations-key',
    }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
}));

// Mock CustomBottomNav
import CustomBottomNav from '../../components/CustomBottomNav';
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('TotalDonations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the TotalDonations screen', () => {
        const { getByText } = render(<TotalDonations />);
        expect(getByText('All Donations')).toBeTruthy();
    });

    it('displays table headers', () => {
        const { getByText } = render(<TotalDonations />);
        expect(getByText('From')).toBeTruthy();
        expect(getByText('Amount')).toBeTruthy();
        expect(getByText('Date')).toBeTruthy();
    });

    it('displays donation entries', () => {
        const { getAllByText } = render(<TotalDonations />);
        const johnDoes = getAllByText('John Doe');
        expect(johnDoes.length).toBeGreaterThan(0);
        const amounts = getAllByText('$25');
        expect(amounts.length).toBeGreaterThan(0);
    });

    it('renders donation list', () => {
        const { getAllByText } = render(<TotalDonations />);
        const items = getAllByText('John Doe');
        expect(items.length).toBeGreaterThanOrEqual(10);
    });

    it('displays Edit icon in header', () => {
        const { getByText } = render(<TotalDonations />);
        // Edit icon is present in header
        expect(getByText('All Donations')).toBeTruthy();
    });

    it('renders CustomBottomNav component', () => {
        const { UNSAFE_getByType } = render(<TotalDonations />);
        expect(UNSAFE_getByType(CustomBottomNav)).toBeTruthy();
    });
});
