# LiveKit Video Call Integration Flow

## 📋 Overview
This document outlines the complete flow for integrating LiveKit video calling between professional users and normal users for one-to-one therapy sessions.

---

## 🔄 Complete User Journey

### **Professional User Flow**

1. **SessionSettings.tsx** - Set Availability
   - Professional creates availability slots with:
     - Date selection (calendar)
     - Start time (HH:mm format)
     - End time (HH:mm format)
     - Price per hour ($1-$250)
   - **Endpoint**: `POST /professional/sessions/availability`
   - **Request Body**:
     ```json
     {
       "start_time": "2025-10-26T09:00:00",
       "end_time": "2025-10-26T10:00:00",
       "price_per_hour": 50
     }
     ```
   - **Response**: 
     ```json
     {
       "slot_id": "uuid",
       "start_time": "2025-10-26T09:00:00",
       "end_time": "2025-10-26T10:00:00",
       "price_per_hour": 50,
       "is_booked": false
     }
     ```

2. **UpComingSessions.tsx** - View & Start Sessions
   - Fetches all booked sessions
   - **Endpoint**: `GET /professional/sessions?limit=20&cursor=optional`
   - **Response**:
     ```json
     {
       "items": [
         {
           "session_id": "uuid",
           "professional_id": "uuid",
           "user_id": "uuid",
           "start_time": "2025-10-26T09:00:00",
           "end_time": "2025-10-26T10:00:00",
           "call_status": "scheduled",
           "cost": 50
         }
       ],
       "next_cursor": "cursor_string_or_null"
     }
     ```
   - Professional clicks "Start" button
   - **Endpoint**: `POST /sessions/{session_id}/generate-call-link`
   - **Response**:
     ```json
     {
       "session_id": "uuid",
       "room_name": "session_uuid",
       "room_sid": "RM_xxxxx",
       "call_url": "https://livekit.example.com/room_name",
       "livekit_url": "wss://livekit.example.com",
       "participant_identity": "prof_user_id",
       "participant_role": "professional",
       "access_token": "jwt_token",
       "token_ttl_seconds": 3600
     }
     ```
   - Navigate to `BookedSession` with LiveKit credentials

3. **BookedSession.tsx** - Video Call Interface
   - Connect to LiveKit room using credentials
   - Show professional's video (main view)
   - Show user's video (small overlay)
   - Controls: mute, video toggle, end call

---

### **Normal User Flow**

1. **PublicMicrositePTView.tsx** - Browse & Book Sessions
   - User views professional's microsite
   - **Current State**: Shows hardcoded slots (needs backend integration)
   - **Required Integration**:
     - Fetch available slots from professional
     - **Endpoint**: `GET /professionals/{professional_id}/sessions/available?date=2025-10-26`
     - **Response**:
       ```json
       {
         "slots": [
           {
             "slot_id": "uuid",
             "start_time": "2025-10-26T09:00:00",
             "end_time": "2025-10-26T10:00:00",
             "price_per_hour": 50,
             "is_booked": false
           }
         ]
       }
       ```
   - User selects slot and books
   - **Endpoint**: `POST /professionals/{professional_id}/sessions`
   - **Request Body**:
     ```json
     {
       "availability_slot_id": "uuid",
       "booking_notes": "optional_notes"
     }
     ```
   - **Response**:
     ```json
     {
       "session_id": "uuid",
       "professional_id": "uuid",
       "user_id": "uuid",
       "start_time": "2025-10-26T09:00:00",
       "end_time": "2025-10-26T10:00:00",
       "cost": 50,
       "payment_status": "pending",
       "status": "scheduled"
     }
     ```

2. **UpComingUserSessions.tsx** - View & Start Sessions
   - Fetches user's booked sessions
   - **Endpoint**: `GET /sessions/my-bookings`
   - **Response**: Array of session bookings
   - User clicks "Start" button
   - **Endpoint**: `POST /sessions/{session_id}/generate-call-link`
   - Same response as professional side
   - Navigate to `BookedSession` with LiveKit credentials

3. **BookedSession.tsx** - Video Call Interface
   - Connect to LiveKit room using credentials
   - **Same room as professional** (room_name is identical)
   - Show user's video (main view)
   - Show professional's video (small overlay)
   - Controls: mute, video toggle, end call

---

## 🛠️ LiveKit Integration Requirements

### **1. Install Dependencies**

```bash
npm install @livekit/react-native @livekit/react-native-webrtc
```

Or with yarn:
```bash
yarn add @livekit/react-native @livekit/react-native-webrtc
```

### **2. iOS Setup** (ios/Podfile)

```ruby
# Add permissions
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"

# After target do
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_BITCODE'] = 'NO'
    end
  end
end
```

Run:
```bash
cd ios && pod install
```

### **3. Android Setup** (android/app/src/main/AndroidManifest.xml)

```xml
<manifest>
  <!-- Add permissions -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  
  <!-- Optional: Bluetooth for audio devices -->
  <uses-permission android:name="android.permission.BLUETOOTH" />
  <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
</manifest>
```

### **4. Info.plist (iOS)** - Add permissions

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is required for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is required for video calls</string>
```

---

## 💻 BookedSession.tsx Implementation

### **Current State**
- Shows mockup UI only
- No actual video connection
- Simulated loading state

### **Required Changes**

#### **1. Import LiveKit SDK**

```typescript
import { 
  Room, 
  Track,
  RoomEvent,
  VideoTrack,
  AudioTrack,
  LocalParticipant,
  RemoteParticipant,
  createLocalTracks
} from '@livekit/react-native';
import { RTCView } from '@livekit/react-native-webrtc';
```

#### **2. Add Route Params Interface**

```typescript
type BookedSessionRouteProp = RouteProp<RootStackParamList, 'BookedSession'>;

interface BookedSessionParams {
  sessionId: string;
  callUrl: string;
  accessToken: string;
  roomName: string;
  participantIdentity: string;
  participantRole: string;
  livekitUrl: string;
}
```

#### **3. State Management**

```typescript
const route = useRoute<BookedSessionRouteProp>();
const { livekitUrl, accessToken, roomName, participantIdentity } = route.params;

const [room, setRoom] = useState<Room | null>(null);
const [isConnected, setIsConnected] = useState(false);
const [localVideoTrack, setLocalVideoTrack] = useState<VideoTrack | null>(null);
const [localAudioTrack, setLocalAudioTrack] = useState<AudioTrack | null>(null);
const [remoteVideoTrack, setRemoteVideoTrack] = useState<VideoTrack | null>(null);
const [remoteAudioTrack, setRemoteAudioTrack] = useState<AudioTrack | null>(null);
const [isMuted, setIsMuted] = useState(false);
const [isVideoOn, setIsVideoOn] = useState(true);
```

#### **4. Connect to LiveKit Room**

```typescript
useEffect(() => {
  connectToRoom();
  
  return () => {
    disconnectFromRoom();
  };
}, []);

const connectToRoom = async () => {
  try {
    // Create local tracks
    const tracks = await createLocalTracks({
      audio: true,
      video: true,
    });

    const videoTrack = tracks.find(t => t.kind === Track.Kind.Video) as VideoTrack;
    const audioTrack = tracks.find(t => t.kind === Track.Kind.Audio) as AudioTrack;

    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack);

    // Create room instance
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    // Set up event listeners
    newRoom.on(RoomEvent.Connected, () => {
      console.log('✅ Connected to room');
      setIsConnected(true);
      setIsConnecting(false);
    });

    newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log('📹 Track subscribed:', track.kind);
      if (track.kind === Track.Kind.Video) {
        setRemoteVideoTrack(track as VideoTrack);
      } else if (track.kind === Track.Kind.Audio) {
        setRemoteAudioTrack(track as AudioTrack);
      }
    });

    newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      console.log('📹 Track unsubscribed:', track.kind);
      if (track.kind === Track.Kind.Video) {
        setRemoteVideoTrack(null);
      } else if (track.kind === Track.Kind.Audio) {
        setRemoteAudioTrack(null);
      }
    });

    newRoom.on(RoomEvent.Disconnected, () => {
      console.log('❌ Disconnected from room');
      setIsConnected(false);
    });

    // Connect to room
    await newRoom.connect(livekitUrl, accessToken);
    setRoom(newRoom);

    // Publish local tracks
    await newRoom.localParticipant.publishTrack(videoTrack);
    await newRoom.localParticipant.publishTrack(audioTrack);

  } catch (error) {
    console.error('❌ Error connecting to room:', error);
    Alert.alert('Connection Error', 'Failed to connect to video call');
    setIsConnecting(false);
  }
};

const disconnectFromRoom = async () => {
  if (room) {
    await room.disconnect();
    setRoom(null);
  }
  
  // Clean up local tracks
  localVideoTrack?.stop();
  localAudioTrack?.stop();
  setLocalVideoTrack(null);
  setLocalAudioTrack(null);
};
```

#### **5. Control Functions**

```typescript
const toggleMute = async () => {
  if (localAudioTrack) {
    if (isMuted) {
      await localAudioTrack.unmute();
    } else {
      await localAudioTrack.mute();
    }
    setIsMuted(!isMuted);
  }
};

const toggleVideo = async () => {
  if (localVideoTrack) {
    if (isVideoOn) {
      await localVideoTrack.mute();
    } else {
      await localVideoTrack.unmute();
    }
    setIsVideoOn(!isVideoOn);
  }
};

const handleEndCall = async () => {
  await disconnectFromRoom();
  navigation.goBack();
};
```

#### **6. Video Rendering**

```typescript
// Replace Image components with actual video tracks

{/* Main Video - Remote Participant */}
<View style={styles.mainVideoContainer}>
  {remoteVideoTrack ? (
    <RTCView
      style={styles.mainVideo}
      streamURL={(remoteVideoTrack as any).mediaStreamTrack?.id}
      objectFit="cover"
    />
  ) : (
    <View style={styles.placeholderVideo}>
      <Text style={styles.placeholderText}>Waiting for participant...</Text>
    </View>
  )}
</View>

{/* Small Video - Local Participant */}
<View style={styles.avatarVideoContainer}>
  {localVideoTrack && isVideoOn ? (
    <RTCView
      style={styles.avatarVideo}
      streamURL={(localVideoTrack as any).mediaStreamTrack?.id}
      objectFit="cover"
      mirror={true}
    />
  ) : (
    <View style={styles.placeholderVideo}>
      <Text style={styles.placeholderText}>Video Off</Text>
    </View>
  )}
</View>
```

---

## 🔄 Navigation Flow Updates

### **UpComingSessions.tsx** (Professional)

```typescript
const handleStartSession = async (sessionId: string) => {
  // ... existing fetch logic ...
  
  if (response.ok) {
    const data: GenerateCallLinkResponse = await response.json();
    
    // Navigate with LiveKit credentials
    navigation.navigate('BookedSession', {
      sessionId: data.session_id,
      callUrl: data.call_url,
      accessToken: data.access_token,
      roomName: data.room_name,
      participantIdentity: data.participant_identity,
      participantRole: data.participant_role,
      livekitUrl: data.livekit_url,
    });
  }
};
```

### **UpComingUserSessions.tsx** (User)

```typescript
const handleStartSession = async (session_id: string) => {
  // ... existing fetch logic ...
  
  if (response.ok) {
    const data = await response.json();
    
    // Navigate with LiveKit credentials
    navigation.navigate('BookedSession', {
      sessionId: data.session_id,
      callUrl: data.call_url,
      accessToken: data.access_token,
      roomName: data.room_name,
      participantIdentity: data.participant_identity,
      participantRole: data.participant_role,
      livekitUrl: data.livekit_url,
    });
  }
};
```

---

## 📱 PublicMicrositePTView.tsx Updates Needed

### **Current State**
- Hardcoded time slots: `['6:00 PM', '7:00 PM', '8:00 PM', ...]`
- No backend integration for availability
- No booking API call

### **Required Integration**

```typescript
interface AvailabilitySlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  price_per_hour: number;
  is_booked: boolean;
}

const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

// Fetch slots when date is selected
const fetchAvailableSlots = async (date: string) => {
  const backendUrl = Platform.OS === 'android'
    ? `http://10.0.2.2:8000/professionals/${professional_id}/sessions/available?date=${date}`
    : `http://localhost:8000/professionals/${professional_id}/sessions/available?date=${date}`;
  
  const response = await fetch(backendUrl);
  if (response.ok) {
    const data = await response.json();
    setAvailableSlots(data.slots.filter(s => !s.is_booked));
  }
};

// Book session
const handleBookSession = async () => {
  if (!selectedSlot || !token) return;
  
  const backendUrl = Platform.OS === 'android'
    ? `http://10.0.2.2:8000/professionals/${professional_id}/sessions`
    : `http://localhost:8000/professionals/${professional_id}/sessions`;
  
  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      availability_slot_id: selectedSlot.slot_id,
      booking_notes: '',
    }),
  });
  
  if (response.ok) {
    Alert.alert('Success', 'Session booked successfully!');
    navigation.navigate('UpComingUserSessions');
  }
};
```

---

## ✅ Implementation Checklist

### **Phase 1: Dependencies & Permissions**
- [ ] Install `@livekit/react-native`
- [ ] Install `@livekit/react-native-webrtc`
- [ ] Configure iOS Podfile
- [ ] Configure Android permissions
- [ ] Add Info.plist permissions
- [ ] Test camera/mic permissions on both platforms

### **Phase 2: BookedSession.tsx**
- [ ] Import LiveKit SDK
- [ ] Add route params interface
- [ ] Implement state management
- [ ] Implement `connectToRoom()` function
- [ ] Implement `disconnectFromRoom()` function
- [ ] Implement control functions (mute, video, end)
- [ ] Replace Image components with RTCView
- [ ] Add error handling
- [ ] Test connection with mock data

### **Phase 3: Navigation Updates**
- [ ] Update UpComingSessions.tsx navigation
- [ ] Update UpComingUserSessions.tsx navigation
- [ ] Update RootStackParamList type definitions
- [ ] Test navigation flow

### **Phase 4: PublicMicrositePTView.tsx**
- [ ] Add availability fetching endpoint integration
- [ ] Replace hardcoded slots with API data
- [ ] Implement session booking endpoint
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test booking flow

### **Phase 5: Testing**
- [ ] Test professional creates availability
- [ ] Test user can see availability
- [ ] Test user can book session
- [ ] Test professional sees booked session
- [ ] Test user sees booked session
- [ ] Test both can start session
- [ ] Test LiveKit connection
- [ ] Test video/audio controls
- [ ] Test call quality
- [ ] Test edge cases (network issues, permissions denied)

---

## 🐛 Common Issues & Solutions

### **Issue: Cannot connect to LiveKit**
- Check `livekitUrl` format (should be `wss://...`)
- Verify `accessToken` is valid JWT
- Check network permissions in AndroidManifest.xml

### **Issue: Video not showing**
- Verify camera permissions granted
- Check `RTCView` streamURL is correct
- Ensure track is published to room

### **Issue: Audio not working**
- Verify microphone permissions granted
- Check `localAudioTrack.mute()` status
- Ensure audio track is published

### **Issue: Both participants not connecting**
- Verify both use same `room_name`
- Check both have valid access tokens
- Ensure backend generates unique tokens per participant

---

## 📚 Additional Resources

- [LiveKit React Native Docs](https://docs.livekit.io/client-sdk-react-native/)
- [LiveKit Cloud Setup](https://livekit.io/)
- [WebRTC Permissions Guide](https://developer.android.com/guide/topics/permissions/overview)
- [iOS Camera/Mic Permissions](https://developer.apple.com/documentation/avfoundation/cameras_and_media_capture)

---

## 🎯 Success Criteria

✅ Professional can create availability slots
✅ User can view professional's available slots
✅ User can book sessions
✅ Both see booked sessions in their respective screens
✅ Both can click "Start" and connect to same room
✅ Video and audio work bidirectionally
✅ Controls (mute, video toggle) work correctly
✅ Call can be ended gracefully
✅ No memory leaks or crashes

---

**Last Updated**: October 26, 2025
**Status**: Ready for Implementation
