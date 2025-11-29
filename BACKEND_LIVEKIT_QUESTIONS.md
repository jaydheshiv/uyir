# LiveKit Configuration Questions for Backend Team

Please provide the following information about your LiveKit setup so we can properly configure the frontend React Native application:

---

## 1. LiveKit Server Type

**Question**: Which LiveKit setup are you using?
- [ ] LiveKit Cloud (hosted)
- [ ] Self-hosted LiveKit Server (Docker/bare metal)
- [ ] Local development server
- [ ] Not configured yet (using placeholder)

---

## 2. LiveKit Connection Details

**Question**: What is the LiveKit WebSocket URL?
```
Example formats:
- LiveKit Cloud: wss://your-project.livekit.cloud
- Local Docker: ws://localhost:7880
- Custom: wss://your-domain.com
```

**Please provide**:
- **LiveKit URL**: `_____________________`
- **For Android emulator, should we use**: 
  - [ ] Same URL as above
  - [ ] Special URL: `_____________________`
- **For iOS simulator, should we use**:
  - [ ] Same URL as above
  - [ ] Special URL: `_____________________`

---

## 3. API Credentials Status

**Question**: Are the LiveKit API credentials properly configured in the backend?
- [ ] Yes, fully configured
- [ ] Partially configured
- [ ] Not configured (still using placeholders)

**If configured, confirm these environment variables are set**:
- `LIVEKIT_URL`: [ ] Set [ ] Not set
- `LIVEKIT_API_KEY`: [ ] Set [ ] Not set
- `LIVEKIT_API_SECRET`: [ ] Set [ ] Not set

---

## 4. Backend Endpoint Information

**Question**: Which backend endpoint generates the call link and LiveKit token?

**Current endpoint we're calling**:
```
POST /sessions/{session_id}/generate-call-link
```

**Please confirm**:
- [ ] This endpoint exists and is working
- [ ] Different endpoint: `_____________________`

**Expected response format** (please confirm or correct):
```json
{
  "session_id": "uuid",
  "room_name": "string",
  "room_sid": "string",
  "call_url": "string",
  "livekit_url": "wss://...",
  "participant_identity": "string",
  "participant_role": "publisher|subscriber",
  "access_token": "jwt_token",
  "token_ttl_seconds": 3600
}
```

- [ ] Response format is correct
- [ ] Response format is different: (please provide actual format below)

---

## 5. Health Check Endpoint

**Question**: Is there a health check endpoint to verify LiveKit configuration?

**We tried calling**:
```bash
curl http://localhost:8000/health
```

**Please provide**:
- [ ] Health endpoint exists at: `_____________________`
- [ ] No health endpoint available
- [ ] LiveKit configuration can be checked via: `_____________________`

---

## 6. Error Details

**Question**: When we try to start a session, we get this error:
```
ClientConnectorDNSError: Cannot connect to host your_livekit_url_here:443 
ssl:default [Name or service not known]
```

**This indicates the backend is trying to connect to**: `your_livekit_url_here`

**Please confirm**:
- [ ] This is a configuration issue - LiveKit is not set up yet
- [ ] Environment variables are not loaded properly
- [ ] LiveKit server is down/unreachable
- [ ] Other: `_____________________`

---

## 7. Session Booking Flow

**Question**: What's the complete flow for starting a session?

**Current frontend flow**:
1. User books session → `POST /professionals/{professional_id}/sessions`
2. Session appears in list → `GET /sessions/my-bookings`
3. User clicks "Start" → `POST /sessions/{session_id}/generate-call-link`
4. Frontend receives LiveKit credentials
5. Frontend opens LiveKit room with credentials

**Please confirm**:
- [ ] Flow is correct
- [ ] Missing steps: `_____________________`
- [ ] Different flow: (please describe below)

---

## 8. Testing Recommendations

**Question**: How should we test the LiveKit integration?

**Please advise**:
- [ ] Use LiveKit Cloud playground: `_____________________`
- [ ] Set up local LiveKit server with these steps: `_____________________`
- [ ] Wait for production LiveKit setup
- [ ] Other: `_____________________`

---

## 9. Token Configuration

**Question**: What permissions/roles are configured in the LiveKit tokens?

**For users (clients)**:
- Can publish: [ ] Yes [ ] No
- Can subscribe: [ ] Yes [ ] No
- Can publish data: [ ] Yes [ ] No
- Room join enabled: [ ] Yes [ ] No

**For professionals (hosts)**:
- Can publish: [ ] Yes [ ] No
- Can subscribe: [ ] Yes [ ] No
- Can publish data: [ ] Yes [ ] No
- Room admin: [ ] Yes [ ] No
- Can update metadata: [ ] Yes [ ] No

---

## 10. Quick Setup Request

**If LiveKit is not configured yet**, please provide:

**Option A**: For quick development testing
```bash
# Run local LiveKit server
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server --dev

# Then set in backend:
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

**Option B**: For production
```
Sign up at: https://cloud.livekit.io/
Get credentials and provide them here:
- Project URL: _____________________
- API Key: _____________________
- API Secret: _____________________
```

**Which option do you prefer?**
- [ ] Option A (Local Docker)
- [ ] Option B (LiveKit Cloud)
- [ ] Other: `_____________________`

---

## 11. Timeline

**Question**: When will LiveKit be fully configured?
- [ ] Already configured (just need to restart backend)
- [ ] Within 1 hour
- [ ] Within 1 day
- [ ] Within 1 week
- [ ] Needs discussion: `_____________________`

---

## 12. Additional Information

**Any other details we should know?**
```
(Please provide any additional context, limitations, or special configurations)

```

---

## Frontend Team Needs

Once you provide the above information, we can:
1. ✅ Configure proper LiveKit URLs for Android/iOS
2. ✅ Handle authentication and token management
3. ✅ Test video/audio streaming
4. ✅ Implement error handling for connection issues
5. ✅ Add reconnection logic
6. ✅ Complete the session booking flow

---

## How to Respond

Please either:
1. **Fill out this form** and send it back
2. **Provide a quick summary** with:
   - LiveKit URL
   - Confirmation that backend is configured
   - Any special setup needed for Android/iOS
3. **Schedule a quick call** to discuss the setup

Thank you! 🙏
