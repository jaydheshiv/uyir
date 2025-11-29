# 📖 Complete Testing Guide for MyFirstApp

## 🎯 Overview

This document explains **WHY testing is essential**, **HOW it works**, and **WHAT you need to do**.

---

## 🤔 What is Testing?

Testing means **writing code that checks if your app code works correctly**. Think of it like:

- **Manual Testing**: You open the app → click buttons → check if it works ✋
- **Automated Testing**: Computer does all that for you → instantly → every time you make changes 🤖

### Real Example:

**Without Tests:**
```
1. Make change in LoginFlow.tsx
2. Start app (30 seconds)
3. Navigate to login screen
4. Type email
5. Click login
6. Check if it works
7. Total time: 2-3 minutes per test
```

**With Tests:**
```bash
npm test -- LoginFlow.test.tsx
# Runs 8 tests in 2 seconds! ⚡
```

---

## 💡 Why Write Tests? (Real Benefits)

### 1. **Catch Bugs BEFORE Users See Them** 🐛

```typescript
// This test will fail if email validation breaks
test('validates email format', () => {
  render(<LoginFlow />);
  fireEvent.changeText(emailInput, 'not-an-email');
  fireEvent.press(loginButton);
  
  expect(screen.getByText(/invalid email/i)).toBeTruthy();
});
```

**Scenario**: You refactor validation code → accidentally break it → Tests FAIL → You fix it → Users never see the bug ✅

### 2. **Deploy with Confidence** 🚀

```bash
# Before pushing to production:
npm test -- --coverage

# ✅ All 127 tests pass
# ✅ 85% code coverage
# → Safe to deploy!
```

**Benefit**: You can use CodePush to update your app knowing tests verified everything works.

### 3. **Faster Development** ⚡

**Traditional Flow** (3-5 minutes per check):
1. Start Metro bundler
2. Build Android/iOS
3. Open app
4. Navigate to screen
5. Test feature

**Testing Flow** (5 seconds):
```bash
npm test -- FeedbackPage
# PASS  src/tests/screens/FeedbackPage.test.tsx (2.4s)
```

**Time Saved**: 100+ hours per year for a team!

### 4. **Documentation That Never Goes Stale** 📚

Tests show **exactly** how components should be used:

```typescript
test('submits feedback with emoji rating', async () => {
  render(<FeedbackPage />);
  
  // 1. Select emoji
  fireEvent.press(screen.getByText('😍'));
  
  // 2. Enter feedback
  fireEvent.changeText(feedbackInput, 'Great app!');
  
  // 3. Submit
  fireEvent.press(screen.getByText('Send'));
  
  // 4. Verify API call
  expect(fetch).toHaveBeenCalledWith(
    'http://dev.api.uyir.ai/support/feedback',
    expect.objectContaining({ method: 'POST' })
  );
});
```

**This test IS the documentation!** New developers can read it and understand the entire feedback flow.

---

## 📚 Types of Tests Explained

### 1. Unit Tests (70% of your tests)

**What**: Test individual components/functions in isolation

**Example**: Testing a button component

```typescript
test('button calls onPress when clicked', () => {
  const mockPress = jest.fn(); // Create mock function
  render(<PrimaryButton title="Click" onPress={mockPress} />);
  
  fireEvent.press(screen.getByText('Click'));
  
  expect(mockPress).toHaveBeenCalled(); // ✅ Verify it was called
});
```

**When to Use**: For components, utilities, helper functions

### 2. Integration Tests (20% of your tests)

**What**: Test how multiple components work together

**Example**: Testing a complete form submission

```typescript
test('complete login flow', async () => {
  render(<LoginFlow />);
  
  // User types email
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
  
  // User clicks login
  fireEvent.press(screen.getByText('Login'));
  
  // Wait for API call
  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });
  
  // Check navigation happened
  expect(mockNavigate).toHaveBeenCalledWith('OTPVerificationScreen');
});
```

**When to Use**: For complete user flows, API integrations

### 3. Snapshot Tests (10% of your tests)

**What**: Capture UI structure and detect unexpected changes

```typescript
test('matches snapshot', () => {
  const tree = render(<PrimaryButton title="Test" />).toJSON();
  expect(tree).toMatchSnapshot(); // Saves UI structure
});
```

**When to Use**: For UI components to prevent accidental visual changes

---

## 🛠️ How Tests Work (Behind the Scenes)

### Test Anatomy:

```typescript
describe('Component Name', () => {  // Group related tests
  test('what it should do', () => {  // Individual test
    // 1. ARRANGE: Set up test data
    const mockPress = jest.fn();
    
    // 2. ACT: Do something
    render(<Button onPress={mockPress} />);
    fireEvent.press(screen.getByText('Click'));
    
    // 3. ASSERT: Check result
    expect(mockPress).toHaveBeenCalled();
  });
});
```

### Key Concepts:

**1. Mocking**: Replace real dependencies with fake ones

```typescript
// Mock API calls so tests don't hit real server
jest.mock('fetch');
fetch.mockResolvedValue({ ok: true, json: () => ({ success: true }) });
```

**2. Assertions**: Check if something is true

```typescript
expect(result).toBe(expected);        // Exact match
expect(text).toContain('hello');      // Partial match
expect(element).toBeTruthy();         // Exists
expect(mockFn).toHaveBeenCalled();    // Function was called
```

**3. Async Testing**: Wait for things to happen

```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeTruthy();
}, { timeout: 3000 });
```

---

## 🚀 Getting Started (Step-by-Step)

### Step 1: Run Existing Tests

```bash
cd D:\INTERN\MyFirstApp
npm test
```

**What You'll See:**
```
PASS  src/tests/components/PrimaryButton.test.tsx
  ✓ renders with correct title (32ms)
  ✓ calls onPress when pressed (18ms)
  ✓ does not call onPress when disabled (12ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        2.156s
```

### Step 2: Run Tests in Watch Mode

```bash
npm test -- --watch
```

**What This Does:**
- Automatically reruns tests when you change code
- Shows only changed tests
- Super fast development!

### Step 3: Check Coverage

```bash
npm test -- --coverage
```

**Output:**
```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
LoginFlow.tsx           |   85.5  |   72.3   |   90.0  |   84.2
FeedbackPage.tsx        |   92.1  |   85.7   |   95.0  |   91.8
```

**Goal**: Aim for 70%+ coverage on critical files

---

## ✍️ Writing Your First Test

Let's test a new feature: **SupportPage2.tsx**

### 1. Create Test File

```typescript
// src/tests/screens/SupportPage2.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SupportPage2 from '../../screens/SupportPage2';

describe('SupportPage2', () => {
  test('renders thank you message', () => {
    render(<SupportPage2 />);
    
    expect(screen.getByText(/thank you/i)).toBeTruthy();
  });
});
```

### 2. Run the Test

```bash
npm test -- SupportPage2.test.tsx
```

### 3. Add More Tests

```typescript
test('navigates back to home', () => {
  const mockNavigate = jest.fn();
  jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
  }));
  
  render(<SupportPage2 />);
  fireEvent.press(screen.getByText('Back to Home'));
  
  expect(mockNavigate).toHaveBeenCalledWith('Home');
});
```

---

## 🔧 Common Testing Patterns

### Pattern 1: Testing Button Clicks

```typescript
test('button triggers callback', () => {
  const handleClick = jest.fn();
  render(<MyButton onPress={handleClick} />);
  
  fireEvent.press(screen.getByText('Click Me'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Pattern 2: Testing Form Input

```typescript
test('updates input value', () => {
  render(<MyForm />);
  
  const input = screen.getByPlaceholderText('Email');
  fireEvent.changeText(input, 'test@example.com');
  
  expect(input.props.value).toBe('test@example.com');
});
```

### Pattern 3: Testing API Calls

```typescript
test('submits data to backend', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });
  
  render(<MyForm />);
  fireEvent.press(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://dev.api.uyir.ai/endpoint',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
```

### Pattern 4: Testing Error States

```typescript
test('shows error on API failure', async () => {
  (global.fetch as jest.Mock).mockRejectedValue(
    new Error('Network error')
  );
  
  render(<MyForm />);
  fireEvent.press(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeTruthy();
  });
});
```

---

## 🎯 What to Test (Priority Order)

### 🔴 **MUST TEST** (Critical)

1. **Authentication Flows**
   - Login, Signup, OTP verification
   - Token handling
   - Logout

2. **Payment & Pro Upgrade**
   - Payment processing
   - Pro feature unlocking
   - Subscription management

3. **Account Management**
   - Account deletion (you already have this!)
   - Profile updates
   - Password reset

### 🟡 **SHOULD TEST** (Important)

4. **API Integrations**
   - Feedback submission ✅
   - Support messages ✅
   - Data fetching

5. **Form Validations**
   - Email validation ✅
   - Phone validation
   - Required fields

### 🟢 **NICE TO TEST** (Optional)

6. **UI Components**
   - Buttons ✅
   - Cards ✅
   - Inputs

7. **Utility Functions**
   - Date formatting
   - String manipulation
   - Array operations

---

## 🐛 Debugging Failed Tests

### Problem 1: "Cannot find element"

```typescript
// ❌ Bad: Element doesn't exist yet
expect(screen.getByText('Success')).toBeTruthy();

// ✅ Good: Wait for it to appear
await waitFor(() => {
  expect(screen.getByText('Success')).toBeTruthy();
});
```

### Problem 2: "Test timeout"

```typescript
// Increase timeout
await waitFor(() => {
  expect(something).toBeTruthy();
}, { timeout: 5000 }); // 5 seconds
```

### Problem 3: "Mock not working"

```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});
```

### Problem 4: "Can't see what's rendering"

```typescript
// Add debug output
render(<MyComponent />);
screen.debug(); // Prints entire component tree
```

---

## 📊 Coverage Reports Explained

When you run `npm test -- --coverage`, you get:

```
File              | % Stmts | % Branch | % Funcs | % Lines
------------------|---------|----------|---------|--------
LoginFlow.tsx     |   85.5  |   72.3   |   90.0  |   84.2
```

**What Each Column Means:**

- **% Stmts** (Statements): How many lines of code were executed
- **% Branch** (Branches): How many if/else paths were tested
- **% Funcs** (Functions): How many functions were called
- **% Lines**: Similar to statements

**Goal**: 70-80% coverage on critical files

---

## 🚦 Test-Driven Development (TDD) - Optional Advanced

**Traditional**:
1. Write code
2. Test manually
3. Fix bugs
4. Repeat

**TDD**:
1. Write test (it fails - no code yet)
2. Write code to make test pass
3. Refactor code
4. Repeat

**Example**:

```typescript
// Step 1: Write failing test
test('validates phone number', () => {
  expect(validatePhone('1234567890')).toBe(true);
  expect(validatePhone('invalid')).toBe(false);
});

// Step 2: Write code to pass test
function validatePhone(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

// Step 3: Test passes! ✅
```

---

## 📈 Next Steps

### This Week:
- [ ] Run `npm test` and verify all tests pass
- [ ] Run `npm test -- --coverage` to see current coverage
- [ ] Read through existing test files to understand patterns

### Next Week:
- [ ] Add tests for OTPVerificationScreen
- [ ] Add tests for SupportPage2
- [ ] Increase coverage to 70%+

### Ongoing:
- [ ] Write tests for new features BEFORE coding
- [ ] Run tests before committing code
- [ ] Add tests when fixing bugs

---

## 🎁 Benefits Recap

| Without Tests | With Tests |
|--------------|------------|
| Manual testing: 5 min per feature | Automated: 5 sec |
| Bugs found by users | Bugs caught instantly |
| Scared to refactor | Confident changes |
| No documentation | Tests ARE docs |
| Slow deployments | Fast, safe deploys |

---

## 🆘 Quick Reference

### Run Commands
```bash
npm test                          # Run all tests
npm test -- --watch              # Watch mode
npm test -- --coverage           # Coverage report
npm test -- FeedbackPage         # Specific file
npm test -- --testNamePattern="should submit"  # Specific test
```

### Key Functions
```typescript
render(<Component />)             // Render component
screen.getByText('text')         // Find element
fireEvent.press(element)         // Click/press
fireEvent.changeText(input, 'x') // Type text
await waitFor(() => {...})       // Wait for async
expect(x).toBe(y)                // Assert equal
expect(x).toBeTruthy()           // Assert exists
jest.fn()                        // Create mock
```

---

## 📞 Need Help?

1. Check test files in `src/tests/` for examples
2. Read `src/tests/README.md` for detailed guide
3. Check [Jest docs](https://jestjs.io/)
4. Check [Testing Library docs](https://testing-library.com/)

**Remember**: Every test you write today saves hours of debugging tomorrow! 🎯
