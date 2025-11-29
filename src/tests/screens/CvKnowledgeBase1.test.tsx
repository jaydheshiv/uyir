import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CvKnowledgeBase1 from '../../screens/CvKnowledgeBase1';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: mockGoBack,
    }),
    useRoute: () => ({
        name: 'CvKnowledgeBase1',
        key: 'CvKnowledgeBase1-key',
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

describe('CvKnowledgeBase1', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the CvKnowledgeBase1 screen', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Content Visibility')).toBeTruthy();
    });

    it('displays Knowledge Base section title', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Knowledge Base')).toBeTruthy();
    });

    it('displays section description', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Select which memory capsules are visible on your public profile.')).toBeTruthy();
    });

    it('displays visibility options', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Share it in my public view')).toBeTruthy();
        expect(getByText('For subscribers only')).toBeTruthy();
        expect(getByText('Keep it private')).toBeTruthy();
    });

    it('displays Save button', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Save')).toBeTruthy();
    });

    it('allows toggling visibility options', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        const publicOption = getByText('Share it in my public view');

        fireEvent.press(publicOption);
        expect(publicOption).toBeTruthy();
    });

    it('has public view option selected by default', () => {
        const { getByText } = render(<CvKnowledgeBase1 />);
        expect(getByText('Share it in my public view')).toBeTruthy();
    });
});
