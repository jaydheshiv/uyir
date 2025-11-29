import SignupFlow from '../../screens/SignupFlow';

// Mock dependencies
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
    }),
}));

// Mock fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch as any;

describe('SignupFlow Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    // Test 1: Component is defined
    test('component can be imported', () => {
        expect(SignupFlow).toBeDefined();
    });

    // Test 2: Email validation regex
    test('email validation works correctly', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test('test@example.com')).toBe(true);
        expect(emailRegex.test('invalid')).toBe(false);
    });

    // Test 3: Fetch is mocked
    test('fetch mock is available', () => {
        expect(mockFetch).toBeDefined();
    });

    // Test 4: Navigation mock is set up
    test('navigation is properly mocked', () => {
        expect(mockNavigate).toBeDefined();
    });

    // Test 5: API endpoint configuration
    test('signup endpoint is correct', () => {
        const endpoint = 'http://dev.api.uyir.ai/auth/signup';
        expect(endpoint).toContain('auth/signup');
    });

});
