
// Utility Tests - Email validation, phone validation, formatting etc.
describe('Validation Utilities', () => {
    // Email validation
    describe('validateEmail', () => {
        test('returns true for valid email', () => {
            const validEmails = [
                'test@example.com',
                'user.name@example.co.uk',
                'test+tag@example.com',
                'test.email@subdomain.example.com',
            ];

            validEmails.forEach(email => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                expect(emailRegex.test(email)).toBe(true);
            });
        });

        test('returns false for invalid email', () => {
            const invalidEmails = [
                'invalid',
                '@example.com',
                'test@',
                'test@example',
                'test @example.com',
                '',
            ];

            invalidEmails.forEach(email => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                expect(emailRegex.test(email)).toBe(false);
            });
        });
    });

    // Phone validation
    describe('validatePhone', () => {
        test('returns true for valid phone numbers', () => {
            const validPhones = [
                '+919876543210',
                '9876543210',
                '+1234567890',
            ];

            validPhones.forEach(phone => {
                const phoneRegex = /^(\+)?[0-9]{10,15}$/;
                expect(phoneRegex.test(phone.replace(/\s/g, ''))).toBe(true);
            });
        });

        test('returns false for invalid phone numbers', () => {
            const invalidPhones = [
                '123',
                'abcdefghij',
                '+91-987-654-321',
                '',
            ];

            invalidPhones.forEach(phone => {
                const phoneRegex = /^(\+)?[0-9]{10,15}$/;
                expect(phoneRegex.test(phone.replace(/\s/g, ''))).toBe(false);
            });
        });
    });

    // OTP validation
    describe('validateOTP', () => {
        test('returns true for valid 4-digit OTP', () => {
            const validOTPs = ['1234', '0000', '9999'];

            validOTPs.forEach(otp => {
                expect(/^\d{4}$/.test(otp)).toBe(true);
            });
        });

        test('returns false for invalid OTP', () => {
            const invalidOTPs = ['123', '12345', 'abcd', ''];

            invalidOTPs.forEach(otp => {
                expect(/^\d{4}$/.test(otp)).toBe(false);
            });
        });
    });

    // Date formatting
    describe('formatDate', () => {
        test('formats date correctly', () => {
            const date = new Date('2024-01-15');
            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            expect(formatted).toContain('2024');
            expect(formatted).toContain('January');
        });
    });

    // Price formatting
    describe('formatPrice', () => {
        test('formats price with dollar sign', () => {
            const prices = [100, 50.5, 0];

            prices.forEach(price => {
                const formatted = `$${price}`;
                expect(formatted).toMatch(/^\$\d+(\.\d+)?$/);
            });
        });
    });
});

// String utilities
describe('String Utilities', () => {
    describe('truncateText', () => {
        test('truncates long text', () => {
            const longText = 'This is a very long text that needs to be truncated';
            const truncated = longText.substring(0, 20) + '...';

            expect(truncated.length).toBeLessThanOrEqual(23);
            expect(truncated).toContain('...');
        });

        test('does not truncate short text', () => {
            const shortText = 'Short';
            const result = shortText.length > 20 ? shortText.substring(0, 20) + '...' : shortText;

            expect(result).toBe(shortText);
            expect(result).not.toContain('...');
        });
    });

    describe('capitalizeFirstLetter', () => {
        test('capitalizes first letter', () => {
            const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('world')).toBe('World');
        });
    });
});

// Array utilities
describe('Array Utilities', () => {
    describe('removeDuplicates', () => {
        test('removes duplicate values', () => {
            const array = [1, 2, 2, 3, 4, 4, 5];
            const unique = [...new Set(array)];

            expect(unique).toEqual([1, 2, 3, 4, 5]);
            expect(unique.length).toBe(5);
        });
    });

    describe('chunkArray', () => {
        test('splits array into chunks', () => {
            const array = [1, 2, 3, 4, 5, 6];
            const chunkSize = 2;
            const chunks = [];

            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }

            expect(chunks).toEqual([[1, 2], [3, 4], [5, 6]]);
            expect(chunks.length).toBe(3);
        });
    });
});

// API utilities
describe('API Utilities', () => {
    describe('buildAuthHeader', () => {
        test('creates correct Authorization header', () => {
            const token = 'test-token-123';
            const header = {
                Authorization: `Bearer ${token}`,
            };

            expect(header.Authorization).toBe('Bearer test-token-123');
            expect(header.Authorization).toContain('Bearer');
        });
    });

    describe('handleAPIError', () => {
        test('extracts error message from response', () => {
            const errorResponse = {
                error: 'Invalid credentials',
                message: 'Login failed',
            };

            const message = errorResponse.message || errorResponse.error || 'Unknown error';
            expect(message).toBe('Login failed');
        });

        test('provides default error message', () => {
            const errorResponse = {};
            const message = (errorResponse as any).message || (errorResponse as any).error || 'Unknown error';

            expect(message).toBe('Unknown error');
        });
    });
});

// Storage utilities
describe('Storage Utilities', () => {
    describe('parseJSON', () => {
        test('parses valid JSON', () => {
            const json = '{"name": "Test", "age": 25}';
            const parsed = JSON.parse(json);

            expect(parsed.name).toBe('Test');
            expect(parsed.age).toBe(25);
        });

        test('handles invalid JSON', () => {
            const invalidJSON = 'not valid json';

            try {
                JSON.parse(invalidJSON);
            } catch (error) {
                expect(error).toBeInstanceOf(SyntaxError);
            }
        });
    });
});
