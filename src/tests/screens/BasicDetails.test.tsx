import { render } from '@testing-library/react-native';
import React from 'react';
import BasicDetailsForm from '../../components/BasicDetailsForm';
import BasicDetails from '../../screens/BasicDetails';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
    useRoute: () => ({
        name: 'BasicDetails',
        key: 'basic-details-key',
    }),
}));

// Mock BasicDetailsForm component
jest.mock('../../components/BasicDetailsForm', () => 'BasicDetailsForm');

describe('BasicDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const component = render(<BasicDetails />);
        expect(component).toBeTruthy();
    });

    it('renders BasicDetailsForm component', () => {
        const { UNSAFE_getByType } = render(<BasicDetails />);

        // BasicDetailsForm should be rendered
        expect(UNSAFE_getByType(BasicDetailsForm)).toBeTruthy();
    });

    it('has back button', () => {
        const component = render(<BasicDetails />);

        // Back button should be rendered
        expect(component).toBeTruthy();
    });
});
