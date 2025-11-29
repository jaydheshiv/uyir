/**
 * LiveKit Configuration
 * 
 * Backend Response Details:
 * - LiveKit URL: wss://uyir-dm431fc1.livekit.cloud
 * - Works for Android emulator, iOS simulator, and physical devices
 * - API Key: API9skRsqUyrFGy
 * - Token TTL: 3600 seconds (1 hour)
 */


export const LIVEKIT_CONFIG = {
    /**
     * LiveKit Cloud WebSocket URL
     * This URL works for all platforms (Android, iOS, web)
     */
    LIVEKIT_URL: 'wss://uyir-dm431fc1.livekit.cloud',

    /**
     * Backend API base URL for generating call links
     * Using HTTP with port 8081 until HTTPS is configured
     */
    API_BASE_URL: 'http://dev.api.uyir.ai:8081',

    /**
     * Token time-to-live (1 hour)
     */
    TOKEN_TTL_SECONDS: 3600,

    /**
     * Connection timeout (30 seconds)
     */
    CONNECTION_TIMEOUT_MS: 30000,

    /**
     * Reconnection settings
     */
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY_MS: 2000,
};

/**
 * Participant roles
 */
export enum ParticipantRole {
    PROFESSIONAL = 'professional',
    SUBSCRIBER = 'subscriber',
}

/**
 * Room options for LiveKit connection
 */
export const ROOM_OPTIONS = {
    adaptiveStream: true,
    dynacast: true,
    audio: true,
    video: true,
};

/**
 * Validate LiveKit URL
 */
export const validateLivekitUrl = (url: string): boolean => {
    return url.startsWith('wss://') || url.startsWith('ws://');
};

/**
 * Get backend endpoint for generating call link
 */
export const getGenerateCallLinkEndpoint = (sessionId: string): string => {
    return `${LIVEKIT_CONFIG.API_BASE_URL}/sessions/${sessionId}/generate-call-link`;
};

/**
 * Get backend endpoint for call details
 */
export const getCallDetailsEndpoint = (sessionId: string): string => {
    return `${LIVEKIT_CONFIG.API_BASE_URL}/sessions/${sessionId}/call-details`;
};

/**
 * Format participant identity
 */
export const formatParticipantIdentity = (
    role: ParticipantRole,
    userId: string
): string => {
    return `${role}:${userId}`;
};

/**
 * Parse participant identity
 */
export const parseParticipantIdentity = (
    identity: string
): { role: ParticipantRole; userId: string } | null => {
    const parts = identity.split(':');
    if (parts.length !== 2) return null;

    const [role, userId] = parts;
    if (role !== ParticipantRole.PROFESSIONAL && role !== ParticipantRole.SUBSCRIBER) {
        return null;
    }

    return { role: role as ParticipantRole, userId };
};

export default LIVEKIT_CONFIG;
