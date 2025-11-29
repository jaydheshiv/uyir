/**
 * ImageKit.io Configuration
 * 
 * Get your urlEndpoint from: https://imagekit.io/dashboard/url-endpoints
 * 
 * NOTE: Only urlEndpoint is needed for read-only image transformations.
 * publicKey and authenticationEndpoint are only required for client-side uploads
 * (which we're not doing - images are uploaded to DigitalOcean from backend).
 */

export const imagekitConfig = {
    // ✅ Your ImageKit URL endpoint
    urlEndpoint: 'https://ik.imagekit.io/uyir/',

    // Optional: Only needed for client-side uploads (not used currently)
    // If you want to enable client-side uploads in the future, uncomment and add your public key:
    // publicKey: 'your_public_key_here',
    // authenticationEndpoint: 'http://dev.api.uyir.ai:8081/imagekit/auth',
};
