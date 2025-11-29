/**
 * Tavus API Service
 * Handles API calls to Tavus for creating and managing conversational video interfaces
 */

const TAVUS_API_BASE_URL = 'https://tavusapi.com/v2';
const TAVUS_DEV_API_BASE_URL = 'https://platform.tavus.io/dev';

// ⚠️ IMPORTANT: Get your Tavus API key from https://platform.tavus.io
// For testing: Use your Tavus API key here
// For production: Store securely in backend and proxy requests through your server
const TAVUS_API_KEY = 'b821b95e5c4340af9bc34fae4e4b14c4'; // Demo key - replace with your actual key

export interface UploadableMedia {
    uri: string;
    name: string;
    type?: string;
}

export interface CreateConversationRequest {
    replica_id: string; // The unique identifier for the replica
    persona_id?: string; // Optional: persona ID for behavior customization
    conversation_name?: string;
    conversational_context?: string; // Context about the conversation
    custom_greeting?: string;
    callback_url?: string; // Webhook URL for conversation updates
    audio_only?: boolean;
    properties?: {
        max_call_duration?: number; // in seconds
        participant_left_timeout?: number; // in seconds
        enable_recording?: boolean;
        enable_transcription?: boolean;
        language?: string; // Language for the conversation (e.g., "english")
    };
}

export interface ConversationResponse {
    conversation_id: string;
    conversation_name: string;
    status: 'active' | 'ended';
    conversation_url: string; // This is the Daily.co room URL
    replica_id: string;
    persona_id?: string;
    created_at: string;
}

export interface GetConversationResponse {
    conversation_id: string;
    conversation_name: string;
    status: 'active' | 'ended';
    conversation_url: string;
    replica_id: string;
    persona_id?: string;
    created_at: string;
    ended_at?: string;
    duration?: number;
}

/**
 * Creates a new Tavus conversation
 * @param request - Configuration for the conversation
 * @returns Promise with conversation details including the conversation_url
 */
export async function createTavusConversation(
    request: CreateConversationRequest,
): Promise<ConversationResponse> {
    try {
        // Validate API key is set
        if (!TAVUS_API_KEY) {
            throw new Error(
                'Tavus API key not configured. Please add your API key in src/services/tavusService.ts'
            );
        }

        console.log('🎥 Creating Tavus conversation with replica:', request.replica_id);

        const response = await fetch(`${TAVUS_API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TAVUS_API_KEY,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.detail || errorData.message || response.statusText;

            if (response.status === 401) {
                throw new Error(
                    'Invalid Tavus API key. Please check your API key at https://platform.tavus.io'
                );
            }

            throw new Error(
                `Tavus API error: ${response.status} - ${errorMsg}`,
            );
        }

        const data: ConversationResponse = await response.json();
        console.log('✅ Tavus conversation created:', data.conversation_id);
        console.log('🔗 Conversation URL:', data.conversation_url);
        return data;
    } catch (error) {
        console.error('❌ Failed to create Tavus conversation:', error);
        throw error;
    }
}

/**
 * Gets details of an existing conversation
 * @param conversationId - The conversation ID to fetch
 * @returns Promise with conversation details
 */
export async function getTavusConversation(
    conversationId: string,
): Promise<GetConversationResponse> {
    try {
        const response = await fetch(
            `${TAVUS_API_BASE_URL}/conversations/${conversationId}`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': TAVUS_API_KEY,
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Tavus API error: ${response.status} - ${errorData.detail || response.statusText}`,
            );
        }

        const data: GetConversationResponse = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Failed to get Tavus conversation:', error);
        throw error;
    }
}

/**
 * Ends an active conversation
 * @param conversationId - The conversation ID to end
 * @returns Promise<void>
 */
export async function endTavusConversation(
    conversationId: string,
): Promise<void> {
    try {
        const response = await fetch(
            `${TAVUS_API_BASE_URL}/conversations/${conversationId}`,
            {
                method: 'DELETE',
                headers: {
                    'x-api-key': TAVUS_API_KEY,
                },
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Tavus API error: ${response.status} - ${errorData.detail || response.statusText}`,
            );
        }

        console.log('✅ Tavus conversation ended:', conversationId);
    } catch (error) {
        console.error('❌ Failed to end Tavus conversation:', error);
        throw error;
    }
}

/**
 * Helper function to create a conversation for a professional's replica
 * @param professionalId - The professional's ID
 * @param replicaId - The Tavus replica ID for this professional
 * @param conversationContext - Optional context about what to discuss
 * @returns Promise with conversation details
 */
export async function createProfessionalConversation(
    professionalId: string,
    replicaId: string,
    conversationContext?: string,
): Promise<ConversationResponse> {
    const request: CreateConversationRequest = {
        replica_id: replicaId,
        persona_id: 'p48fdf065d6b', // Your persona ID
        conversation_name: `Session with Professional ${professionalId}`,
        conversational_context:
            conversationContext ||
            'You are a mental health professional having a supportive conversation with a client.',
        custom_greeting:
            "Hello! I'm here to listen and support you. What's on your mind today?",
        properties: {
            max_call_duration: 3600, // 1 hour
            participant_left_timeout: 0, // Set to 0 to prevent auto-disconnect
            enable_recording: false, // Set to true if you want to record sessions
            enable_transcription: false, // Set to true if you want transcriptions
            language: 'english', // Set conversation language
        },
    };

    return createTavusConversation(request);
}

// ============ VIDEO GENERATION API ============

export interface CreateReplicaWithUploadsParams {
    trainingVideo: UploadableMedia;
    consentVideo?: UploadableMedia | null;
    replicaName: string;
    consentScript: string;
    trainingScript: string;
    description?: string;
}

export interface CreateReplicaWithUploadsResponse {
    replica_id?: string;
    status?: string;
    replica_url?: string;
    created_at?: string;
    estimated_completion?: string;
    message?: string;
    detail?: string;
    [key: string]: any;
}

const toFormDataFile = (media: UploadableMedia) => ({
    uri: media.uri,
    type: media.type || 'video/mp4',
    name: media.name || 'video.mp4',
} as any);

/**
 * Creates a Tavus replica by uploading consent & training videos directly to the Tavus dev endpoint.
 */
export async function createReplicaWithUploads(
    params: CreateReplicaWithUploadsParams,
): Promise<CreateReplicaWithUploadsResponse> {
    const {
        trainingVideo,
        consentVideo,
        replicaName,
        consentScript,
        trainingScript,
        description,
    } = params;

    if (!TAVUS_API_KEY) {
        throw new Error('Tavus API key not configured');
    }

    if (!trainingVideo?.uri) {
        throw new Error('Training video is required to create a replica');
    }

    const endpoint = `${TAVUS_DEV_API_BASE_URL}/replicas/create`;
    const formData = new FormData();

    formData.append('replica_name', replicaName);
    formData.append('training_script', trainingScript);
    formData.append('training_video', toFormDataFile(trainingVideo));

    if (consentVideo?.uri) {
        formData.append('consent_video', toFormDataFile(consentVideo));
    }

    if (consentScript) {
        formData.append('consent_script', consentScript);
    }

    if (description) {
        formData.append('description', description);
    }

    console.log('🎞️ Uploading replica videos to Tavus dev endpoint');
    console.log('• Endpoint:', endpoint);
    console.log('• Replica name:', replicaName);
    console.log('• Includes consent video:', Boolean(consentVideo?.uri));

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'x-api-key': TAVUS_API_KEY,
        },
        body: formData,
    });

    let payload: CreateReplicaWithUploadsResponse | null = null;
    try {
        payload = (await response.json()) as CreateReplicaWithUploadsResponse;
    } catch (err) {
        console.warn('⚠️ Unable to parse Tavus replica response as JSON');
    }

    if (!response.ok) {
        const errorMsg = payload?.detail || payload?.message || response.statusText;
        throw new Error(`Tavus replica creation failed (${response.status}): ${errorMsg}`);
    }

    console.log('✅ Tavus replica creation request accepted:', payload?.replica_id || 'pending');
    return payload ?? {};
}

export interface CreateVideoRequest {
    replica_id: string;
    script: string;
    video_name?: string;
    background_url?: string;
    background_source_url?: string;
}

export interface VideoResponse {
    video_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    video_url?: string;
    download_url?: string;
    stream_url?: string;
    hosted_url?: string;
    created_at: string;
}

/**
 * Creates a new Tavus video from script
 * @param request - Video generation configuration
 * @returns Promise with video details including video_id for status checking
 */
export async function createTavusVideo(
    request: CreateVideoRequest,
): Promise<VideoResponse> {
    try {
        if (!TAVUS_API_KEY) {
            throw new Error('Tavus API key not configured');
        }

        console.log('🎬 Creating Tavus video with replica:', request.replica_id);
        console.log('📝 Script:', request.script.substring(0, 100) + '...');

        const response = await fetch(`${TAVUS_API_BASE_URL}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TAVUS_API_KEY,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.detail || errorData.message || response.statusText;
            throw new Error(`Tavus API error: ${response.status} - ${errorMsg}`);
        }

        const data: VideoResponse = await response.json();
        console.log('✅ Tavus video created:', data.video_id);
        return data;
    } catch (error) {
        console.error('❌ Failed to create Tavus video:', error);
        throw error;
    }
}

/**
 * Gets the status and details of a video
 * @param videoId - The video ID to check
 * @returns Promise with video status and URLs
 */
export async function getTavusVideo(videoId: string): Promise<VideoResponse> {
    try {
        const response = await fetch(`${TAVUS_API_BASE_URL}/videos/${videoId}`, {
            method: 'GET',
            headers: {
                'x-api-key': TAVUS_API_KEY,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Tavus API error: ${response.status} - ${errorData.detail || response.statusText}`,
            );
        }

        const data: VideoResponse = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Failed to get Tavus video:', error);
        throw error;
    }
}

/**
 * Helper function to generate a video response for a user message
 * @param replicaId - The Tavus replica ID
 * @param userMessage - The user's message/question
 * @returns Promise with video details
 */
export async function generateVideoResponse(
    replicaId: string,
    userMessage: string,
): Promise<VideoResponse> {
    const request: CreateVideoRequest = {
        replica_id: replicaId,
        script: userMessage,
        video_name: `Response to: ${userMessage.substring(0, 50)}`,
    };

    return createTavusVideo(request);
}
