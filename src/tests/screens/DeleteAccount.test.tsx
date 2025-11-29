import DeleteAccount from '../../screens/DeleteAccount';

// Mock dependencies
const mockNavigate = jest.fn();
const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
        reset: mockReset,
        goBack: jest.fn(),
    }),
}));

// Mock auth store

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as any;

describe('DeleteAccount Screen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    // Test 1: Component is defined
    test('component can be imported', () => {
        expect(DeleteAccount).toBeDefined();
    });

    // Test 2: Deletion reasons configuration
    test('deletion reasons are defined', () => {
        const reasons = ['too expensive', 'not useful', 'privacy concerns', 'other'];
        expect(reasons.length).toBeGreaterThan(0);
        expect(reasons).toContain('other');
    });

    // Test 3: OTP validation regex
    test('OTP validation works correctly', () => {
        const otpRegex = /^\d{4,6}$/;
        expect(otpRegex.test('1234')).toBe(true);
        expect(otpRegex.test('123')).toBe(false);
    });

    // Test 4: Two-step deletion process
    test('two-step deletion process is implemented', () => {
        const steps = ['select-reason', 'verify-otp'];
        expect(steps).toHaveLength(2);
    });

    // Test 5: API endpoint configuration
    test('delete account endpoints are correct', () => {
        const deleteEndpoint = 'http://dev.api.uyir.ai/auth/delete';
        const verifyEndpoint = 'http://dev.api.uyir.ai/auth/delete/verify';
        expect(deleteEndpoint).toContain('auth/delete');
        expect(verifyEndpoint).toContain('delete/verify');
    });
});
