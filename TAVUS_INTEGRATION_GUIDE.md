# Tavus Conversational Video Interface (CVI) Integration Guide

## 📋 Overview

This guide explains how to integrate Tavus AI-powered video conversations into your React Native app. Tavus allows professionals to create AI replicas (digital twins) that can have real-time video conversations with clients.

## 🎯 What's Been Implemented

### 1. **Tavus Service** (`src/services/tavusService.ts`)
- API integration for creating and managing Tavus conversations
- Functions to create conversations, get conversation details, and end conversations
- Helper function `createProfessionalConversation()` specifically for professional-client interactions

### 2. **TavusConversation Component** (`src/components/TavusConversation.tsx`)
- Full-featured video call interface using Daily.co SDK
- Camera and microphone controls
- Noise cancellation support
- Participant tracking
- Error handling and loading states

### 3. **PublicMicrositePTView Screen** (Updated)
- Integrated Tavus conversation in the "Twin Window" tab
- Button to start video conversations with professional's AI twin
- Seamless transition from text-based chat to video conversation

## 🚀 Setup Instructions

### Step 1: Get Tavus API Credentials

1. Sign up at [Tavus Platform](https://platform.tavus.io/)
2. Navigate to your dashboard and get your API key
3. Create a replica (AI twin) for each professional user
4. Note down the `replica_id` for each professional

### Step 2: Configure API Key

Update `src/services/tavusService.ts`:

```typescript
const TAVUS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

**Security Note**: In production, store API keys securely:
- Use a backend service to proxy Tavus API calls
- Never commit API keys to version control
- Use environment-specific configuration

### Step 3: Add replica_id to Professional Model

Update your backend API to include `replica_id` in the professional profile response:

```json
{
  "professional_id": "prof123",
  "user_id": "user456",
  "display_name": "Dr. Smith",
  "bio": "Licensed therapist...",
  "about": "Specializing in...",
  "session_price_per_hour": 100,
  "replica_id": "rfe12d8b9597"  // ← Add this field
}
```

### Step 4: Create Replicas for Professionals

For each professional user, you need to:

1. **Record Video**: Professional records a video (5-10 minutes recommended)
2. **Upload to Tavus**: Use Tavus API to create replica
3. **Store replica_id**: Save the returned `replica_id` in your database

Example API call to create a replica:

```bash
curl --request POST \
  --url https://tavusapi.com/v2/replicas \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: YOUR_API_KEY' \
  --data '{
    "train_video_url": "https://yourdomain.com/professional-video.mp4",
    "replica_name": "Dr. Smith",
    "callback_url": "https://yourdomain.com/webhook"
  }'
```

### Step 5: Configure Personas (Optional)

Personas define how the AI behaves in conversations. You can:

1. Create personas via Tavus dashboard or API
2. Add `persona_id` to professional profiles
3. Customize greeting, context, and behavior

## 📱 How It Works

### User Flow

```
1. User opens professional's microsite
   ↓
2. User clicks "Twin Window" tab
   ↓
3. User sees "Start Video Call" button
   ↓
4. User clicks button
   ↓
5. App calls createProfessionalConversation()
   ↓
6. Tavus API returns conversation_url (Daily.co room)
   ↓
7. TavusConversation component joins the call
   ↓
8. User sees video interface with AI twin
   ↓
9. Real-time video conversation begins
   ↓
10. User can toggle camera/mic, enable noise cancellation
    ↓
11. User leaves call when done
```

### Technical Flow

```typescript
// 1. User clicks "Start Video Call"
startTavusConversation()

// 2. Create conversation via Tavus API
const conversation = await createProfessionalConversation(
  professional_id,
  replica_id,
  "You are a mental health professional..."
)

// 3. Get Daily.co room URL
conversation.conversation_url // "https://tavus.daily.co/c123456"

// 4. Render TavusConversation component
<TavusConversation
  conversationUrl={conversation.conversation_url}
  onLeave={handleLeaveTavusConversation}
/>

// 5. Component uses Daily.co SDK
DailyIframe.createCallObject({ url: conversationUrl })
daily.join({ userName: "User" })
```

## 🎨 UI Components

### Start Call Screen
- Professional's name and description
- "Start Video Call" button with video icon
- Loading indicator while connecting
- Descriptive text about AI twin conversations

### Active Call Screen
- Full-screen video interface
- Participant counter
- Control buttons:
  - 🎤 Microphone toggle
  - 📹 Camera toggle
  - 🔇 Noise cancellation
  - 📞 Leave call (red button)
- Status indicators

## 🔧 Customization Options

### Conversation Parameters

```typescript
{
  replica_id: "rfe12d8b9597",        // Required: Which AI twin
  persona_id: "p5317866",            // Optional: Behavior profile
  conversation_name: "Session with Dr. Smith",
  conversational_context: "Mental health support session",
  custom_greeting: "Hello! How can I help you today?",
  properties: {
    max_call_duration: 3600,         // 1 hour limit
    participant_left_timeout: 60,    // End call after 60s
    enable_recording: false,         // Record session?
    enable_transcription: false      // Transcribe session?
  }
}
```

### Video Component Props

```typescript
<TavusConversation
  conversationUrl={url}              // Required: Daily.co room URL
  onLeave={() => {}}                 // Callback when user leaves
  onError={(err) => {}}              // Callback on error
  userName="User"                    // Display name
  enableCamera={true}                // Start with camera on
  enableMicrophone={true}            // Start with mic on
/>
```

## 📊 Monitoring & Analytics

### Event Tracking

The TavusConversation component emits console logs for:
- ✅ Joined meeting
- 👤 Participant joined/left
- 🔄 Participant updated
- ❌ Errors
- 📷 Camera issues

### Webhooks (Optional)

Configure `callback_url` to receive webhooks about:
- Conversation started
- Conversation ended
- Participant events
- Perception analysis (sentiment, engagement)

Example webhook payload:
```json
{
  "event_type": "conversation.ended",
  "conversation_id": "c123456",
  "duration": 1245,
  "ended_at": "2025-11-12T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Common Issues

**1. "This professional has not set up their AI twin yet"**
- Solution: Ensure `replica_id` is stored in professional profile
- Check that replica was successfully created in Tavus

**2. "Unable to start video conversation"**
- Check API key is correct
- Verify network connectivity
- Check Tavus API status

**3. Camera/Microphone not working**
- Check device permissions (Info.plist for iOS, AndroidManifest.xml for Android)
- Test on physical device (simulators have limited media support)

**4. "Failed to join conversation"**
- Verify conversation_url is valid Daily.co URL
- Check Daily.co service status
- Ensure WebRTC is supported on device

### Debug Mode

Enable detailed logging:
```typescript
// In TavusConversation.tsx
console.log('🎥 Daily call object:', callObject);
console.log('📊 Participants:', participants);
```

## 🔒 Security Best Practices

1. **API Key Protection**
   - Never expose API keys in client code
   - Use backend proxy for Tavus API calls
   - Implement rate limiting

2. **User Authentication**
   - Verify user is authenticated before allowing calls
   - Check user has permission to access professional
   - Validate session tokens

3. **Data Privacy**
   - Inform users about recording/transcription
   - Comply with HIPAA/GDPR if handling health data
   - Implement secure call cleanup

4. **Content Moderation**
   - Monitor conversations for abuse
   - Implement reporting mechanism
   - Set up automated flagging

## 💰 Cost Considerations

Tavus pricing (as of 2025):
- **Replica Creation**: $X per replica
- **Conversation Minutes**: $X per minute
- **Storage**: $X per GB for recordings

Optimize costs by:
- Setting `max_call_duration` limits
- Disabling recording unless required
- Using test_mode for development
- Implementing user billing

## 🔄 Future Enhancements

### Potential Features to Add

1. **Screen Sharing**: Share documents during session
2. **Chat History**: Save conversation transcripts
3. **Session Notes**: AI-generated session summaries
4. **Scheduling**: Book AI twin sessions in advance
5. **Payment Integration**: Charge per session
6. **Session Feedback**: Rate conversation quality
7. **Multi-participant**: Group therapy sessions

### Code Examples

**Screen Sharing:**
```typescript
const enableScreenShare = async () => {
  await callObject.startScreenShare();
};
```

**Session Recording:**
```typescript
const startRecording = async () => {
  await callObject.startRecording({
    layout: {
      preset: 'default'
    }
  });
};
```

## 📚 Additional Resources

- [Tavus Documentation](https://docs.tavus.io/)
- [Daily.co SDK Docs](https://docs.daily.co/)
- [Tavus API Reference](https://docs.tavus.io/api-reference)
- [React Native WebRTC Guide](https://github.com/react-native-webrtc/react-native-webrtc)

## 🆘 Support

For issues with:
- **Tavus API**: support@tavus.io
- **Daily.co SDK**: https://www.daily.co/support
- **This Implementation**: Check our GitHub issues or contact dev team

---

**Last Updated**: November 12, 2025
**Version**: 1.0.0
**Tested On**: React Native 0.81.1, iOS 14+, Android 10+
