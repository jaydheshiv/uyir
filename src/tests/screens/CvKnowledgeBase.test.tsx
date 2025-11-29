import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CvKnowledgeBase from '../../screens/CvKnowledgeBase';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'CvKnowledgeBase',
        key: 'CvKnowledgeBase-key',
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

describe('CvKnowledgeBase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the CvKnowledgeBase screen', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        expect(getByText('Content Visibility')).toBeTruthy();
    });

    it('displays Knowledge Base section title', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        expect(getByText('Knowledge Base')).toBeTruthy();
    });

    it('displays section description', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        expect(getByText('Select which data are visible on your public profile.')).toBeTruthy();
    });

    it('displays search bar', () => {
        const { getByPlaceholderText } = render(<CvKnowledgeBase />);
        expect(getByPlaceholderText('Search')).toBeTruthy();
    });

    it('allows typing in search bar', () => {
        const { getByPlaceholderText } = render(<CvKnowledgeBase />);
        const searchInput = getByPlaceholderText('Search');

        fireEvent.changeText(searchInput, 'test search');
        expect(searchInput.props.value).toBe('test search');
    });

    it('displays knowledge base items', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        expect(getByText('My First Trip Abroad')).toBeTruthy();
        expect(getByText('University Graduation')).toBeTruthy();
    });

    it('displays Next button', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        expect(getByText('Next')).toBeTruthy();
    });

    it('navigates to CvKnowledgeBase1 on Next button press', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        const nextButton = getByText('Next');

        fireEvent.press(nextButton);

        expect(mockNavigate).toHaveBeenCalledWith('CvKnowledgeBase1');
    });

    it('allows toggling knowledge base items', () => {
        const { getByText } = render(<CvKnowledgeBase />);
        const item = getByText('My First Trip Abroad');

        fireEvent.press(item);
        expect(item).toBeTruthy();
    });
});
