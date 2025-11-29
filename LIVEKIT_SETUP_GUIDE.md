# LiveKit Configuration Guide

## Error: Cannot connect to host your_livekit_url_here:443

This error occurs because your backend is configured with a placeholder LiveKit URL instead of a real LiveKit server.

## Solutions

### Option 1: Use LiveKit Cloud (Recommended for Production)

1. **Sign up for LiveKit Cloud**
   - Visit: https://cloud.livekit.io/
   - Create a free account
   - Get your API Key and Secret Key

2. **Configure Backend Environment Variables**
   ```bash
   # In your backend .env file or environment configuration
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your_api_key_here
   LIVEKIT_API_SECRET=your_api_secret_here
   ```

3. **Restart Backend Server**
   ```bash
   # Stop and restart your FastAPI backend
   ```

### Option 2: Run Local LiveKit Server (For Development)

1. **Install LiveKit Server using Docker**
   ```bash
   docker run --rm \
     -p 7880:7880 \
     -p 7881:7881 \
     -p 7882:7882/udp \
     -e LIVEKIT_KEYS="devkey: secret" \
     livekit/livekit-server \
     --dev
   ```

2. **Configure Backend for Local Server**
   ```bash
   # In your backend .env file
   LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```

3. **For Android Testing**
   - Android emulator needs special URL
   ```bash
   LIVEKIT_URL=ws://10.0.2.2:7880  # For Android emulator
   ```

### Option 3: Use LiveKit CLI (Quick Testing)

1. **Install LiveKit CLI**
   ```bash
   # macOS
   brew install livekit

   # Linux/Windows
   # Download from: https://github.com/livekit/livekit-cli/releases
   ```

2. **Start Local Server**
   ```bash
   livekit-server --dev
   ```

3. **Configure Backend**
   ```bash
   LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   ```

## Verify Configuration

After setting up, verify the configuration:

1. **Check Backend Logs**
   - Look for "LiveKit configured" or similar messages
   - Should show the correct URL (not `your_livekit_url_here`)

2. **Test Session Creation**
   - Book a session from the app
   - Click "Start" when the time arrives
   - Should connect to LiveKit room successfully

## Backend Code Location

The LiveKit configuration is typically in:
- `/app/core/config.py` or similar
- Environment variables file (`.env`)

Look for:
```python
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "your_livekit_url_here")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
```

## Troubleshooting

### DNS Error Persists
- Clear backend cache/restart
- Verify environment variables are loaded
- Check Docker container if using containers

### Connection Timeout
- Check firewall settings
- Verify LiveKit server is running
- Test connection: `curl http://localhost:7880/`

### Android-Specific Issues
- Use `10.0.2.2` instead of `localhost` for emulator
- Use actual IP address for physical device
- Ensure LiveKit server is accessible from network

## Updated App Changes

The `UpComingUserSessions.tsx` has been updated to:

1. **Show Start Button at Right Time**
   - Appears 15 minutes before session start time
   - Disappears after session end time
   - Shows "Scheduled" before start time
   - Shows "Completed" after end time

2. **Better Error Messages**
   - Alerts now mention LiveKit configuration
   - Console logs for debugging

3. **Improved Status Logic**
   - Checks actual time vs session time
   - Validates call status from backend

## Next Steps

1. Choose one of the options above
2. Configure your backend with proper LiveKit credentials
3. Restart backend server
4. Test booking and starting a session
5. Monitor console logs for any issues
