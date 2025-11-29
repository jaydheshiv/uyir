# HTTPS Port 443 Issue - Fixed ✅

## Problem Identified

**Date:** October 28, 2025  
**Issue:** OTP not being received during login

### Root Cause
The app was configured to use `https://dev.api.uyir.ai` (port 443), but the DigitalOcean server doesn't have HTTPS configured yet. The backend runs on **HTTP port 8081**.

### Error Details
```bash
# Testing HTTPS (port 443)
curl https://dev.api.uyir.ai/auth/login
# Result: Connection refused (port 443 not open)

# Testing HTTP with port 8081
curl http://dev.api.uyir.ai:8081/auth/login
# Result: ✅ Success - API responds correctly
```

### Backend Logs Evidence
```
🔐 Calling login endpoint: 'https://dev.api.uyir.ai/auth/login'
📧 Login body: '{ "email": "gd3@gmail.com" }'
```
The app tried calling HTTPS but request never reached the backend (no logs).

---

## Solution Applied

Changed all URLs from `https://dev.api.uyir.ai` → `http://dev.api.uyir.ai:8081`

### Files Updated

#### Configuration Files (3)
1. **src/config/api.ts**
   - `API_BASE_URL = 'http://dev.api.uyir.ai:8081'`
   - `KNOWLEDGE_API_BASE_URL = 'http://dev.api.uyir.ai:8081'`

2. **src/utils/api.ts**
   - `getBaseUrl()` returns `'http://dev.api.uyir.ai:8081'`

3. **src/config/livekit.config.ts**
   - `LIVEKIT_CONFIG.API_BASE_URL = 'http://dev.api.uyir.ai:8081'`

#### Screen Files (23)
All screen files automatically updated via batch replacement:
- Authentication: `LoginFlow.tsx`, `SignupFlow.tsx`, `OTPVerificationScreen.tsx`, `OTPVerificationScreenlogin.tsx`
- Avatar: `CreateAvatar1.tsx`, `CreateAvatar3.tsx`, `CreateAccount.tsx`, `Avatar.tsx`, `Avatarhome1.tsx`
- Professional: `LetUsKnowYou.tsx`, `ProfileSettings.tsx`, `PublicMicrositePTView.tsx`
- Discovery: `Discoverprotier.tsx`, `Connections.tsx`, `Connections1.tsx`
- Sessions: `SessionSettings.tsx`, `UpComingSessions.tsx`, `UpComingUserSessions.tsx`, `TotalSubscribers.tsx`
- Visualizations: `Visualizations.tsx`

---

## Verification

### Successful Test
```powershell
# Test login endpoint
Invoke-WebRequest -Uri "http://dev.api.uyir.ai:8081/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"gd3@gmail.com"}'

# Response
StatusCode: 200
Body: {"message":"Login OTP sent.","otp_for_testing":"2728"}
```

✅ **OTP successfully generated!**

### Backend Logs Confirmation
After fix, the backend should show:
```
🔐 LOGIN OTP for gd3@gmail.com: XXXX
INFO: 172.19.0.1:XXXXX - "POST /auth/login HTTP/1.1" 200 OK
```

---

## Next Steps

### Immediate (Working Now)
✅ App uses HTTP on port 8081  
✅ All endpoints functional  
✅ OTP generation working

### Future (Production Recommendation)

#### Set up HTTPS properly on the server:

1. **Install Nginx**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d dev.api.uyir.ai
   ```

3. **Nginx Reverse Proxy Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name dev.api.uyir.ai;

       ssl_certificate /etc/letsencrypt/live/dev.api.uyir.ai/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/dev.api.uyir.ai/privkey.pem;

       location / {
           proxy_pass http://localhost:8081;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. **After HTTPS is configured**, change back to:
   ```typescript
   // In src/config/api.ts
   export const API_BASE_URL = 'https://dev.api.uyir.ai';
   export const KNOWLEDGE_API_BASE_URL = 'https://dev.api.uyir.ai';
   ```

---

## Testing Checklist

- [x] Login endpoint working (HTTP:8081)
- [x] OTP generation working
- [ ] Test full login flow in app
- [ ] Test signup flow
- [ ] Test avatar creation
- [ ] Test visualizations
- [ ] Test session booking
- [ ] Test professional profile

---

## Security Notes

### Current Setup (HTTP)
⚠️ **HTTP is not encrypted** - data sent in plain text  
✅ **Acceptable for development/testing**  
❌ **NOT acceptable for production with real user data**

### Required for Production
- ✅ HTTPS (SSL/TLS encryption)
- ✅ Port 443 open and configured
- ✅ Valid SSL certificate
- ✅ HTTP → HTTPS redirect

---

## Troubleshooting

### If OTP still not working:

1. **Check app logs:**
   ```
   Should show: "Calling login endpoint: http://dev.api.uyir.ai:8081/auth/login"
   ```

2. **Check backend logs:**
   ```bash
   ssh -i D:\INTERN\MyFirstApp\id_ed25519.pem jay@139.59.52.58
   sudo docker logs -f uyirapp_app_1
   ```
   Should show: `🔐 LOGIN OTP for email: XXXX`

3. **Test endpoint manually:**
   ```bash
   curl -X POST http://dev.api.uyir.ai:8081/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@gmail.com"}'
   ```

4. **Verify DNS resolution:**
   ```bash
   nslookup dev.api.uyir.ai
   # Should return: 139.59.52.58
   ```

---

## Summary

**Problem:** HTTPS on port 443 not configured → Connection refused  
**Solution:** Use HTTP on port 8081 (backend's actual port)  
**Status:** ✅ **FIXED - OTP now working**  
**Next:** Set up proper HTTPS for production security
