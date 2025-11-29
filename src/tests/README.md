# Testing Guide for MyFirstApp

## 📚 Overview

This directory contains all test files for the application. We use **Jest** and **React Testing Library** for testing.

## 🎯 Testing Philosophy

We follow the testing pyramid:
- **70% Unit Tests** - Fast, isolated tests for components and utilities
- **20% Integration Tests** - Test component interactions and API integration
- **10% E2E Tests** - Full user flow testing (not covered here)

## 🛠️ Test Types

### 1. Unit Tests
Test individual components, hooks, and utilities in isolation.

**Example:** Testing a button component
```typescript
test('button calls onPress when clicked', () => {
  const mockPress = jest.fn();
  render(<PrimaryButton title="Click me" onPress={mockPress} />);
  
  fireEvent.press(screen.getByText('Click me'));
  expect(mockPress).toHaveBeenCalledTimes(1);
});
```

### 2. Integration Tests
Test how components work together, including API calls.

**Example:** Testing a form submission
```typescript
test('submits feedback successfully', async () => {
  render(<FeedbackPage />);
  
  fireEvent.changeText(screen.getByPlaceholderText('Your feedback'), 'Great app!');
  fireEvent.press(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(screen.getByText('Thank you!')).toBeTruthy();
  });
});
```

### 3. Snapshot Tests
Capture component structure and detect unexpected changes.

```typescript
test('matches snapshot', () => {
  const tree = renderer.create(<PrimaryButton title="Test" onPress={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- FeedbackPage.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should submit"
```

## 📁 File Structure

```
src/tests/
├── README.md                           # This file
├── components/                         # Component tests
│   ├── PrimaryButton.test.tsx
│   ├── OTPInput.test.tsx
│   └── TherapistCard.test.tsx
├── screens/                           # Screen tests
│   ├── LoginFlow.test.tsx
│   ├── SignupFlow.test.tsx
│   ├── FeedbackPage.test.tsx
│   └── DeleteAccount.test.tsx
├── store/                             # State management tests
│   └── authStore.test.ts
├── utils/                             # Utility function tests
│   └── validation.test.ts
├── hooks/                             # Custom hook tests
│   └── useExpoGoogleAuth.test.ts
└── __mocks__/                         # Mock implementations
    ├── AsyncStorage.ts
    ├── react-native-vector-icons.tsx
    └── zustand.ts
```

## 🎨 Testing Best Practices

### ✅ Do's

1. **Test User Behavior** - Not implementation details
   ```typescript
   // ✅ Good - Tests what user sees
   expect(screen.getByText('Welcome')).toBeTruthy();
   
   // ❌ Bad - Tests internal state
   expect(component.state.isLoading).toBe(false);
   ```

2. **Use Accessible Queries** - In order of preference:
   - `getByText`, `getByLabelText`, `getByPlaceholderText`
   - `getByRole`
   - `getByTestId` (last resort)

3. **Mock External Dependencies**
   ```typescript
   jest.mock('@react-native-async-storage/async-storage');
   ```

4. **Test Both Success and Failure**
   ```typescript
   test('shows error on API failure', async () => {
     fetch.mockRejectOnce(new Error('Network error'));
     // ... test error handling
   });
   ```

5. **Keep Tests Simple and Readable**
   - One concept per test
   - Descriptive test names
   - Arrange-Act-Assert pattern

### ❌ Don'ts

1. **Don't test third-party libraries** - Assume they work
2. **Don't test implementation details** - Focus on user experience
3. **Don't make tests interdependent** - Each test should be isolated
4. **Don't ignore failing tests** - Fix them immediately

## 🔧 Common Testing Patterns

### Testing Async Operations
```typescript
test('loads data asynchronously', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeTruthy();
  });
});
```

### Testing Navigation
```typescript
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

test('navigates on button press', () => {
  render(<LoginFlow />);
  fireEvent.press(screen.getByText('Login'));
  expect(mockNavigate).toHaveBeenCalledWith('OTPVerificationScreenlogin');
});
```

### Testing Forms
```typescript
test('validates email input', () => {
  render(<LoginForm />);
  
  const input = screen.getByPlaceholderText('Email');
  fireEvent.changeText(input, 'invalid-email');
  
  expect(screen.getByText('Invalid email')).toBeTruthy();
});
```

### Testing API Calls
```typescript
beforeEach(() => {
  fetch.resetMocks();
});

test('submits data to API', async () => {
  fetch.mockResponseOnce(JSON.stringify({ success: true }));
  
  render(<FeedbackPage />);
  // ... interact with form
  
  expect(fetch).toHaveBeenCalledWith(
    'http://dev.api.uyir.ai/support/feedback',
    expect.objectContaining({
      method: 'POST',
    })
  );
});
```

## 📊 Coverage Goals

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Focus on critical paths:
- Authentication flows
- Payment/Pro upgrade
- Data submission (feedback, support)
- Account management

## 🐛 Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand YourTest.test.tsx
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react-native)
- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
