# Professional Listing API Integration Fix

## Problem
The app was showing a 422 error when clicking on therapist cards:
```
INFO: 172.18.0.1:43756 - "GET /professionals/sadhguru_123 HTTP/1.1" 422 Unprocessable Entity
```

**Root Causes:**
1. Hardcoded professional_id `"sadhguru_123"` didn't exist in the database
2. Response format mismatch - backend returns `items` key, not `professionals`

---

## Solution

### 1. Updated `Connections1.tsx` to Fetch Real Professionals

**Changes Made:**

#### Added State Management
```typescript
const [professionals, setProfessionals] = useState<any[]>([]);
const [loadingProfessionals, setLoadingProfessionals] = useState(false);
```

#### Fetch Professionals on Mount
```typescript
useEffect(() => {
  fetchProfessionals();
}, []);

const fetchProfessionals = async () => {
  try {
    setLoadingProfessionals(true);
    
    // Platform-specific URL
    const backendUrl = Platform.OS === 'android' 
      ? 'http://10.0.2.2:8000/professionals'
      : 'http://localhost:8000/professionals';

    const response = await fetch(backendUrl);

    if (response.ok) {
      const data = await response.json();
      
      // Backend returns { items: [], next_cursor, total_count, suggestions }
      const professionalsList = data.items || [];
      console.log(`📊 Found ${professionalsList.length} professionals (Total: ${data.total_count || 0})`);
      setProfessionals(professionalsList);
    } else {
      setProfessionals([]);
    }
  } catch (err) {
    console.error('❌ Error fetching professionals:', err);
    setProfessionals([]);
  } finally {
    setLoadingProfessionals(false);
  }
};
```

#### Dynamic Navigation with Real IDs
```typescript
const handleTherapistPress = (professional_id: string) => {
  console.log('📍 Navigating to professional:', professional_id);
  navigation.navigate('PublicMicrositePTView', { professional_id });
};
```

#### Dynamic UI Rendering
```typescript
<ScrollView style={styles.therapistsContainer}>
  {loadingProfessionals ? (
    <ActivityIndicator size="large" color="#007AFF" />
  ) : professionals.length === 0 ? (
    <Text style={styles.emptyText}>No professionals available at the moment.</Text>
  ) : (
    professionals.map((prof, index) => (
      <TherapistCard
        key={prof.professional_id || index}
        name={prof.display_name || 'Professional'}
        specialization={prof.domain_tags?.[0]?.name || 'General'}
        rating={4.5} // Default until backend provides ratings
        imageSource={
          prof.profile_image_url 
            ? { uri: prof.profile_image_url } 
            : require('../assets/images/therapist1.png')
        }
        onPress={() => handleTherapistPress(prof.professional_id)}
      />
    ))
  )}
</ScrollView>
```

---

## Backend API Response Format

### GET /professionals

**Response Structure:**
```json
{
  "items": [
    {
      "professional_id": "f6c08d57-4cd3-4f33-ab50-cb047f17e703",
      "user_id": "49809e4e-5ba5-4a3d-be02-795d2099cc55",
      "display_name": "Therapist Recommendation Harness",
      "bio": "Automation profile for therapist recommendation testing.",
      "about": null,
      "profile_image_url": null,
      "cover_image_url": null,
      "session_price_per_hour": 50.0,
      "domain_tags": [
        {
          "tag_id": "1d5bc6ca-6a3b-54aa-a0fe-ba2d785440dd",
          "name": "Psychology",
          "slug": "psychology",
          "tag_type": "domain",
          "parent_id": null,
          "is_active": true
        }
      ],
      "sub_specialization_tags": [
        {
          "tag_id": "de2beb3a-6a8d-5af5-89ac-0b64d6cb6850",
          "name": "Anxiety management",
          "slug": "anxiety-management",
          "tag_type": "sub_specialization",
          "parent_id": "1d5bc6ca-6a3b-54aa-a0fe-ba2d785440dd",
          "is_active": true
        }
      ]
    }
  ],
  "next_cursor": "2025-10-23T14:53:14.723932+00:00|8962573f-efbe-43ed-aecc-4399d0e0d461",
  "total_count": 35,
  "suggestions": null
}
```

**Key Fields:**
- `items`: Array of professional objects
- `next_cursor`: For pagination (if needed)
- `total_count`: Total number of professionals in database
- `suggestions`: Additional suggestions (currently null)

---

## What Was Fixed

### Before ❌
- Hardcoded professional_id: `"sadhguru_123"`
- Static mock data displayed
- 422 errors when clicking cards
- No actual data from backend

### After ✅
- Dynamic professional fetching from backend
- Real professional IDs used for navigation
- Proper error handling with loading states
- Empty state for when no professionals exist
- Displays actual professional data (name, bio, tags, images)
- Platform-specific API URLs (Android vs iOS)

---

## Testing Checklist

- [x] Backend endpoint `/professionals` returns data
- [x] Response format uses `items` key (not `professionals`)
- [x] Frontend correctly parses `data.items` array
- [ ] App displays list of professionals in Connections1 screen
- [ ] Clicking professional card navigates to PublicMicrositePTView
- [ ] PublicMicrositePTView loads without 422 errors
- [ ] Professional data displays correctly (name, bio, about)
- [ ] Images load if URLs are provided
- [ ] Fallback images work if URLs are null
- [ ] Empty state shows when no professionals exist
- [ ] Loading spinner appears during fetch

---

## Additional Notes

### Platform-Specific URLs
```typescript
// Android emulator
const androidUrl = 'http://10.0.2.2:8000/professionals';

// iOS simulator
const iosUrl = 'http://localhost:8000/professionals';
```

### Current Backend Data
- **Total Professionals:** 35
- **Sample Specializations:** Psychology, Career guidance, Financial planning
- **Sample Sub-specializations:** Anxiety management, Career roadmap, Investment basics

### Future Enhancements
1. Add pagination support using `next_cursor`
2. Implement filtering by domain tags
3. Add search functionality
4. Display professional ratings (once backend provides)
5. Add refresh-to-reload functionality
6. Cache professional data for offline viewing

---

## Related Files
- `src/screens/Connections1.tsx` - Professional listing screen
- `src/screens/PublicMicrositePTView.tsx` - Professional profile view
- `src/components/TherapistCard.tsx` - Reusable professional card component
- `src/navigation/types.ts` - Navigation type definitions

## Related Documentation
- `PUBLIC_MICROSITE_API_INTEGRATION.md` - API documentation
- `LIVEKIT_VIDEO_CALL_FLOW.md` - Video call implementation
- `SESSION_FLOW_SUMMARY.md` - Complete session booking flow
