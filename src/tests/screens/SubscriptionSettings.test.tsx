import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SubscriptionSettings from '../../screens/SubscriptionSettings';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'SubscriptionSettings',
        key: 'SubscriptionSettings-key',
    }),
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
    Edit: 'Edit',
    Info: 'Info',
}));

// Mock CustomBottomNav
import CustomBottomNav from '../../components/CustomBottomNav';
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('SubscriptionSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the SubscriptionSettings screen', () => {
        const { getByText } = render(<SubscriptionSettings />);
        expect(getByText('Subscription Settings')).toBeTruthy();
    });

    it('displays subscription tier inputs', () => {
        const { getAllByPlaceholderText } = render(<SubscriptionSettings />);
        const titleInputs = getAllByPlaceholderText('Title');
        expect(titleInputs.length).toBe(3);
    });

    it('displays tier price inputs', () => {
        const { getAllByPlaceholderText } = render(<SubscriptionSettings />);
        const priceInputs = getAllByPlaceholderText('$0.00');
        expect(priceInputs.length).toBe(3);
    });

    it('displays tier title inputs', () => {
        const { getAllByPlaceholderText } = render(<SubscriptionSettings />);
        const titlePlaceholders = getAllByPlaceholderText('Title');
        expect(titlePlaceholders.length).toBe(3);
    });

    it('displays tier benefits inputs', () => {
        const { getAllByPlaceholderText } = render(<SubscriptionSettings />);
        const benefitsInputs = getAllByPlaceholderText('Benefits');
        expect(benefitsInputs.length).toBe(3);
    });

    it('displays Save button', () => {
        const { getByText } = render(<SubscriptionSettings />);
        expect(getByText('Save')).toBeTruthy();
    });

    it('displays tier labels', () => {
        const { getAllByText } = render(<SubscriptionSettings />);
        // Multiple Title and Price labels exist for each tier
        const titleLabels = getAllByText('Title');
        expect(titleLabels.length).toBeGreaterThan(0);
        const priceLabels = getAllByText('Price');
        expect(priceLabels.length).toBeGreaterThan(0);
    });

    it('allows editing tier information', () => {
        const { getAllByPlaceholderText } = render(<SubscriptionSettings />);
        const titleInputs = getAllByPlaceholderText('Title');

        fireEvent.changeText(titleInputs[0], 'Basic Plan');
        expect(titleInputs[0].props.value).toBe('Basic Plan');
    });

    it('renders CustomBottomNav component', () => {
        const { UNSAFE_getByType } = render(<SubscriptionSettings />);
        expect(UNSAFE_getByType(CustomBottomNav)).toBeTruthy();
    });
});
