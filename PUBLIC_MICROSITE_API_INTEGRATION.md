# Public Microsite PT View - API Integration

## Overview
This document describes the API endpoints integrated in `PublicMicrositePTView.tsx` for the professional's public profile page.

---

## API Endpoints

### 1. Get Professional Profile
**Endpoint**: `GET /professionals/{professional_id}`

**Purpose**: Fetch professional's profile information for display on their public microsite

**Request**:
```typescript
GET http://localhost:8000/professionals/{professional_id}
// OR
GET http://10.0.2.2:8000/professionals/{professional_id}  // Android emulator
```

**Headers**:
- None required (public endpoint)

**Response** (200 OK):
```json
{
  "professional_id": "prof_123",
  "user_id": "user_456",
  "display_name": "Dr. John Smith",
  "bio": "Certified therapist with 10+ years experience",
  "about": "I specialize in cognitive behavioral therapy and mindfulness practices...",
  "session_price_per_hour": 150
}
```

**Usage in Code**:
```typescript
const fetchProfessional = async () => {
  if (!professional_id) {
    console.warn('⚠️ No professional_id provided');
    return;
  }
  
  setLoading(true);
  const backendUrl = Platform.OS === 'android'
    ? `http://10.0.2.2:8000/professionals/${professional_id}`
    : `http://localhost:8000/professionals/${professional_id}`;
  
  try {
    const response = await fetch(backendUrl);
    
    if (response.ok) {
      const data = await response.json();
      setProfessional(data as Professional);
    } else {
      Alert.alert('Error', `Could not load professional profile`);
    }
  } catch (err) {
    Alert.alert('Network Error', 'Could not connect to server');
  } finally {
    setLoading(false);
  }
};
```

**Where It's Used**:
- ✅ **About Tab**: Displays `professional.about` text
- ✅ **Profile Header**: Shows `professional.display_name` and `professional.bio`
- ✅ **Subscriber Count**: Shows subscriber information (currently hardcoded as 2k)

---

### 2. Get Available Sessions
**Endpoint**: `GET /professionals/{professional_id}/sessions/available?date={YYYY-MM-DD}`

**Purpose**: Fetch available time slots for booking

**Request**:
```typescript
GET http://localhost:8000/professionals/{professional_id}/sessions/available?date=2025-10-26
```

**Headers**:
- None required (public endpoint for viewing availability)

**Response** (200 OK):
```json
{
  "status": "success",
  "slots": [
    {
      "slot_id": "slot_123",
      "start_time": "2025-10-26T09:00:00Z",
      "end_time": "2025-10-26T10:00:00Z",
      "price_per_hour": 150,
      "is_booked": false
    },
    {
      "slot_id": "slot_124",
      "start_time": "2025-10-26T14:00:00Z",
      "end_time": "2025-10-26T15:00:00Z",
      "price_per_hour": 150,
      "is_booked": false
    }
  ]
}
```

**Usage**: See LIVEKIT_VIDEO_CALL_FLOW.md for full implementation

---

### 3. Book a Session
**Endpoint**: `POST /professionals/{professional_id}/sessions`

**Purpose**: Book an available time slot

**Request**:
```typescript
POST http://localhost:8000/professionals/{professional_id}/sessions
Content-Type: application/json
Authorization: Bearer {token}

{
  "availability_slot_id": "slot_123",
  "booking_notes": "Looking forward to the session"
}
```

**Headers**:
- `Authorization: Bearer {token}` (required - user must be logged in)
- `Content-Type: application/json`

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "Session booked successfully",
  "session_id": "session_789",
  "professional_id": "prof_123",
  "user_id": "user_456",
  "availability_slot_id": "slot_123",
  "start_time": "2025-10-26T09:00:00Z",
  "end_time": "2025-10-26T10:00:00Z",
  "status": "scheduled"
}
```

**Usage**: See LIVEKIT_VIDEO_CALL_FLOW.md for full implementation

---

## Data Flow

### 1. Initial Page Load
```
User navigates to PublicMicrositePTView
  ↓
professional_id passed via route params
  ↓
fetchProfessional() called in useEffect
  ↓
GET /professionals/{professional_id}
  ↓
setProfessional(data)
  ↓
UI displays: name, bio, about, price
```

### 2. Viewing Profile (About Tab)
```
User clicks "About" tab
  ↓
Display professional.about text
  ↓
Show knowledge base cards (videos, posts)
  ↓
Option to upgrade for locked content
```

### 3. Booking a Session (Book Session Tab)
```
User clicks "Book Session" tab
  ↓
User selects date from calendar
  ↓
handleDateSelect(date) called
  ↓
GET /professionals/{id}/sessions/available?date=YYYY-MM-DD
  ↓
Display available slots
  ↓
User selects slot
  ↓
User clicks "Book Now"
  ↓
POST /professionals/{id}/sessions with slot_id
  ↓
Success: Navigate to UpComingUserSessions
```

---

## Professional Interface

```typescript
interface Professional {
  professional_id: string;      // Unique ID for the professional
  user_id: string;              // Associated user account ID
  display_name: string;         // Public display name
  bio?: string;                 // Short bio (1-2 sentences)
  about?: string;               // Detailed "About me" section
  session_price_per_hour?: number; // Default session price
}
```

---

## Component State

```typescript
const [professional, setProfessional] = useState<Professional | null>(null);
const [loading, setLoading] = useState(false);
```

**States**:
- `professional`: Stores fetched professional data
- `loading`: Shows loading state while fetching

---

## Error Handling

### Network Errors
```typescript
catch (err) {
  console.error('❌ Error fetching professional:', err);
  Alert.alert('Network Error', 'Could not connect to server. Please check your connection.');
}
```

### API Errors
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error('❌ Failed to fetch professional:', response.status, errorText);
  Alert.alert('Error', `Could not load professional profile: ${response.status}`);
}
```

### Missing professional_id
```typescript
if (!professional_id) {
  console.warn('⚠️ No professional_id provided');
  return;
}
```

---

## Logging & Debugging

All API calls include comprehensive logging:

```typescript
console.log('🔗 Fetching professional data from:', backendUrl);
console.log('📥 Professional data response status:', response.status);
console.log('✅ Professional data received:', JSON.stringify(data, null, 2));
console.error('❌ Failed to fetch professional:', response.status, errorText);
```

**Log Symbols**:
- 🔗 = API request
- 📥 = Response received
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning

---

## Testing Checklist

### Test Get Professional Profile:
1. ✅ Navigate from Connections1 to PublicMicrositePTView
2. ✅ Verify professional_id is passed correctly
3. ✅ Check console logs for API call
4. ✅ Verify professional data is displayed in UI
5. ✅ Test with invalid professional_id (should show error)
6. ✅ Test with no network connection (should show network error)

### Test About Tab:
1. ✅ Click "About" tab
2. ✅ Verify `professional.about` text is displayed
3. ✅ Verify bio is shown in header
4. ✅ Verify display name is correct
5. ✅ Check knowledge base cards display

### Test Missing Data:
1. ✅ Professional with no `about` field should show default text
2. ✅ Professional with no `bio` should show default bio
3. ✅ Loading state should show while fetching

---

## Navigation Flow

```
Connections1.tsx
  ↓ (User clicks therapist card)
navigation.navigate('PublicMicrositePTView', { professional_id: 'sadhguru_123' })
  ↓
PublicMicrositePTView.tsx
  ↓ (useEffect on mount)
fetchProfessional()
  ↓ (GET request)
Backend: /professionals/{professional_id}
  ↓ (Response)
setProfessional(data)
  ↓
Display in UI (About tab, header, etc.)
```

---

## Backend Requirements

The backend must implement:

### Endpoint
```python
@router.get("/professionals/{professional_id}")
async def get_professional(professional_id: str):
    """
    Get professional's public profile information.
    No authentication required - public endpoint.
    """
    professional = await get_professional_by_id(professional_id)
    
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    
    return {
        "professional_id": professional.professional_id,
        "user_id": professional.user_id,
        "display_name": professional.display_name,
        "bio": professional.bio,
        "about": professional.about,
        "session_price_per_hour": professional.session_price_per_hour
    }
```

### Database Schema
```sql
CREATE TABLE professionals (
    professional_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    about TEXT,
    session_price_per_hour DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Summary

The `PublicMicrositePTView.tsx` screen integrates with the following endpoints:

1. ✅ **GET /professionals/{professional_id}** - Fetches professional profile (IMPLEMENTED)
2. ✅ **GET /professionals/{professional_id}/sessions/available** - Fetches available slots (IMPLEMENTED)
3. ✅ **POST /professionals/{professional_id}/sessions** - Books a session (IMPLEMENTED)

All endpoints include:
- ✅ Proper error handling
- ✅ Loading states
- ✅ User feedback via alerts
- ✅ Comprehensive logging
- ✅ TypeScript type safety
