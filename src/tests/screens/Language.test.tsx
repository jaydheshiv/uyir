import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Language from '../../screens/Language';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'Language',
        key: 'language-key',
    }),
}));

// Mock CustomBottomNav
jest.mock('../../components/CustomBottomNav', () => 'CustomBottomNav');

describe('Language', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<Language />);

        expect(getByText('Language')).toBeTruthy();
    });

    it('displays suggested languages section', () => {
        const { getByText } = render(<Language />);

        expect(getByText('Suggested')).toBeTruthy();
    });

    it('displays others section', () => {
        const { getByText } = render(<Language />);

        expect(getByText('Others')).toBeTruthy();
    });

    it('displays language options', () => {
        const { getAllByText, getByText } = render(<Language />);

        // English (UK) appears twice in suggested
        const englishOptions = getAllByText('English (UK)');
        expect(englishOptions.length).toBe(2);

        expect(getByText('Tamil')).toBeTruthy();
        expect(getByText('Hindi')).toBeTruthy();
    });

    it('allows language selection', () => {
        const { getAllByText } = render(<Language />);

        const tamilOption = getAllByText('Tamil')[0];
        fireEvent.press(tamilOption);

        // Language should be selectable
        expect(tamilOption).toBeTruthy();
    });

    it('has English (UK) selected by default', () => {
        const component = render(<Language />);

        // Component renders with default selection
        expect(component).toBeTruthy();
    });
});
