# Backend LiveKit Configuration Fix

## ⚠️ Critical Issue

The backend is using placeholder LiveKit URL: `"your_livekit_url_here"`

**Error:** 
```
ClientConnectorDNSError: Cannot connect to host your_livekit_url_here:443
```

---

## ✅ Correct Configuration

Update your backend with these values:

### **LiveKit Cloud Configuration:**
```python
# Environment Variables or Config File
LIVEKIT_URL = "wss://uyir-dm431fc1.livekit.cloud"
LIVEKIT_API_KEY = "API9skRsqUyrFGy"
LIVEKIT_API_SECRET = "[Your Secret Key]"  # You provided this earlier
```

### **Location to Update:**

**File:** `/app/app/api/session_booking.py` (line ~287)

**Current Code (WRONG):**
```python
room_info = await lk_api.room.create_room(
    # Using placeholder URL
)
```

**Should Initialize LiveKit API Like This:**
```python
from livekit import api

# Initialize LiveKit API
lk_api = api.LiveKitAPI(
    url="wss://uyir-dm431fc1.livekit.cloud",  # ← MUST USE THIS URL
    api_key="API9skRsqUyrFGy",
    api_secret="YOUR_SECRET_KEY_HERE"
)

# Then create room
room_info = await lk_api.room.create_room(
    api.CreateRoomRequest(name=room_name)
)
```

---

## 📋 Backend Checklist

- [ ] Update `LIVEKIT_URL` in environment variables
- [ ] Update `LIVEKIT_API_KEY` in environment variables  
- [ ] Update `LIVEKIT_API_SECRET` in environment variables
- [ ] Restart backend service (Docker container)
- [ ] Test endpoint: `POST /professional/sessions/{session_id}/generate-call-link`

---

## 🧪 Quick Test

After fixing backend, test with curl:

```bash
curl -X POST "http://localhost:8000/professional/sessions/YOUR_SESSION_ID/generate-call-link" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "session_id": "...",
  "room_name": "...",
  "livekit_url": "wss://uyir-dm431fc1.livekit.cloud",  ← Should be this!
  "access_token": "...",
  ...
}
```

---

## 🔧 Docker Configuration

If backend runs in Docker, update `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - LIVEKIT_URL=wss://uyir-dm431fc1.livekit.cloud
      - LIVEKIT_API_KEY=API9skRsqUyrFGy
      - LIVEKIT_API_SECRET=your_secret_key_here
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

---

## 📱 After Backend Fix

Once backend is fixed:
1. Frontend is already configured correctly ✅
2. App will connect to LiveKit successfully ✅
3. Video calls will work ✅

---

## 💡 Frontend is Ready!

The frontend (`BookedSession.tsx`, `UpComingSessions.tsx`, `UpComingUserSessions.tsx`) is already configured with:
- ✅ Correct LiveKit URL fallback
- ✅ Proper token handling
- ✅ URL validation and warnings

**The issue is 100% on backend side - they need to update the placeholder URL!**
