# Visualization Error Fix - DigitalOcean Spaces Timeout

## Problem
New users get a timeout error when creating visualizations:
```
HTTPSConnectionPool(host='blr1.digitaloceanspaces.com', port=443): Read timed out. (read timeout=10)
```

**Root Cause**: Backend tries to fetch avatar image from DigitalOcean Spaces but the presigned URL times out after 10 seconds.

## Why Old Users Work but New Users Don't
- **Old users**: Avatars are fully uploaded and accessible in DigitalOcean Spaces
- **New users**: Avatar might be:
  1. Not fully uploaded to DigitalOcean Spaces
  2. Using expired presigned URL
  3. Image processing incomplete
  4. Default avatar not properly configured

---

## Backend Fix (PRIORITY - Required)

### File: `backend/api/visualize.py` (or wherever `/api/visualize` endpoint is)

```python
import requests
from requests.exceptions import Timeout, RequestException
import logging

logger = logging.getLogger(__name__)

@router.post("/api/visualize")
async def create_visualization(
    input_text: str = Form(...),
    user_id: str = Form(...),
    avatar_id: str = Form(...),
    name: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get user's avatar URL from database
        avatar_url = await get_user_avatar_url(user_id, avatar_id)
        
        if not avatar_url:
            logger.warning(f"No avatar URL found for user {user_id}, using default")
            avatar_url = None  # Or use a default avatar URL
        
        # IMPORTANT: Add timeout handling when fetching avatar
        avatar_image = None
        if avatar_url:
            try:
                logger.info(f"Fetching avatar from: {avatar_url}")
                
                # Increase timeout and add retry logic
                avatar_response = requests.get(
                    avatar_url,
                    timeout=30,  # Increase from 10 to 30 seconds
                    stream=True
                )
                
                if avatar_response.status_code == 200:
                    avatar_image = avatar_response.content
                    logger.info(f"Successfully fetched avatar ({len(avatar_image)} bytes)")
                else:
                    logger.warning(
                        f"Failed to fetch avatar: {avatar_response.status_code}, "
                        f"proceeding without avatar"
                    )
                    avatar_image = None
                    
            except Timeout:
                logger.error(
                    f"Timeout fetching avatar from {avatar_url} after 30s, "
                    f"proceeding without avatar"
                )
                avatar_image = None
                
            except RequestException as e:
                logger.error(
                    f"Error fetching avatar from {avatar_url}: {str(e)}, "
                    f"proceeding without avatar"
                )
                avatar_image = None
        
        # Continue with visualization generation
        # Use avatar_image if available, otherwise generate without it
        visualization = await generate_visualization(
            input_text=input_text,
            avatar_image=avatar_image,  # Can be None
            user_id=user_id
        )
        
        return {
            "status": "success",
            "message": "Visualization created successfully",
            "visualization": visualization
        }
        
    except Exception as e:
        logger.error(f"Visualization error for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create visualization: {str(e)}"
        )
```

### Alternative: Use Default Avatar for New Users

```python
async def get_or_create_default_avatar(user_id: str, avatar_id: str):
    """Get user avatar or create a default one if unavailable"""
    
    # Try to get avatar URL
    avatar_url = await get_user_avatar_url(user_id, avatar_id)
    
    if not avatar_url:
        # Use default avatar stored locally
        default_avatar_path = "assets/default_avatar.jpg"
        return open(default_avatar_path, "rb").read()
    
    try:
        # Try to fetch with timeout
        response = requests.get(avatar_url, timeout=30)
        if response.status_code == 200:
            return response.content
    except Exception as e:
        logger.warning(f"Failed to fetch avatar: {e}")
    
    # Fallback to default
    default_avatar_path = "assets/default_avatar.jpg"
    return open(default_avatar_path, "rb").read()
```

---

## Frontend Improvements (Optional but Recommended)

### 1. Better Error Messages in Avatarhome1.tsx

```typescript
const handleVisualize = async () => {
  // ... existing code ...
  
  if (!avatar_id) {
    Alert.alert(
      'Avatar Required',
      'Please create your avatar before generating visualizations.\n\n' +
      'You can upload your photo or use a default avatar.',
      [
        { text: 'Go to Avatar', onPress: () => navigation.navigate('CreateAvatar1') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    setPendingImage(false);
    return;
  }
  
  // ... rest of code ...
}
```

### 2. Add Retry Logic in Frontend

```typescript
// Add to Avatarhome1.tsx
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// Use in handleVisualize
const res = await fetchWithRetry(backendUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
});
```

### 3. Show Warning for New Users

Add to `CreateAvatar1.tsx` after successful upload:

```typescript
const handleContinue = () => {
  if (!avatar.avatarId) {
    Alert.alert(
      'Upload Required',
      'Please upload at least one avatar image before continuing.'
    );
    return;
  }
  
  // Show info that avatar is processing
  Alert.alert(
    'Avatar Uploaded!',
    'Your avatar is being processed. You can start creating visualizations in a few moments.',
    [{ text: 'OK', onPress: () => navigation.navigate('CreateAccount') }]
  );
};
```

---

## Testing Checklist

### Test New User Flow:
1. ✅ Sign up new user
2. ✅ Upload avatar in CreateAvatar1
3. ✅ Wait 30 seconds for processing
4. ✅ Try creating visualization
5. ✅ Should work or show helpful error

### Test Default Avatar Flow:
1. ✅ Sign up new user
2. ✅ Click "Use default avatar"
3. ✅ Try creating visualization
4. ✅ Should use default avatar

### Test Old User Flow:
1. ✅ Login with existing user
2. ✅ Create visualization
3. ✅ Should work normally

---

## Quick Fix (Immediate)

If you need an immediate fix, add this to your backend endpoint:

```python
# In /api/visualize endpoint, change timeout from 10 to 60 seconds
# and add proper error handling

try:
    avatar_response = requests.get(avatar_url, timeout=60)
except requests.Timeout:
    logger.warning("Avatar fetch timeout, using default")
    avatar_image = None  # Continue without avatar
```

---

## Root Cause Analysis

The issue is in the backend's Replicate API call. When it tries to fetch:
```
https://blr1.digitaloceanspaces.com/uyir/tenants/1/users/875a4f53.../be560f34-8ee8-5b67....jpg?X-Amz-...
```

This presigned URL might be:
1. **Expired** - Check X-Amz-Expires parameter (3600 seconds = 1 hour)
2. **Not yet uploaded** - Image upload to Spaces might be async
3. **Access denied** - Check DigitalOcean Spaces permissions

### Verify DigitalOcean Spaces:
```bash
# Check if image exists
curl -I "https://blr1.digitaloceanspaces.com/uyir/tenants/1/users/..."

# Should return 200 OK, not 403 or 404
```

---

## Summary

**Backend changes (REQUIRED):**
1. Increase timeout from 10s to 30s+
2. Add try-catch for avatar fetch
3. Continue without avatar if fetch fails
4. Use default avatar as fallback

**Frontend changes (OPTIONAL):**
1. Better error messages
2. Retry logic
3. Warning for new users

The main fix must be on the **backend** to handle avatar fetch failures gracefully.
