# LiveKit Integration Flow Diagram

## 📊 Complete Session Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER BOOKING FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

1. Browse Professionals
   └─> Connections1.tsx
       ├─> Fetches: GET /professionals/
       └─> Shows: List of professionals

2. View Professional Profile
   └─> PublicMicrositePTView.tsx
       ├─> Tabs: Twin Window, About, Subscribe, Book Session
       └─> Book Session Tab:
           ├─> Calendar (react-native-calendars)
           ├─> Available slots from backend
           └─> Book button

3. Book Session
   └─> POST /professionals/{professional_id}/sessions
       Request Body: {
         professional_id: "uuid",
         slot_id: "uuid",
         booking_notes: null
       }
       Response: {
         session_id: "uuid",
         start_time: "2025-10-27T10:00:00Z",
         end_time: "2025-10-27T11:00:00Z",
         status: "scheduled",
         cost: 7.5
       }

4. View Booked Sessions
   └─> UpComingUserSessions.tsx
       ├─> Fetches: GET /sessions/my-bookings
       ├─> Shows: Time, Date, Payment, Status
       └─> Start Button Logic:
           ├─> Before (start_time - 15 mins): "Scheduled"
           ├─> Within window: "Start" button (clickable)
           └─> After end_time: "Completed"

┌─────────────────────────────────────────────────────────────────────────┐
│                      LIVEKIT CONNECTION FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

5. User Clicks "Start"
   └─> UpComingUserSessions.tsx
       ├─> Validates timing (15 mins before to end_time)
       └─> Calls: POST /sessions/{session_id}/generate-call-link

6. Backend Generates LiveKit Credentials
   ┌─────────────────────────────────────────────────────┐
   │ Backend Process:                                    │
   │ 1. Validates session timing                         │
   │ 2. Checks user permissions                          │
   │ 3. Creates/retrieves LiveKit room                   │
   │ 4. Generates participant token with roles           │
   │ 5. Returns credentials                              │
   └─────────────────────────────────────────────────────┘
   
   Response: {
     "session_id": "uuid",
     "room_name": "session-uuid-professional-uuid",
     "room_sid": "RM_xxx",
     "call_url": "https://...",
     "livekit_url": "wss://uyir-dm431fc1.livekit.cloud",
     "participant_identity": "subscriber:user-uuid",
     "participant_role": "subscriber",
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_ttl_seconds": 3600
   }

7. Navigate to Video Call
   └─> BookedSession.tsx
       ├─> Receives: livekitUrl, accessToken, roomName, participantIdentity
       ├─> Shows: "Connecting..." loading screen
       └─> Connects to LiveKit room
           ┌───────────────────────────────────────────┐
           │ Current: Mock Implementation              │
           │ - Simulates 2-second connection           │
           │ - Shows mock video interface              │
           │                                           │
           │ Future: Real Implementation               │
           │ - Install @livekit/react-native           │
           │ - Connect with: room.connect(url, token)  │
           │ - Render: Video/audio tracks              │
           │ - Handle: Mute, video toggle, end call    │
           └───────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     PROFESSIONAL SESSION FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

8. Professional View
   └─> UpComingSessions.tsx
       ├─> Fetches: GET /professional/sessions
       ├─> Shows: User ID, Time, Date, Status
       ├─> Start Button Logic: Same as user view
       └─> Calls same generate-call-link endpoint
           └─> But receives role: "professional"

9. Both Users in Room
   ┌─────────────────────────────────────────────────────┐
   │ LiveKit Room State:                                 │
   │                                                     │
   │ Room: "session-uuid-professional-uuid"             │
   │                                                     │
   │ Participant 1 (Professional):                       │
   │   identity: "professional:prof-uuid"               │
   │   role: "professional"                             │
   │   permissions: publish, subscribe, admin           │
   │                                                     │
   │ Participant 2 (User):                              │
   │   identity: "subscriber:user-uuid"                 │
   │   role: "subscriber"                               │
   │   permissions: publish, subscribe                  │
   │                                                     │
   │ Both can see/hear each other ✅                    │
   └─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING                                    │
└─────────────────────────────────────────────────────────────────────────┘

Frontend Error Scenarios:

1. Session Timing Error (400)
   ├─> User tries to start too early or too late
   ├─> Backend rejects with: "LiveKit room can only be created during scheduled window"
   └─> Frontend shows: "Session Not Started - wait until scheduled time"

2. Permission Error (403)
   ├─> User not authorized for this session
   └─> Frontend shows: "Access Denied"

3. Session Not Found (404)
   ├─> Invalid session_id
   └─> Frontend shows: "Session Not Found"

4. Network Error
   ├─> Backend unreachable
   └─> Frontend shows: "Could not connect to backend"

5. LiveKit Connection Error
   ├─> Invalid token or URL
   └─> Frontend shows: "Failed to connect to video call"

┌─────────────────────────────────────────────────────────────────────────┐
│                      CONFIGURATION SUMMARY                               │
└─────────────────────────────────────────────────────────────────────────┘

Backend Config (Already Set ✅):
├─> LIVEKIT_URL=wss://uyir-dm431fc1.livekit.cloud
├─> LIVEKIT_API_KEY=API9skRsqUyrFGy
├─> LIVEKIT_API_SECRET=[configured]
└─> LIVEKIT_TOKEN_TTL_SECONDS=3600

Frontend Config (Already Set ✅):
├─> File: src/config/livekit.config.ts
├─> LIVEKIT_URL: wss://uyir-dm431fc1.livekit.cloud
├─> API_BASE_URL: Platform-specific (Android/iOS)
└─> Helper functions for endpoints

Session Timing Rules:
├─> Booking: Anytime (professional sets available slots)
├─> Start Button Appears: 15 minutes before start_time
├─> Can Join: start_time to end_time
└─> After end_time: Marked as "Completed"

Token Details:
├─> Format: JWT signed by backend
├─> TTL: 3600 seconds (1 hour)
├─> Contains: participant identity, room name, permissions
└─> Generated fresh for each session start

┌─────────────────────────────────────────────────────────────────────────┐
│                         TESTING GUIDE                                    │
└─────────────────────────────────────────────────────────────────────────┘

Test Scenario 1: Happy Path (Mock Mode)
├─> 1. Create professional account
├─> 2. Add availability slots (SessionSettings.tsx)
├─> 3. Create user account
├─> 4. Browse professionals (Connections1.tsx)
├─> 5. View professional profile (PublicMicrositePTView.tsx)
├─> 6. Book a session with start_time = now
├─> 7. Go to "All Booked Sessions"
├─> 8. Click "Start" button
├─> 9. See mock video call screen
└─> 10. End call and return

Test Scenario 2: Timing Validation
├─> 1. Book session with start_time = 2 hours from now
├─> 2. Go to "All Booked Sessions"
├─> 3. See status: "Scheduled" (no Start button)
├─> 4. Wait until 15 mins before start_time
├─> 5. Refresh screen
└─> 6. See "Start" button appear

Test Scenario 3: Error Handling
├─> 1. Try to start session too early
├─>    Expected: "Session Not Started" alert
├─> 2. Disconnect internet
├─>    Expected: "Network Error" alert
├─> 3. Try invalid session_id
└─>    Expected: "Session Not Found" alert

Test Scenario 4: Professional View
├─> 1. Login as professional
├─> 2. Go to UpComingSessions.tsx
├─> 3. See booked sessions with user IDs
├─> 4. Click "Start" when time arrives
├─> 5. Receive role: "professional"
└─> 6. Join same room as user

┌─────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION STATUS                               │
└─────────────────────────────────────────────────────────────────────────┘

✅ COMPLETED:
├─> Backend LiveKit integration
├─> Frontend configuration files
├─> API endpoint integration
├─> Session timing logic
├─> Error handling
├─> Comprehensive logging
├─> Mock video call UI
└─> Navigation flow

🔄 IN PROGRESS (Next Sprint):
├─> Install @livekit/react-native
├─> Configure iOS permissions
├─> Configure Android permissions
├─> Implement real video rendering
├─> Implement audio handling
├─> Test with 2 users simultaneously
├─> Add reconnection logic
└─> Polish video call UI

┌─────────────────────────────────────────────────────────────────────────┐
│                         KEY FILES                                        │
└─────────────────────────────────────────────────────────────────────────┘

Configuration:
└─> src/config/livekit.config.ts (NEW)
    ├─> LIVEKIT_CONFIG constants
    ├─> ParticipantRole enum
    ├─> Helper functions
    └─> Validation functions

Session Screens:
├─> src/screens/UpComingUserSessions.tsx (UPDATED)
│   ├─> User's booked sessions
│   ├─> Start button logic
│   └─> Generate call link
│
├─> src/screens/UpComingSessions.tsx (UPDATED)
│   ├─> Professional's sessions
│   ├─> Same logic as user view
│   └─> Professional role
│
└─> src/screens/BookedSession.tsx (UPDATED)
    ├─> Video call interface
    ├─> Mock implementation (current)
    └─> TODO: Real LiveKit integration

Booking Screens:
├─> src/screens/Connections1.tsx
│   └─> Browse professionals
│
├─> src/screens/PublicMicrositePTView.tsx
│   ├─> Professional profile
│   ├─> Book Session tab
│   └─> Calendar + slot selection
│
└─> src/screens/SessionSettings.tsx
    └─> Professional availability management

Documentation:
├─> BACKEND_LIVEKIT_QUESTIONS.md (Backend response)
├─> LIVEKIT_FRONTEND_IMPLEMENTATION.md (Implementation guide)
├─> LIVEKIT_INTEGRATION_SUMMARY.md (Quick summary)
├─> LIVEKIT_SETUP_GUIDE.md (Setup options)
└─> LIVEKIT_FLOW_DIAGRAM.md (THIS FILE)

┌─────────────────────────────────────────────────────────────────────────┐
│                          QUICK COMMANDS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Start Backend:
├─> cd backend
└─> docker-compose up

Start Frontend:
├─> npm run android  (for Android)
└─> npm run ios      (for iOS)

Check Backend Health:
└─> curl http://localhost:8000/

Test Generate Call Link:
└─> curl -X POST http://localhost:8000/sessions/{session_id}/generate-call-link \
    -H "Authorization: Bearer {token}"

View LiveKit Dashboard:
└─> https://cloud.livekit.io/

┌─────────────────────────────────────────────────────────────────────────┐
│                            SUCCESS! 🎉                                   │
└─────────────────────────────────────────────────────────────────────────┘

Your LiveKit integration is now configured and ready to test!

✅ Backend: Production-ready with LiveKit Cloud
✅ Frontend: Fully integrated with mock video call
✅ Error Handling: Comprehensive and user-friendly
✅ Logging: Detailed for debugging
✅ Documentation: Complete implementation guide

Next step: Install LiveKit React Native SDK for real video calling!
```
