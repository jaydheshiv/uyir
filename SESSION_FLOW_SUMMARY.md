# Session Booking & Video Call Flow - Quick Reference

## 🔄 Complete Flow Diagram

```
PROFESSIONAL SIDE                    NORMAL USER SIDE
=================                    ================

1️⃣ SessionSettings.tsx              1️⃣ PublicMicrositePTView.tsx
   ↓                                    ↓
   Create Availability                  View Professional Profile
   - Select Date                        - Browse Available Slots
   - Set Time (start/end)              - Select Date & Time
   - Set Price                         - Book Session
   ↓                                    ↓
   POST /professional/sessions          POST /sessions/book
   /availability                        
   ↓                                    ↓

2️⃣ UpComingSessions.tsx              2️⃣ UpComingUserSessions.tsx
   ↓                                    ↓
   View Booked Sessions                 View My Bookings
   - Session List                       - Session List
   - Click "Start" Button               - Click "Start" Button
   ↓                                    ↓
   POST /sessions/{id}                  POST /sessions/{id}
   /generate-call-link                  /generate-call-link
   ↓                                    ↓
   Receive LiveKit Credentials          Receive LiveKit Credentials
   ↓                                    ↓

3️⃣ BookedSession.tsx    ←——————————————→    BookedSession.tsx
   │                                        │
   └────────── SAME LIVEKIT ROOM ──────────┘
   
   - Connect with accessToken
   - Same room_name
   - Video + Audio streams
   - Mute/Video controls
   - End call
```

---

## 📋 Key Screens & Responsibilities

### **SessionSettings.tsx** ✅ COMPLETED
- **Role**: Professional availability management
- **Status**: Fully integrated with backend
- **Endpoints**:
  - `POST /professional/sessions/availability` - Create slot
  - `GET /professional/sessions/availability` - List slots
  - `DELETE /professional/sessions/availability/{id}` - Delete slot
- **Features**:
  - Calendar date picker
  - Time input (HH:mm format)
  - Price validation ($1-$250)
  - View existing slots
  - Delete unbooked slots

### **PublicMicrositePTView.tsx** ⚠️ NEEDS INTEGRATION
- **Role**: User booking interface
- **Status**: UI exists, backend integration needed
- **Required Endpoints**:
  - `GET /professional/{id}/availability?date=YYYY-MM-DD` - Fetch available slots
  - `POST /sessions/book` - Book a session
- **Current Issue**: Using hardcoded time slots
- **Needed**: 
  - Fetch real availability from backend
  - Implement booking API call
  - Handle payment flow

### **UpComingSessions.tsx** ✅ COMPLETED
- **Role**: Professional session management
- **Status**: Fully integrated
- **Endpoints**:
  - `GET /professional/sessions` - List booked sessions
  - `POST /sessions/{id}/generate-call-link` - Get LiveKit credentials
- **Features**:
  - Pagination support
  - Pull to refresh
  - "Start" button for joining calls
  - Session status tracking

### **UpComingUserSessions.tsx** ✅ COMPLETED
- **Role**: User session management
- **Status**: Fully integrated
- **Endpoints**:
  - `GET /sessions/my-bookings` - List user's bookings
  - `POST /sessions/{id}/generate-call-link` - Get LiveKit credentials
- **Features**:
  - View booked sessions
  - "Start" button for joining calls
  - Payment status display

### **BookedSession.tsx** ❌ NEEDS LIVEKIT INTEGRATION
- **Role**: Video call interface (both sides use this)
- **Status**: UI mockup only
- **Required**: Full LiveKit SDK integration
- **Features Needed**:
  - LiveKit Room connection
  - Local video track (camera)
  - Remote video track (other participant)
  - Audio tracks
  - Mute/unmute controls
  - Video on/off controls
  - End call function
  - Connection state handling

---

## 🔑 Critical Data Flow

### **LiveKit Connection Process**

```typescript
// 1. User/Professional clicks "Start" button
handleStartSession(sessionId)
  ↓
// 2. Call backend to generate LiveKit token
POST /sessions/{sessionId}/generate-call-link
  ↓
// 3. Backend response (SAME for both participants)
{
  "session_id": "abc-123",
  "room_name": "session_abc-123",        // ← SAME room
  "livekit_url": "wss://livekit.example.com",
  "access_token": "eyJ...",              // ← Unique per participant
  "participant_identity": "user_xyz",     // ← Different per participant
  "participant_role": "professional"      // ← Different per participant
}
  ↓
// 4. Navigate to BookedSession with credentials
navigation.navigate('BookedSession', {
  sessionId,
  callUrl,
  accessToken,
  roomName,        // ← Key: Both join same room_name
  livekitUrl,
  participantIdentity,
  participantRole
})
  ↓
// 5. BookedSession connects to LiveKit
await room.connect(livekitUrl, accessToken)
  ↓
// 6. Both participants now in same room
// Video/audio streams automatically shared
```

---

## 🎯 Implementation Priority

### **HIGH PRIORITY** 🔴
1. **LiveKit SDK Integration in BookedSession.tsx**
   - Install dependencies
   - Configure permissions
   - Implement connection logic
   - Test video/audio streaming

2. **PublicMicrositePTView.tsx Backend Integration**
   - Fetch real availability slots
   - Implement booking endpoint
   - Handle booking errors

### **MEDIUM PRIORITY** 🟡
3. **Payment Flow Integration**
   - Payment processing before booking
   - Payment status tracking
   - Refund handling

4. **Error Handling & Edge Cases**
   - Network failures during call
   - Participant disconnection handling
   - Permission denied scenarios

### **LOW PRIORITY** 🟢
5. **Enhanced Features**
   - Call recording
   - Screen sharing
   - Chat during call
   - Call quality indicators

---

## 🧪 Testing Checklist

### **Availability Creation** (Professional)
- [ ] Professional can create slot successfully
- [ ] Validation works (time format, price range)
- [ ] Slots appear in list after creation
- [ ] Slots can be deleted if not booked

### **Booking Flow** (User)
- [ ] User can view professional's available slots
- [ ] User can select date and time
- [ ] Booking creates session successfully
- [ ] Booking appears in user's session list

### **Session Start** (Both Sides)
- [ ] Professional sees booked session
- [ ] User sees booked session
- [ ] "Start" button works for both
- [ ] LiveKit credentials generated correctly

### **Video Call** (Both Sides)
- [ ] Both connect to same room
- [ ] Professional sees user's video
- [ ] User sees professional's video
- [ ] Audio works bidirectionally
- [ ] Mute button works
- [ ] Video toggle works
- [ ] End call works gracefully

---

## 📞 Backend Endpoints Summary

| Endpoint | Method | Purpose | Who Calls |
|----------|--------|---------|-----------|
| `/professional/sessions/availability` | POST | Create availability slot | Professional |
| `/professional/sessions/availability` | GET | List professional's slots | Professional |
| `/professional/sessions/availability/{id}` | DELETE | Delete slot | Professional |
| `/professional/{id}/availability?date=...` | GET | View available slots | User |
| `/sessions/book` | POST | Book a session | User |
| `/professional/sessions` | GET | List professional's bookings | Professional |
| `/sessions/my-bookings` | GET | List user's bookings | User |
| `/sessions/{id}/generate-call-link` | POST | Get LiveKit credentials | Both |

---

## 🚀 Quick Start Guide

### For Professional Users:
1. Go to **SessionSettings** → Create availability slots
2. Wait for users to book
3. Go to **UpComingSessions** → See bookings
4. Click "Start" when session time arrives
5. Connect in **BookedSession** video call

### For Normal Users:
1. Browse professional profiles in **PublicMicrositePTView**
2. Select available slot and book
3. Go to **UpComingUserSessions** → See bookings
4. Click "Start" when session time arrives
5. Connect in **BookedSession** video call

---

**Next Steps**: 
1. Install LiveKit dependencies
2. Integrate LiveKit in BookedSession.tsx
3. Update PublicMicrositePTView.tsx with real availability
4. Test end-to-end flow

**Documentation**: See `LIVEKIT_VIDEO_CALL_FLOW.md` for detailed implementation guide.
