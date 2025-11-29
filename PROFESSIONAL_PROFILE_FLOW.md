# Professional Profile Detection Flow

## Overview
The app now automatically detects if a user has a professional profile and shows the appropriate ProfileScreen view.

## API Integration

### Professional Profile Check
**Endpoint:** `GET /professional/`
**Headers:** `Authorization: Bearer {token}`

**Response (Success - 200):**
```json
{
  "professional_id": "uuid",
  "user_id": "uuid",
  "display_name": "string",
  "bio": "string",
  "about": "string",
  "session_price_per_hour": 50.00
}
```

**Response (Not Found - 404):**
User does not have a professional profile.

## User Flow with Professional Check

### 🆕 New User (First Time Signup):
```
1. Signup → OTP Verify
2. GrantedScreen (Welcome)
3. CreateAvatar1 (Upload avatar)
4. CreateAccount (Fill profile details)
5. Avatarhome1 (Main app)
6. ProfileScreen → Shows BASIC view (no professional data)
   - Display name, email, phone
   - "Upgrade" button visible
   - Can click "Upgrade" to start pro flow
```

### 👤 Returning User WITH Professional Profile:
```
1. Login → OTP Verify
2. Backend returns: avatar_id ✅
3. ✅ Mark: hasCreatedAvatar = true
4. ✅ Mark: hasCompletedProfile = true
5. 🔍 Check: GET /professional/ → 200 OK
6. ✅ Mark: hasAcceptedProTerms = true
7. ✅ Mark: hasCreatedProfessional = true
8. GrantedScreen (Welcome)
9. Avatarhome1 (Main app)
10. ProfileScreen → Shows PROFESSIONAL view
    - Avatar with subscriber count
    - Avatar analytics (Views, Engagement)
    - "View my microsite" button
    - "View public microsite" button
    - Full professional menu
```

### 👤 Returning User WITHOUT Professional Profile:
```
1. Login → OTP Verify
2. Backend returns: avatar_id ✅
3. ✅ Mark: hasCreatedAvatar = true
4. ✅ Mark: hasCompletedProfile = true
5. 🔍 Check: GET /professional/ → 404 Not Found
6. ⚠️ No professional profile
7. GrantedScreen (Welcome)
8. Avatarhome1 (Main app)
9. ProfileScreen → Shows BASIC view
    - Display name, email, phone
    - "Upgrade" button visible
    - Can upgrade to pro anytime
```

## Code Implementation

### OTPVerificationScreenlogin.tsx

```typescript
// After successful login and avatar_id check
if (userData.avatar_id) {
  markAvatarCreated();
  markProfileComplete();
  
  // ✅ Check if user has professional profile
  checkProfessionalProfile(token);
}

// Function to check professional profile
const checkProfessionalProfile = async (userToken: string) => {
  const response = await fetch('http://10.0.2.2:8000/professional/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    // Professional profile exists
    const data = await response.json();
    markProTermsAccepted();
    markProfessionalCreated();
    console.log('✅ User is a professional');
  } else if (response.status === 404) {
    // No professional profile
    console.log('⚠️ No professional profile found');
  }
};
```

### ProfileScreen.tsx

```typescript
const { hasAcceptedProTerms } = useProfessional();

// Conditional rendering
{hasAcceptedProTerms ? (
  // Professional view: analytics, microsite buttons, subscriber count
  <ProfessionalView />
) : (
  // Basic view: simple profile with "Upgrade" button
  <BasicView />
)}
```

## State Management

### Zustand Store Flags

```typescript
interface AppState {
  hasCompletedProfile: boolean;      // ✅ User filled basic profile
  hasCreatedAvatar: boolean;         // ✅ User uploaded avatar
  hasCreatedProfessional: boolean;   // ✅ User created professional profile
  hasAcceptedProTerms: boolean;      // ✅ User accepted pro terms & has pro account
}
```

### Flag Determination

| Flag | Set When |
|------|----------|
| `hasCreatedAvatar` | Backend returns `avatar_id` OR user uploads avatar |
| `hasCompletedProfile` | Backend returns `avatar_id` OR user fills profile |
| `hasCreatedProfessional` | `GET /professional/` returns 200 OK |
| `hasAcceptedProTerms` | `GET /professional/` returns 200 OK |

## ProfileScreen Views

### Basic View (hasAcceptedProTerms = false)
- Curved purple header
- Avatar image
- Display name
- Email and phone number
- **"Upgrade" button** (purple, prominent)
- Basic menu options
- No analytics section
- No microsite buttons

### Professional View (hasAcceptedProTerms = true)
- No curved header
- Avatar image (smaller, left-aligned)
- Display name + subscriber count
- **"Avatar analytics - Last 28 days"**
- Analytics cards: Views, Engagement time
- **"View my microsite" button**
- **"View public microsite" button**
- Full professional menu options

## Upgrade Flow

When user clicks "Upgrade" button from basic ProfileScreen:
```
1. TermsAndConditions (Accept pro terms)
   ↓ markProTermsAccepted()
2. SeePlans (Choose plan)
3. ProLite/ProPlus (Plan details)
4. ChoosePaymentMethod
5. DebitCreditCard
6. PaymentSuccessful
7. LetUsKnowYou (Professional profile form)
   ↓ API: POST /professional/create
   ↓ markProfessionalCreated()
8. ProfileScreen → Now shows PROFESSIONAL view!
```

## Console Logs

### User with Professional Profile:
```
✅ User has avatar_id: abc123 - marking as returning user
🔍 Checking professional profile...
✅ Professional profile found: {professional_id: "...", display_name: "..."}
✅ User is a professional - will show professional ProfileScreen
👤 Returning user from GrantedScreen - navigating to Avatarhome1
```

### User without Professional Profile:
```
✅ User has avatar_id: abc123 - marking as returning user
🔍 Checking professional profile...
⚠️ No professional profile found - will show basic ProfileScreen with Upgrade button
👤 Returning user from GrantedScreen - navigating to Avatarhome1
```

## Testing Checklist

### Test New User:
- [ ] Signup and complete onboarding
- [ ] Navigate to ProfileScreen
- [ ] Should see BASIC view with "Upgrade" button
- [ ] Click "Upgrade" and complete pro flow
- [ ] ProfileScreen should now show PROFESSIONAL view

### Test Returning Professional User:
- [ ] Login with account that has professional profile
- [ ] Backend should return avatar_id
- [ ] GET /professional/ should return 200 OK
- [ ] Should navigate to Avatarhome1
- [ ] ProfileScreen should show PROFESSIONAL view immediately

### Test Returning Basic User:
- [ ] Login with account that has NO professional profile
- [ ] Backend should return avatar_id
- [ ] GET /professional/ should return 404
- [ ] Should navigate to Avatarhome1
- [ ] ProfileScreen should show BASIC view with "Upgrade" button

## Error Handling

```typescript
try {
  const response = await fetch('/professional/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    // Has professional profile
  } else if (response.status === 404) {
    // No professional profile (normal for basic users)
  } else {
    // Other errors
    console.error('Error checking professional:', response.status);
  }
} catch (error) {
  console.error('Network error:', error);
  // Don't block user flow - show basic view by default
}
```

## Summary

✅ **Automatic Detection**: App checks backend on login
✅ **Smart UI**: Shows correct ProfileScreen view automatically  
✅ **Seamless Upgrade**: Users can upgrade anytime from basic view
✅ **Persistent State**: Professional status survives app restarts
✅ **No Manual Config**: Everything driven by backend data

The app now perfectly mimics Instagram-style onboarding with added professional profile detection! 🎉
