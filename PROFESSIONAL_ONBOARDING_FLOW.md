# Professional Onboarding Flow

## Overview
This document describes the complete professional user onboarding flow after a user successfully creates their professional profile.

## Flow Sequence

### 1. **LetUsKnowYou.tsx** (Professional Profile Creation)
- **Purpose**: Collect professional information (display name, domains, specializations, bio, session price)
- **Backend**: `POST /professional/create` → 201 Created
- **Next Action**: On successful submit → Navigate to `UploadContent`
- **State Changes**: 
  - `markProfessionalCreated()` called
  - Professional profile created in backend

### 2. **UploadContent.tsx** (Content Upload - Optional)
- **Purpose**: Allow professionals to upload training content (documents, videos, audio, images)
- **Options**:
  - Upload files (implementation pending)
  - Skip for now
- **Next Action**: Both buttons → Navigate to `LetUsKnowYou2`

### 3. **LetUsKnowYou2.tsx** (Avatar Preview)
- **Purpose**: Show user how their professional avatar will appear and interact
- **Features**:
  - Avatar preview with image
  - Sample chat interface
  - Sound and refresh controls
- **Next Action**: "Looks Good" button → Navigate to `TermsAndConditions`

### 4. **TermsAndConditions.tsx** (Final Agreement)
- **Purpose**: User must accept professional terms before activation
- **Terms Covered**:
  1. Licensing Consent
  2. Ownership & Revenue
  3. Right to Withdraw
- **Next Action**: 
  - "Agree & Continue" button (enabled only when checkbox checked)
  - Calls `markProTermsAccepted()` → Sets professional status
  - Uses `navigation.reset()` → Navigate to `ProfileScreen`

### 5. **ProfileScreen.tsx** (Professional Dashboard)
- **Purpose**: Display professional profile with microsite access
- **Professional Features** (shown when `hasAcceptedProTerms === true`):
  - Avatar analytics (views, engagement time)
  - Subscriber count
  - "View my microsite" button
  - "View public microsite" button
- **State Check**: Screen checks `hasAcceptedProTerms` flag to show professional UI

## State Management (Zustand)

### Professional-Related Flags:
```typescript
hasCreatedProfessional: boolean    // Set after POST /professional/create (201)
hasAcceptedProTerms: boolean       // Set after accepting terms
professionalData: object | null    // Professional profile data
```

### Key Functions:
- `markProfessionalCreated()` - Sets `hasCreatedProfessional = true`
- `markProTermsAccepted()` - Sets `hasAcceptedProTerms = true`
- `markProfessionalNotCreated()` - Resets professional flags

## Backend Integration

### Endpoints Used:
1. `POST /professional/create` - Creates professional profile
   - Body: `{ display_name, domain_tag_ids[], sub_specialization_tag_ids[], bio?, about?, session_price_per_hour? }`
   - Response: 201 Created with professional data

2. `GET /professional/{user_id}` - Check professional status
   - Response: 200 OK (professional exists) or 404 (not professional)

3. `GET /professional/tags` - Fetch available domains and specializations
   - Response: `{ domain_tags: [...], sub_specialization_tags: [...] }`

## Navigation Summary

```
LetUsKnowYou (form submit)
    ↓
UploadContent (skip/upload)
    ↓
LetUsKnowYou2 (looks good)
    ↓
TermsAndConditions (agree & continue)
    ↓
ProfileScreen (with microsite buttons)
```

## Important Notes

1. **Professional Status Detection**:
   - ProfileScreen checks `hasAcceptedProTerms` to determine UI layout
   - If `true` → Show professional features (analytics, microsite buttons)
   - If `false` → Show basic user UI (upgrade button)

2. **Terms Acceptance is Final Step**:
   - User is NOT considered "professional" until terms are accepted
   - Creating profile (step 1) only creates backend record
   - Accepting terms (step 4) activates professional features in UI

3. **State Reset on Login**:
   - Professional flags reset when user logs in
   - `checkProfessionalProfile()` runs to verify backend status
   - Prevents stale data from previous sessions

4. **Navigation Method**:
   - Uses `navigation.reset()` at end to prevent back button issues
   - Ensures user lands on ProfileScreen without navigation stack

## Testing Checklist

- [ ] Create professional profile in LetUsKnowYou
- [ ] Verify backend returns 201 Created
- [ ] Navigate through UploadContent (skip or upload)
- [ ] See avatar preview in LetUsKnowYou2
- [ ] Accept terms in TermsAndConditions
- [ ] Verify ProfileScreen shows microsite buttons
- [ ] Verify analytics section appears
- [ ] Check subscriber count displays correctly
- [ ] Test microsite button navigation

## Future Enhancements

1. **UploadContent**: Implement actual file upload functionality
2. **LetUsKnowYou2**: Connect to real avatar data from backend
3. **Analytics**: Fetch real metrics from backend
4. **Microsite**: Complete microsite view implementation
