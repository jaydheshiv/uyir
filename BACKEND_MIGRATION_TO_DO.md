# Backend Migration to DigitalOcean - Status

## ✅ Completed Updates

### Configuration Files
- ✅ `src/config/api.ts` - Updated to use DigitalOcean IPs
  - Main API: `http://139.59.52.58:8081`
  - Knowledge API: `http://139.59.52.58:8080`
- ✅ `src/utils/api.ts` - Updated base URL to `http://139.59.52.58:8081`
- ✅ `src/config/livekit.config.ts` - Updated API base URL
- ✅ `src/screens/Avatarhome1.tsx` - Updated visualization endpoint

## ⚠️ Files That Still Need Updating

### High Priority (User-Facing Features)
1. **`src/screens/Connections.tsx`** (Line 77-78)
   - Current: `http://10.0.2.2:8000/therapist/recommendations`
   - Should be: `http://139.59.52.58:8081/therapist/recommendations`

2. **`src/screens/Connections1.tsx`** (Line 34-35)
   - Current: `http://10.0.2.2:8000/professionals/`
   - Should be: `http://139.59.52.58:8081/professionals/`

3. **`src/screens/CreateAvatar1.tsx`** (Line 66-67)
   - Current: `http://10.0.2.2:8000/api/avatar/upload`
   - Should be: `http://139.59.52.58:8081/api/avatar/upload`

4. **`src/screens/CreateAvatar3.tsx`** (Lines 67-68, 102-103)
   - Current: `http://10.0.2.2:8000/professional/`
   - Should be: `http://139.59.52.58:8081/professional/`
   - Current: `http://10.0.2.2:8000/professional/profile-image`
   - Should be: `http://139.59.52.58:8081/professional/profile-image`

5. **`src/screens/CreateAccount.tsx`** (Line 80-81)
   - Current: `http://10.0.2.2:8000/api/avatar/personalize/...`
   - Should be: `http://139.59.52.58:8081/api/avatar/personalize/...`

6. **`src/screens/Discoverprotier.tsx`** (Line 58)
   - Current: `http://10.0.2.2:8000`
   - Should be: `http://139.59.52.58:8081`

7. **`src/screens/Avatar.tsx`** (Line 32)
   - Current: `http://10.0.2.2:8000`
   - Should be: `http://139.59.52.58:8081`

## 🎯 Recommended Approach

Instead of hardcoding URLs in each file, **import from the centralized config**:

```typescript
import { API_BASE_URL, buildUrl } from '../config/api';

// Then use:
const url = buildUrl('/therapist/recommendations');
// or
const url = `${API_BASE_URL}/therapist/recommendations`;
```

This way, future changes only need to be made in one place.

## 🔍 Docker Container Information

### Active Containers on DigitalOcean (139.59.52.58)

1. **uyirapp_app_1** (Main Application)
   - Internal Port: 8000
   - External Port: 8081
   - URL: `http://139.59.52.58:8081`
   - Endpoints: `/api/visualize`, `/docs`, etc.

2. **production-introspect-labs** (Knowledge Base)
   - Internal Port: 8000
   - External Port: 8080
   - URL: `http://139.59.52.58:8080`
   - Endpoints: Knowledge API, Persona API

3. **Supporting Services**
   - Redis: Port 6379
   - PostgreSQL: Port 5432
   - Qdrant (Vector DB): Ports 6333-6334
   - ClickHouse: Ports 8123, 9000
   - OTEL Collector: Port 4317

## 🔐 SSH Access

```bash
ssh -i D:\INTERN\MyFirstApp\id_ed25519.pem jay@139.59.52.58
```

## 📋 Next Steps

1. Update remaining screens to use centralized config
2. Test all endpoints from React Native app
3. Verify authentication flows work with new backend
4. Test file uploads (avatar, knowledge base)
5. Test LiveKit video calls
6. Monitor logs for any connection issues

## 🐛 Testing Commands on Server

```bash
# View logs
sudo docker logs -f uyirapp_app_1

# Check container status
sudo docker ps

# Test endpoints
curl http://localhost:8081
curl http://localhost:8081/docs
curl http://localhost:8081/api/visualize

# Restart if needed
sudo docker restart uyirapp_app_1
```
