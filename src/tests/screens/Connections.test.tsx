import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import Connections from '../../screens/Connections';

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
            prompt: 'test prompt',
            questionCount: 5,
            recommendationLimit: 3,
        },
        name: 'Connections',
        key: 'Connections-key',
    }),
}));

// Mock Zustand store
jest.mock('../../store/useAppStore', () => ({
    useAuth: jest.fn(() => ({
        token: 'mock-token',
        user: { id: 1 },
    })),
}));

// Mock components
jest.mock('../../components/ModalCard', () => 'ModalCard');
jest.mock('../../components/ModalOverlay', () => 'ModalOverlay');
jest.mock('../../components/QuestionOptions', () => {
    const { View, Text } = require('react-native');
    return (props: any) => (
        <View>
            <Text>{props.question}</Text>
        </View>
    );
});

// Mock AvatarHome1
jest.mock('../../screens/Avatarhome1', () => 'AvatarHome1');

// Mock fetch
globalThis.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
            questions: [
                {
                    question: 'Test question 1?',
                    options: {
                        A: 'Option A',
                        B: 'Option B',
                        C: 'Option C',
                        D: 'Option D',
                    },
                },
            ],
            recommended_professionals: [],
        }),
        text: () => Promise.resolve(''),
    })
) as jest.Mock;

describe('Connections', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Connections screen', () => {
        const { UNSAFE_getAllByType } = render(<Connections />);
        const views = UNSAFE_getAllByType(View);
        expect(views.length).toBeGreaterThan(0);
    });

    it('displays loading state initially', () => {
        const { getByText } = render(<Connections />);
        expect(getByText('Generating personalized questions...')).toBeTruthy();
    });

    it('fetches questions from API', async () => {
        render(<Connections />);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalled();
        });
    });
});
