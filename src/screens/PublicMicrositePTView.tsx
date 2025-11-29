import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer, {
	AudioEncoderAndroidType,
	AudioSet,
	AudioSourceAndroidType,
	AVEncoderAudioQualityIOSType,
	AVEncodingOption,
	AVModeIOSOption,
	OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-blob-util';
import { Calendar } from 'react-native-calendars';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';
import { buildKnowledgeUrl, buildUrl } from '../config/api';
import { applyPreset } from '../lib/imagekit';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth, useAvatar } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeContext';
import { KnowledgeVisibility, NormalizedKnowledgeEntry, normalizeKnowledgeEntry, resolveKnowledgeId, resolveKnowledgeVisibility } from '../utils/knowledgeNormalization';

const { width: screenWidth } = Dimensions.get('window');


interface Professional {
	professional_id: string;
	user_id: string;
	display_name: string;
	bio?: string;
	about?: string;
	session_price_per_hour?: number;
	replica_id?: string; // Tavus replica ID for AI twin conversations
	subscriber_count?: number;
}

interface AvailabilitySlot {
	slot_id: string;
	start_time: string;
	end_time: string;
	price_per_hour: number;
	is_booked: boolean;
	is_available?: boolean;
	created_by_professional?: boolean;
	status?: string;
}

type KnowledgeBaseFile = NormalizedKnowledgeEntry;

type KnowledgeVisibilityHints = Record<string, KnowledgeVisibility | undefined>;

interface VideoPlaybackSources {
	stream: string | null;
	download: string | null;
	hosted: string | null;
}

interface CandidateRequest {
	url: string;
	includeAuth: boolean;
	reason: string;
}

type SubscriptionPlanId = 'weekly' | 'monthly' | 'annual';

const SUBSCRIPTION_PLAN_AMOUNTS: Record<SubscriptionPlanId, number> = {
	weekly: 10.8,
	monthly: 25,
	annual: 200,
};

const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlanId, string> = {
	weekly: 'Weekly',
	monthly: 'Monthly',
	annual: 'Annual',
};

const resolvePlanId = (value: unknown): SubscriptionPlanId | null => {
	if (!value) {
		return null;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (!normalized) {
			return null;
		}
		if (normalized in SUBSCRIPTION_PLAN_LABELS) {
			return normalized as SubscriptionPlanId;
		}
		if (normalized.startsWith('week')) {
			return 'weekly';
		}
		if (normalized.startsWith('month')) {
			return 'monthly';
		}
		if (normalized.startsWith('annual') || normalized.startsWith('year')) {
			return 'annual';
		}
	}
	return null;
};

const toTrimmedString = (value: unknown): string | undefined => {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}
	if (typeof value === 'number' && Number.isFinite(value)) {
		return String(value);
	}
	return undefined;
};

const getValueAtPath = (source: any, path: string[]): any => {
	return path.reduce((accumulator, key) => {
		if (accumulator && typeof accumulator === 'object' && key in accumulator) {
			return (accumulator as any)[key];
		}
		return undefined;
	}, source);
};

const normalizeSpacesUrl = (value?: string | null): string | null => {
	const urlCandidate = toTrimmedString(value);
	if (!urlCandidate) {
		return null;
	}
	try {
		const url = new URL(urlCandidate);
		const host = url.hostname;
		const isPathStyle = host.endsWith('digitaloceanspaces.com') && !host.startsWith('uyir.');
		if (isPathStyle && url.pathname.startsWith('/uyir/')) {
			const region = host.split('.')[0];
			const rest = url.pathname.replace('/uyir/', '');
			return `https://uyir.${region}.digitaloceanspaces.com/${rest}`;
		}
		return urlCandidate;
	} catch {
		return urlCandidate;
	}
};

const deriveKnowledgeScanFromProfile = (
	profile: any,
): { ids: string[]; visibilityById: KnowledgeVisibilityHints } => {
	if (!profile || typeof profile !== 'object') {
		return { ids: [], visibilityById: {} };
	}

	const collectedIds = new Set<string>();
	const visibilityById: KnowledgeVisibilityHints = {};

	const recordId = (value: unknown, visibility?: KnowledgeVisibility) => {
		const normalized = toTrimmedString(value);
		if (!normalized) {
			return;
		}
		collectedIds.add(normalized);
		if (visibility) {
			visibilityById[normalized] = visibility;
		}
	};

	const resolveVisibilityFromEntry = (entry: any): KnowledgeVisibility | undefined => {
		if (!entry || typeof entry !== 'object') {
			return undefined;
		}

		const visibilityFields = [
			entry?.visibility,
			entry?.visibility_mode,
			entry?.visibilityMode,
			entry?.visibility_status,
			entry?.visibilityStatus,
			entry?.access_level,
			entry?.accessLevel,
			entry?.access_type,
			entry?.accessType,
			entry?.metadata?.visibility,
			entry?.metadata?.visibility_mode,
			entry?.metadata?.access_level,
			entry?.metadata?.access_type,
		];

		const hasExplicitVisibility = visibilityFields.some(candidate => toTrimmedString(candidate));

		if (
			hasExplicitVisibility ||
			entry?.is_private === true ||
			entry?.is_subscriber_only === true ||
			entry?.subscriber_only === true ||
			entry?.is_public === true
		) {
			return resolveKnowledgeVisibility(entry);
		}

		return undefined;
	};

	const recordEntry = (entry: any, fallbackVisibility?: KnowledgeVisibility) => {
		if (!entry) {
			return;
		}
		if (typeof entry === 'string' || typeof entry === 'number') {
			recordId(entry, fallbackVisibility);
			return;
		}
		if (typeof entry !== 'object') {
			return;
		}

		const entryVisibility = resolveVisibilityFromEntry(entry) ?? fallbackVisibility;

		const resolvedId = resolveKnowledgeId(entry);
		if (resolvedId) {
			recordId(resolvedId, entryVisibility);
		}

		const candidateKeys = [
			'kb_id',
			'knowledge_id',
			'knowledgeId',
			'knowledge_base_id',
			'file_id',
			'fileId',
			'document_id',
			'uuid',
		];

		candidateKeys.forEach(key => {
			if (key in entry) {
				recordId((entry as any)[key], entryVisibility);
			}
		});

		if (entry?.metadata && typeof entry.metadata === 'object') {
			recordEntry(entry.metadata, entryVisibility);
		}
	};

	const gatherFromValue = (value: any, explicitVisibility?: KnowledgeVisibility) => {
		if (value === undefined || value === null) {
			return;
		}
		if (Array.isArray(value)) {
			value.forEach(item => gatherFromValue(item, explicitVisibility));
			return;
		}
		if (typeof value === 'object') {
			const visibilityBuckets: Array<{ key: string; visibility: KnowledgeVisibility }> = [
				{ key: 'public', visibility: 'public' },
				{ key: 'subscribers', visibility: 'subscribers' },
				{ key: 'subscriber', visibility: 'subscribers' },
				{ key: 'private', visibility: 'private' },
				{ key: 'hidden', visibility: 'private' },
			];

			let bucketMatched = false;
			for (const { key, visibility } of visibilityBuckets) {
				if (key in value) {
					bucketMatched = true;
					gatherFromValue((value as any)[key], visibility);
				}
			}

			if (bucketMatched) {
				return;
			}

			recordEntry(value, explicitVisibility);
			return;
		}

		recordId(value, explicitVisibility);
	};

	const candidateDescriptors: Array<{ path: string[]; visibility?: KnowledgeVisibility }> = [
		{ path: ['public_kb_ids'], visibility: 'public' },
		{ path: ['publicKbIds'], visibility: 'public' },
		{ path: ['kb_ids'] },
		{ path: ['kbIds'] },
		{ path: ['knowledge_ids'] },
		{ path: ['knowledgeIds'] },
		{ path: ['knowledge_base_ids'] },
		{ path: ['knowledgeBaseIds'] },
		{ path: ['knowledge_base_files'] },
		{ path: ['knowledgeBaseFiles'] },
		{ path: ['knowledge_files'] },
		{ path: ['knowledgeFiles'] },
		{ path: ['knowledge_base'] },
		{ path: ['knowledgeBase'] },
		{ path: ['knowledge'] },
		{ path: ['public_knowledge'], visibility: 'public' },
		{ path: ['publicKnowledge'], visibility: 'public' },
		{ path: ['public_knowledge_files'], visibility: 'public' },
		{ path: ['publicKnowledgeFiles'], visibility: 'public' },
		{ path: ['visible_knowledge_files'] },
		{ path: ['visibleKnowledgeFiles'] },
		{ path: ['content_visibility', 'knowledge'] },
		{ path: ['content_visibility', 'knowledge_files'] },
		{ path: ['content_visibility', 'knowledge_base'] },
		{ path: ['content_visibility', 'public'], visibility: 'public' },
		{ path: ['content_visibility', 'subscribers'], visibility: 'subscribers' },
		{ path: ['content_visibility', 'private'], visibility: 'private' },
		{ path: ['contentVisibility', 'knowledge'] },
		{ path: ['contentVisibility', 'knowledgeFiles'] },
		{ path: ['contentVisibility', 'knowledgeBase'] },
		{ path: ['contentVisibility', 'public'], visibility: 'public' },
		{ path: ['contentVisibility', 'subscribers'], visibility: 'subscribers' },
		{ path: ['contentVisibility', 'private'], visibility: 'private' },
		{ path: ['profile', 'knowledge_base_files'] },
		{ path: ['profile', 'knowledge_files'] },
		{ path: ['profile', 'public_kb_ids'], visibility: 'public' },
	];

	candidateDescriptors.forEach(({ path, visibility }) => {
		const value = getValueAtPath(profile, path);
		if (value !== undefined) {
			gatherFromValue(value, visibility);
		}
	});

	return {
		ids: Array.from(collectedIds),
		visibilityById,
	};
};

const extractEntryFromResponsePayload = (payload: any): any | null => {
	if (!payload) {
		return null;
	}

	if (Array.isArray(payload)) {
		if (!payload.length) {
			return null;
		}
		const match = payload.find(item => {
			try {
				return !!toTrimmedString(resolveKnowledgeId(item));
			} catch {
				return false;
			}
		});
		return match ?? payload[0];
	}

	if (typeof payload === 'object') {
		const candidateKeys = [
			'data',
			'result',
			'entry',
			'item',
			'knowledge',
			'knowledge_entry',
			'knowledgeEntry',
			'knowledge_base',
			'knowledgeBase',
			'record',
			'payload',
		];

		for (const key of candidateKeys) {
			if (key in payload) {
				const inner = (payload as any)[key];
				const resolved = extractEntryFromResponsePayload(inner);
				if (resolved) {
					return resolved;
				}
			}
		}
	}

	return payload;
};

export default function PublicMicrositePTView() {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { theme } = useTheme();
	const { token, user } = useAuth();
	const { avatar, setAvatarUrl } = useAvatar();
	const routeParams = (route as {
		params?: {
			professional_id?: string;
			initialProfileImageUrl?: string | null;
			initialCoverImageUrl?: string | null;
			profile_image_url?: string | null;
			cover_image_url?: string | null;
		};
	}).params ?? {};
	const professional_id = routeParams.professional_id;
	const initialProfileImageUrl = normalizeSpacesUrl(
		routeParams.initialProfileImageUrl ?? routeParams.profile_image_url ?? null,
	);
	const initialCoverImageUrl = normalizeSpacesUrl(
		routeParams.initialCoverImageUrl ?? routeParams.cover_image_url ?? null,
	);
	const [professional, setProfessional] = useState<Professional | null>(null);
	const [loading, setLoading] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
	const [fetchingSlots, setFetchingSlots] = useState(false);
	const [bookingSlot, setBookingSlot] = useState(false);
	const [professionalImageUrl, setProfessionalImageUrl] = useState<string | null>(initialProfileImageUrl);
	const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialCoverImageUrl);
	const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
	const [loadingAvatar, setLoadingAvatar] = useState(false);
	const [disableProfessionalImageTransforms, setDisableProfessionalImageTransforms] = useState(false);
	const [disableUserImageTransforms, setDisableUserImageTransforms] = useState(false);
	const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
	const [isFetchingSubscribers, setIsFetchingSubscribers] = useState(false);
	const [isSubscribing, setIsSubscribing] = useState(false);
	const [hasSubscription, setHasSubscription] = useState(false);
	const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
	const [subscriptionSuccess, setSubscriptionSuccess] = useState<string | null>(null);
	const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);
	const [subscribedPlan, setSubscribedPlan] = useState<SubscriptionPlanId | null>(null);

	const buildImageUri = React.useCallback(
		(rawUrl: string | null, preset: Parameters<typeof applyPreset>[1], disableTransforms: boolean, ...args: number[]): string | undefined => {
			if (!rawUrl) {
				return undefined;
			}
			if (disableTransforms) {
				return rawUrl;
			}
			const transformed = applyPreset(rawUrl, preset, ...args);
			return transformed ?? rawUrl;
		},
		[]);

	// Twin Window mode: 'chat' | 'purchase' | 'live'
	const [twinMode, setTwinMode] = useState<'chat' | 'purchase' | 'live'>('chat');
	const [selectedTwinPlan, setSelectedTwinPlan] = useState<string | null>(null);

	// Chat messages for Twin Window
	interface ChatMessage {
		id: string;
		text: string;
		isUser: boolean;
		timestamp: Date;
		videoUrl?: string; // For AI video responses
		videoId?: string;
		videoResponseText?: string | null;
		context: 'chat' | 'live';
	}

	interface VideoMessageAnimationState {
		full: string;
		displayed: string;
		status: 'idle' | 'animating' | 'done';
	}
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState('');
	const chatScrollRef = useRef<ScrollView>(null);
	const [liveInput, setLiveInput] = useState(''); // For live mode text input
	const chatModeMessages = React.useMemo(() => chatMessages.filter(message => message.context === 'chat'), [chatMessages]);
	const liveModeMessages = React.useMemo(() => chatMessages.filter(message => message.context === 'live'), [chatMessages]);
	const [currentVideoMessageId, setCurrentVideoMessageId] = useState<string | null>(null);
	const [videoMessageAnimations, setVideoMessageAnimations] = useState<Record<string, VideoMessageAnimationState>>({});
	const [chatMessageAnimations, setChatMessageAnimations] = useState<Record<string, VideoMessageAnimationState>>({});
	const animationTimersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
	const videoMessageAnimationsRef = useRef<Record<string, VideoMessageAnimationState>>({});
	const chatMessageAnimationsRef = useRef<Record<string, VideoMessageAnimationState>>({});
	const startChatMessageAnimationRef = useRef<((messageId: string, fullText: string) => void) | null>(null);
	const chatMessagesRef = useRef<ChatMessage[]>([]);
	const currentVideoMessageIdRef = useRef<string | null>(null);
	const animationStartedRef = useRef<Record<string, boolean>>({});

	// Voice recording states (chat)
	const [isRecording, setIsRecording] = useState(false);
	const [isProcessingVoice, setIsProcessingVoice] = useState(false);
	const audioRecorderPlayerRef = useRef<AudioRecorderPlayer | null>(null);
	const voiceRecordingPathRef = useRef<string | null>(null);
	const voiceUserMessageIdRef = useRef<string | null>(null);
	const voiceAiMessageIdRef = useRef<string | null>(null);
	const activeVoiceSoundRef = useRef<Sound | null>(null);

	const getAudioRecorder = React.useCallback((): AudioRecorderPlayer => {
		if (!audioRecorderPlayerRef.current) {
			audioRecorderPlayerRef.current = new AudioRecorderPlayer();
		}
		return audioRecorderPlayerRef.current;
	}, []);

	const audioRecordingConfig = React.useMemo<AudioSet>((): AudioSet => ({
		AudioSourceAndroid: AudioSourceAndroidType.MIC,
		OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
		AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
		AudioEncodingBitRateAndroid: 128000,
		AudioSamplingRateAndroid: 44100,
		AudioChannelsAndroid: 1,
		AVSampleRateKeyIOS: 44100,
		AVNumberOfChannelsKeyIOS: 1,
		AVFormatIDKeyIOS: AVEncodingOption.aac,
		AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
		AVModeIOS: AVModeIOSOption.voicechat,
	}), []);

	const stopActiveVoicePlayback = React.useCallback(() => {
		const activeSound = activeVoiceSoundRef.current;
		if (!activeSound) {
			return;
		}

		try {
			activeSound.stop(() => {
				activeSound.release();
			});
		} catch (stopError) {
			console.warn('⚠️ Failed to stop active voice playback:', stopError);
		} finally {
			activeVoiceSoundRef.current = null;
		}
	}, []);

	const playVoiceAudioFromUrl = React.useCallback((audioUrl: string | null | undefined) => {
		if (!audioUrl) {
			return;
		}

		stopActiveVoicePlayback();
		const sound = new Sound(audioUrl, undefined, (error: unknown) => {
			if (error) {
				console.warn('⚠️ Voice playback error:', error);
				return;
			}
			sound.play(() => {
				sound.release();
				if (activeVoiceSoundRef.current === sound) {
					activeVoiceSoundRef.current = null;
				}
			});
		});
		activeVoiceSoundRef.current = sound;
	}, [stopActiveVoicePlayback]);

	const resetVoiceMessageRefs = React.useCallback(() => {
		voiceRecordingPathRef.current = null;
		voiceUserMessageIdRef.current = null;
		voiceAiMessageIdRef.current = null;
	}, []);

	React.useEffect(() => {
		try {
			Sound.setCategory('Playback');
		} catch (categoryError) {
			console.warn('⚠️ Unable to set sound category:', categoryError);
		}

		return () => {
			stopActiveVoicePlayback();
			const recorder = audioRecorderPlayerRef.current;
			if (recorder) {
				try {
					recorder.stopRecorder();
				} catch { }
				try {
					recorder.removeRecordBackListener();
				} catch { }
			}
			const existingPath = voiceRecordingPathRef.current;
			if (existingPath) {
				RNFS.fs.unlink(existingPath).catch(() => null);
			}
			resetVoiceMessageRefs();
		};
	}, [resetVoiceMessageRefs, stopActiveVoicePlayback]);

	const cleanupVoiceRecordingFile = React.useCallback(async (path?: string | null) => {
		const target = path ?? voiceRecordingPathRef.current;
		if (!target) {
			return;
		}
		try {
			await RNFS.fs.unlink(target);
		} catch (unlinkError) {
			console.warn('⚠️ Failed to clean up voice recording file:', unlinkError);
		}
		if (!path) {
			voiceRecordingPathRef.current = null;
		}
	}, []);

	const sendVoiceMessage = React.useCallback(async (audioFilePath: string | null) => {
		if (!professional_id) {
			Alert.alert('Unavailable', 'Professional information is not available right now.');
			resetVoiceMessageRefs();
			setIsProcessingVoice(false);
			return;
		}

		const normalizedPath = audioFilePath || voiceRecordingPathRef.current;
		if (!normalizedPath) {
			setIsProcessingVoice(false);
			resetVoiceMessageRefs();
			setChatMessages(prev => prev.map(message => {
				if (message.id === voiceUserMessageIdRef.current) {
					return { ...message, text: '🎙️ Failed to capture voice message' };
				}
				return message;
			}));
			return;
		}

		const userMessageId = voiceUserMessageIdRef.current;
		const aiMessageId = voiceAiMessageIdRef.current;

		if (userMessageId) {
			setChatMessages(prev => prev.map(message => {
				if (message.id === userMessageId) {
					return { ...message, text: '🎙️ Processing voice...' };
				}
				return message;
			}));
		}

		setIsProcessingVoice(true);

		try {
			const apiBaseUrl = 'http://dev.api.uyir.ai';
			const endpoint = `${apiBaseUrl}/professionals/${professional_id}/chat/voice`;
			console.log('🎙️ Sending CHAT voice message to:', endpoint);

			const fileUri = Platform.OS === 'android' ? `file://${normalizedPath}` : normalizedPath;
			const formData = new FormData();
			formData.append('audio_file', {
				uri: fileUri,
				type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mpeg',
				name: 'chat_voice_message.mp3',
			} as any);

			const headers: Record<string, string> = { Accept: 'application/json' };
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				headers,
				body: formData,
			});

			const rawBody = await response.text();
			console.log('🎙️ Chat voice API response:', response.status, rawBody);

			let payload: any = null;
			if (rawBody) {
				try {
					payload = JSON.parse(rawBody);
				} catch (parseError) {
					console.warn('⚠️ Unable to parse chat voice response JSON', parseError);
				}
			}

			if (response.ok) {
				const transcript = toTrimmedString(payload?.transcript ?? payload?.text ?? payload?.user_text);
				const replyText = toTrimmedString(payload?.reply ?? payload?.response ?? payload?.message);
				const audioUrl = toTrimmedString(payload?.audio_url ?? payload?.audioUrl);

				setChatMessages(prev => prev.map(message => {
					if (message.id === userMessageId) {
						return { ...message, text: transcript ?? '🎙️ Voice message sent' };
					}
					if (message.id === aiMessageId) {
						return { ...message, text: replyText ?? 'Processing your voice message...' };
					}
					return message;
				}));

				if (replyText && aiMessageId) {
					const animator = startChatMessageAnimationRef.current;
					if (animator) {
						animator(aiMessageId, replyText);
					}
				}

				if (audioUrl) {
					playVoiceAudioFromUrl(audioUrl);
				}
			} else {
				setChatMessages(prev => prev.map(message => {
					if (message.id === userMessageId) {
						return { ...message, text: '🎙️ Could not process voice message' };
					}
					if (message.id === aiMessageId) {
						return { ...message, text: 'Sorry, I could not respond right now. Please try again.' };
					}
					return message;
				}));
			}
		} catch (error) {
			console.error('❌ Chat voice error:', error);
			setChatMessages(prev => prev.map(message => {
				if (message.id === userMessageId) {
					return { ...message, text: '🎙️ Failed to process voice message' };
				}
				if (message.id === aiMessageId) {
					return { ...message, text: 'Network error. Please check your connection and try again.' };
				}
				return message;
			}));
		} finally {
			setIsProcessingVoice(false);
			cleanupVoiceRecordingFile(normalizedPath);
			resetVoiceMessageRefs();
		}
	}, [cleanupVoiceRecordingFile, playVoiceAudioFromUrl, professional_id, resetVoiceMessageRefs, setChatMessages, setIsProcessingVoice, startChatMessageAnimationRef, token]);

	const startVoiceRecording = async () => {
		if (isRecording || isProcessingVoice) {
			return;
		}

		if (!professional_id) {
			Alert.alert('Unavailable', 'Professional information is not available right now.');
			return;
		}

		const hasPermission = await requestAudioPermission();
		if (!hasPermission) {
			Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
			return;
		}

		const timestamp = Date.now();
		const userMessageId = `chat-user-voice-${timestamp}`;
		const aiMessageId = `chat-ai-voice-${timestamp}`;
		voiceUserMessageIdRef.current = userMessageId;
		voiceAiMessageIdRef.current = aiMessageId;

		const now = new Date();
		stopActiveVoicePlayback();
		setChatMessages(prev => ([
			...prev,
			{
				id: userMessageId,
				text: '🎙️ Recording... tap again to stop',
				isUser: true,
				timestamp: now,
				videoResponseText: null,
				context: 'chat' as const,
			},
			{
				id: aiMessageId,
				text: '',
				isUser: false,
				timestamp: now,
				videoResponseText: null,
				context: 'chat' as const,
			},
		]));

		requestAnimationFrame(() => {
			setTimeout(() => {
				chatScrollRef.current?.scrollToEnd({ animated: true });
			}, 80);
		});

		try {
			const recorder = getAudioRecorder();
			const cacheDir = RNFS.fs.dirs.CacheDir;
			const filePath = `${cacheDir}/chat_voice_${timestamp}.mp3`;
			voiceRecordingPathRef.current = filePath;

			await recorder.startRecorder(filePath, audioRecordingConfig);
			setIsRecording(true);

			recorder.addRecordBackListener((e: { currentPosition: number }) => {
				console.log('🎙️ Chat recording...', e.currentPosition);
			});
		} catch (error) {
			console.error('❌ Failed to start chat voice recording:', error);
			setIsRecording(false);
			setChatMessages(prev => prev.map(message => {
				if (message.id === userMessageId) {
					return { ...message, text: '🎙️ Unable to start recording' };
				}
				if (message.id === aiMessageId) {
					return { ...message, text: '' };
				}
				return message;
			}));
			resetVoiceMessageRefs();
		}
	};

	const stopVoiceRecording = async () => {
		if (!isRecording) {
			return;
		}

		setIsRecording(false);

		try {
			const recorder = getAudioRecorder();
			const result = await recorder.stopRecorder();
			recorder.removeRecordBackListener();

			const normalizedPath = typeof result === 'string' && result.length ? result.replace('file://', '') : voiceRecordingPathRef.current;
			await sendVoiceMessage(normalizedPath ?? null);
		} catch (error) {
			console.error('❌ Failed to stop chat voice recording:', error);
			setChatMessages(prev => prev.map(message => {
				if (message.id === voiceUserMessageIdRef.current) {
					return { ...message, text: '🎙️ Failed to capture voice message' };
				}
				if (message.id === voiceAiMessageIdRef.current) {
					return { ...message, text: '' };
				}
				return message;
			}));
			setIsProcessingVoice(false);
			cleanupVoiceRecordingFile();
			resetVoiceMessageRefs();
		}
	};

	// Knowledge base files
	const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeBaseFile[]>([]);
	const [loadingKnowledge, setLoadingKnowledge] = useState(false);
	const [profileKnowledgeIds, setProfileKnowledgeIds] = useState<string[]>([]);
	const [profileKnowledgeVisibility, setProfileKnowledgeVisibility] = useState<KnowledgeVisibilityHints>({});

	// Tavus video generation states
	const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
	const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
	const [videoStatus, setVideoStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | null>(null);
	const [videoStatusRaw, setVideoStatusRaw] = useState<string | null>(null);
	const [videoPlaybackSources, setVideoPlaybackSources] = useState<VideoPlaybackSources>({ stream: null, download: null, hosted: null });
	const [videoPlaybackError, setVideoPlaybackError] = useState<string | null>(null);
	const [videoGenerationProgress, setVideoGenerationProgress] = useState<number | null>(null);
	const [isVideoMuted, setIsVideoMuted] = useState(false);
	const [videoReloadToken, setVideoReloadToken] = useState(0);
	const [webViewReloadToken, setWebViewReloadToken] = useState(0);
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollingErrorCountRef = useRef(0);
	const webViewRef = useRef<React.ComponentRef<typeof WebView> | null>(null);
	const videoPlaybackSourcesRef = useRef<VideoPlaybackSources>({ stream: null, download: null, hosted: null });
	const videoStatusMessage = getVideoStatusMessage(videoStatusRaw, videoStatus, videoGenerationProgress);

	function getVideoStatusMessage(
		rawStatus: string | null,
		normalizedStatus: 'pending' | 'processing' | 'completed' | 'failed' | null,
		progress: number | null,
	) {
		const key = (rawStatus || normalizedStatus || '').toLowerCase();
		const formatWithProgress = (message: string) => {
			if (progress === null || Number.isNaN(progress)) {
				return message;
			}
			const rounded = Math.min(100, Math.max(0, Math.round(progress)));
			return `${message} (${rounded}%)`;
		};

		switch (key) {
			case 'pending':
				return formatWithProgress('Starting video generation...');
			case 'queued':
				return formatWithProgress('Video queued. Waiting for processing...');
			case 'processing':
			case 'in_progress':
				return formatWithProgress('Generating your video...');
			case 'ready':
			case 'completed':
				return formatWithProgress('Video ready. Loading playback...');
			case 'failed':
				return 'Video generation failed. Please try again.';
			default:
				return formatWithProgress(key ? `Video status: ${key}...` : 'Checking video status...');
		}
	}

	const normalizePlaybackUrl = (value?: string | null) => toTrimmedString(value ?? undefined) ?? null;

	const updateVideoPlaybackSources = (
		sources: Partial<VideoPlaybackSources>,
		options?: { replace?: boolean },
	) => {
		const base = options?.replace
			? { stream: null, download: null, hosted: null }
			: videoPlaybackSourcesRef.current;

		const snapshot: VideoPlaybackSources = {
			stream: normalizePlaybackUrl(sources.stream ?? base.stream),
			download: normalizePlaybackUrl(sources.download ?? base.download),
			hosted: normalizePlaybackUrl(sources.hosted ?? base.hosted),
		};

		console.log('📦 updateVideoPlaybackSources - input sources:', JSON.stringify(sources));
		console.log('📦 updateVideoPlaybackSources - computed snapshot:', JSON.stringify(snapshot));

		// Update both ref and state
		videoPlaybackSourcesRef.current = snapshot;
		setVideoPlaybackSources(snapshot);

		const primary = snapshot.stream ?? snapshot.download ?? snapshot.hosted ?? null;
		console.log('📦 Primary video URL:', primary);
		setCurrentVideoUrl(primary);
		if (primary) {
			setVideoPlaybackError(null);
		}
		return snapshot;
	};

	const resetVideoPlaybackState = () => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		const activeMessageId = currentVideoMessageIdRef.current;
		if (activeMessageId) {
			const timer = animationTimersRef.current[activeMessageId];
			if (timer) {
				clearInterval(timer);
				delete animationTimersRef.current[activeMessageId];
			}
			animationStartedRef.current[activeMessageId] = false;
		}
		videoPlaybackSourcesRef.current = { stream: null, download: null, hosted: null };
		setVideoPlaybackSources({ stream: null, download: null, hosted: null });
		setCurrentVideoUrl(null);
		setVideoPlaybackError(null);
		setVideoGenerationProgress(null);
		setCurrentVideoMessageId(null);
	};

	const resolveVideoPlaybackUrls = (source: any): Partial<VideoPlaybackSources> => {
		if (!source) {
			return {};
		}

		const read = (...paths: string[]) => {
			for (const path of paths) {
				const value = getValueAtPath(source, path.split('.').filter(Boolean));
				const normalized = toTrimmedString(value);
				if (normalized) {
					console.log(`🔗 Found URL at '${path}':`, normalized.slice(0, 80));
					return normalized;
				}
			}
			return undefined;
		};

		const result = {
			stream: read('stream_url', 'streamUrl', 'stream.url', 'data.stream_url', 'data.streamUrl'),
			download: read('download_url', 'downloadUrl', 'data.download_url', 'data.downloadUrl'),
			hosted: read('hosted_url', 'hostedUrl', 'data.hosted_url', 'data.hostedUrl'),
		};
		console.log('🔗 Resolved video URLs:', JSON.stringify(result));
		return result;
	};

	const extractVideoGenerationProgress = (source: any): number | null => {
		if (!source) {
			return null;
		}

		const candidatePaths = [
			'progress',
			'progress_percent',
			'progress_percentage',
			'progressPercent',
			'progressPercentage',
			'percentage_complete',
			'percentageComplete',
			'generation_progress',
			'data.progress',
			'data.progress_percent',
			'data.progress_percentage',
			'data.progressPercent',
			'data.progressPercentage',
			'data.percentage_complete',
			'data.percentageComplete',
			'data.generation_progress',
		];

		const parseProgressValue = (value: unknown): number | null => {
			if (value === undefined || value === null) {
				return null;
			}

			const asString = typeof value === 'string' ? value.trim() : undefined;
			if (asString && asString.includes('/')) {
				const [numeratorRaw, denominatorRaw] = asString.split('/').map(segment => segment.trim());
				const numerator = parseFloat(numeratorRaw);
				const denominator = parseFloat(denominatorRaw);
				if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
					return (numerator / denominator) * 100;
				}
			}

			const numeric = typeof value === 'number' ? value : parseFloat(String(value));
			if (!Number.isFinite(numeric)) {
				return null;
			}

			if (numeric <= 1 && numeric >= 0) {
				return numeric * 100;
			}

			return numeric;
		};

		for (const path of candidatePaths) {
			const value = getValueAtPath(source, path.split('.'));
			const parsed = parseProgressValue(value);
			if (parsed !== null) {
				return Math.min(100, Math.max(0, parsed));
			}
		}

		return null;
	};

	const extractVideoResponseText = (source: any): string | null => {
		if (!source) {
			console.log('📝 extractVideoResponseText: source is null/undefined');
			return null;
		}

		console.log('📝 extractVideoResponseText: checking source', JSON.stringify(source).slice(0, 500));

		// Generic status/success messages to filter out - these are NOT the actual script
		// Only filter very specific status messages, not general text
		const genericMessagePatterns = [
			/^your request has processed successfully!?$/i,
			/^request processed successfully!?$/i,
			/^processing complete!?$/i,
			/^success!?$/i,
			/^completed!?$/i,
			/^response received!?$/i,
		];

		const isGenericMessage = (text: string): boolean => {
			const trimmed = text.trim();
			// Only filter exact matches of generic messages
			return genericMessagePatterns.some(pattern => pattern.test(trimmed));
		};

		// Prioritize script-specific fields first, then fall back to generic ones
		const candidatePaths = [
			'processed_text',  // Primary: actual processed script
			'generated_output', // Tavus generated output
			'script',
			'script_text',
			'transcript',
			'response_text',
			'text_response',
			'output_text',
			'output',
			'result',
			'data.script',
			'data.transcript',
			'data.response_text',
			'data.processed_text',
			'data.generated_output',
			'data.output',
			'tavus_response.script',
			'tavus_response.processed_text',
			'tavus_response.generated_output',
			// Less specific - only use if nothing better found
			'response',
			'data.response',
			'status_details',
			'statusDetails',
			'details',
			'data.status_details',
			'data.statusDetails',
			// Most generic - prone to having status messages
			'message',
			'text',
		];

		const normalizeText = (value: any): string | null => {
			if (typeof value === 'string') {
				const trimmed = value.trim();
				return trimmed.length ? trimmed : null;
			}
			if (Array.isArray(value)) {
				const joined = value
					.map(item => (typeof item === 'string' ? item.trim() : ''))
					.filter(Boolean)
					.join('\n');
				return joined.length ? joined : null;
			}
			return null;
		};

		for (const path of candidatePaths) {
			const value = getValueAtPath(source, path.split('.'));
			const normalized = normalizeText(value);
			if (normalized) {
				console.log(`📝 Found text at path '${path}':`, normalized.slice(0, 100));
				if (!isGenericMessage(normalized)) {
					console.log(`✅ Using script text from '${path}'`);
					return normalized;
				} else {
					console.log(`⏭️ Skipping generic message at '${path}'`);
				}
			}
		}

		console.log('❌ No valid script text found in response');
		return null;
	};

	const hasNativePlaybackUrl = Boolean(videoPlaybackSources.stream || videoPlaybackSources.download);
	const nativePlaybackUrl = videoPlaybackSources.stream ?? videoPlaybackSources.download ?? null;
	const hostedPlaybackUrl = videoPlaybackSources.hosted;
	const webViewPlaybackUrl = hasNativePlaybackUrl ? null : (hostedPlaybackUrl ?? currentVideoUrl ?? null);
	const hasPlayableVideo = Boolean((hasNativePlaybackUrl && nativePlaybackUrl) || webViewPlaybackUrl);
	const displaySubscriberCount = subscriberCount ?? professional?.subscriber_count ?? 0;
	const subscriptionButtonDisabled = !selectedPlan || isSubscribing || hasSubscription;

	// 🔧 FIX: Prevent excessive API calls with ref to track last fetch time
	const lastFetchTime = useRef<number>(0);
	const FETCH_COOLDOWN_MS = 2000; // Minimum 2 seconds between fetches

	const fetchAvatarImage = React.useCallback(async () => {
		if (!token || !user?.avatar_id) {
			return;
		}

		try {
			setLoadingAvatar(true);
			const backendUrl = `http://dev.api.uyir.ai:8081/api/avatar/${user.avatar_id}`;
			console.log('🖼️ PublicMicrositePTView: Fetching avatar image from:', backendUrl);

			const response = await fetch(backendUrl, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				const imageUrl = data?.photo_path || data?.avatar_url || data?.image_url || data?.url || null;

				if (imageUrl) {
					setDisableUserImageTransforms(false);
					setAvatarImageUrl(imageUrl);
					setAvatarUrl(imageUrl);
					console.log('✅ PublicMicrositePTView: Retrieved avatar image URL:', imageUrl);
				} else {
					console.log('ℹ️ PublicMicrositePTView: Avatar response missing URL fields');
				}
			} else {
				console.log('⚠️ PublicMicrositePTView: Failed to fetch avatar image:', response.status);
			}
		} catch (error) {
			console.error('❌ PublicMicrositePTView: Error fetching avatar image:', error);
		} finally {
			setLoadingAvatar(false);
		}
	}, [setAvatarUrl, token, user?.avatar_id]);

	const professionalHeaderUri = React.useMemo(() => {
		const raw = coverImageUrl || professionalImageUrl;
		if (!raw) {
			return null;
		}
		const transformed = buildImageUri(raw, 'coverPhoto', disableProfessionalImageTransforms, screenWidth, 220);
		return transformed || raw;
	}, [buildImageUri, coverImageUrl, disableProfessionalImageTransforms, professionalImageUrl]);
	const professionalAvatarUri = React.useMemo(() => {
		const raw = professionalImageUrl;
		if (!raw) {
			return null;
		}
		const transformed = buildImageUri(raw, 'profileAvatar', disableProfessionalImageTransforms, 50);
		return transformed || raw;
	}, [buildImageUri, disableProfessionalImageTransforms, professionalImageUrl]);
	const userHeaderUri = !professional_id
		? buildImageUri(avatarImageUrl, 'coverPhoto', disableUserImageTransforms, screenWidth, 220)
		: undefined;
	const professionalTwinUri = professionalAvatarUri ?? professionalHeaderUri ?? professionalImageUrl ?? coverImageUrl ?? null;
	const userTwinUri = userHeaderUri ?? avatarImageUrl ?? null;

	const buildPerFileCandidateRequests = React.useCallback((profId: string, kbId: string): CandidateRequest[] => {
		const normalizedProfId = toTrimmedString(profId);
		const normalizedKbId = toTrimmedString(kbId);
		if (!normalizedProfId || !normalizedKbId) {
			return [];
		}

		const encodedProfId = encodeURIComponent(normalizedProfId);
		const encodedKbId = encodeURIComponent(normalizedKbId);
		const descriptors = [
			{ path: `/professionals/${encodedProfId}/kb/${encodedKbId}`, reason: 'professional scoped per-file', requireAuth: true },
			{ path: `/professionals/${encodedProfId}/kb/${encodedKbId}?visibility=public`, reason: 'professional scoped per-file (public)', requireAuth: true },
			{ path: `/professional/kb/${encodedKbId}`, reason: 'primary API per-file', requireAuth: false },
			{ path: `/professional/kb/${encodedKbId}?professional_id=${encodedProfId}`, reason: 'primary API per-file (with professional)', requireAuth: false },
			{ path: `/professional/kb/${encodedKbId}?professional_id=${encodedProfId}&visibility=public`, reason: 'primary API per-file (public)', requireAuth: false },
		];

		const hasToken = Boolean(token);
		const seen = new Set<string>();
		const requests: CandidateRequest[] = [];
		const addCandidate = (url: string | undefined, includeAuth: boolean, reason: string) => {
			if (!url) {
				return;
			}
			if (includeAuth && !hasToken) {
				return;
			}
			const key = `${includeAuth ? 'auth' : 'anon'}|${url}`;
			if (seen.has(key)) {
				return;
			}
			seen.add(key);
			requests.push({ url, includeAuth, reason });
		};

		const registerForPath = (path: string, requireAuth: boolean, reason: string) => {
			addCandidate(buildUrl(path), requireAuth, `${reason} via API host`);
			addCandidate(buildKnowledgeUrl(path), requireAuth, `${reason} via knowledge host`);
			addCandidate(`http://dev.api.uyir.ai:8081${path}`, requireAuth, `${reason} via legacy host`);

			if (!requireAuth && hasToken) {
				addCandidate(buildUrl(path), true, `${reason} via API host (auth)`);
				addCandidate(buildKnowledgeUrl(path), true, `${reason} via knowledge host (auth)`);
				addCandidate(`http://dev.api.uyir.ai:8081${path}`, true, `${reason} via legacy host (auth)`);
			}
		};

		descriptors.forEach(descriptor => {
			registerForPath(descriptor.path, descriptor.requireAuth, descriptor.reason);
		});

		return requests;
	}, [token]);

	const fetchKnowledgeEntryById = React.useCallback(async (profId: string, kbId: string): Promise<KnowledgeBaseFile | null> => {
		const normalizedProfId = toTrimmedString(profId);
		const normalizedKbId = toTrimmedString(kbId);
		if (!normalizedProfId || !normalizedKbId) {
			return null;
		}

		const candidateRequests = buildPerFileCandidateRequests(normalizedProfId, normalizedKbId);
		for (const candidate of candidateRequests) {
			try {
				const headers: Record<string, string> = {
					Accept: 'application/json',
				};
				if (candidate.includeAuth && token) {
					headers.Authorization = `Bearer ${token}`;
				}
				console.log(`📄 Fetching knowledge entry ${normalizedKbId} via ${candidate.reason}`);
				const response = await fetch(candidate.url, {
					method: 'GET',
					headers,
				});

				if (!response.ok) {
					console.warn(`⚠️ Knowledge entry ${normalizedKbId} fetch failed via ${candidate.reason} with status ${response.status}`);
					if (response.status === 401 || response.status === 403) {
						console.warn('⛔ Per-file knowledge request unauthorized/forbidden; aborting further attempts');
						break;
					}
					continue;
				}

				const responseText = await response.text();
				let payload: any = responseText;
				try {
					payload = responseText ? JSON.parse(responseText) : {};
				} catch (parseError) {
					console.warn(`⚠️ Failed to parse per-file response for ${normalizedKbId}, using raw payload`, parseError);
				}

				const entry = extractEntryFromResponsePayload(payload);
				if (!entry) {
					console.warn(`⚠️ No knowledge entry payload resolved for ${normalizedKbId} via ${candidate.reason}`);
					continue;
				}

				const normalizedEntry = normalizeKnowledgeEntry(entry);
				if (!normalizedEntry) {
					console.warn(`⚠️ Failed to normalize knowledge entry ${normalizedKbId} via ${candidate.reason}`);
					continue;
				}

				return normalizedEntry as KnowledgeBaseFile;
			} catch (error) {
				console.error(`❌ Error fetching knowledge entry ${normalizedKbId} via ${candidate.reason}:`, error);
			}
		}

		console.warn(`⚠️ Exhausted per-file knowledge endpoints for kb_id ${normalizedKbId}`);
		return null;
	}, [buildPerFileCandidateRequests, token]);

	const fetchKnowledgeFilesByIds = React.useCallback(async (profId: string, kbIds: string[]): Promise<KnowledgeBaseFile[]> => {
		const uniqueIds = Array.from(
			new Set(
				kbIds
					.map(id => toTrimmedString(id))
					.filter((value): value is string => typeof value === 'string' && value.length > 0),
			),
		);

		if (!uniqueIds.length) {
			return [];
		}

		const results: KnowledgeBaseFile[] = [];

		for (const kbId of uniqueIds) {
			const entry = await fetchKnowledgeEntryById(profId, kbId);
			if (entry) {
				results.push(entry);
			}
		}

		return results;
	}, [fetchKnowledgeEntryById]);

	const fetchKnowledgeFilesViaList = React.useCallback(async (profId: string): Promise<KnowledgeBaseFile[]> => {
		const encodedProfId = encodeURIComponent(profId);
		const legacyBasePath = `/professional/kb?professional_id=${encodedProfId}`;
		const professionalScopedBase = `/professionals/${encodedProfId}/kb`;
		const candidatePathConfigs = [
			{ path: professionalScopedBase, reason: 'professional scoped list', requireAuth: true },
			{ path: `${professionalScopedBase}?visibility=public`, reason: 'professional scoped list (public)', requireAuth: true },
			{ path: `${professionalScopedBase}?limit=50&offset=0`, reason: 'professional scoped list (paged)', requireAuth: true },
			{ path: `${professionalScopedBase}?visibility=public&limit=50&offset=0`, reason: 'professional scoped list (public, paged)', requireAuth: true },
			{ path: legacyBasePath, reason: 'primary API list', requireAuth: false },
			{ path: `${legacyBasePath}&limit=50&offset=0`, reason: 'primary API list (paged)', requireAuth: false },
			{ path: `${legacyBasePath}&visibility=public`, reason: 'primary API list (public)', requireAuth: false },
			{ path: `${legacyBasePath}&visibility=public&limit=50&offset=0`, reason: 'primary API list (public, paged)', requireAuth: false },
		];

		const candidateRequests: CandidateRequest[] = [];
		const hasToken = Boolean(token);
		const seen = new Set<string>();
		const addCandidate = (url: string | undefined, includeAuth: boolean, reason: string) => {
			if (!url) {
				return;
			}
			if (includeAuth && !hasToken) {
				return;
			}
			const key = `${includeAuth ? 'auth' : 'anon'}|${url}`;
			if (seen.has(key)) {
				return;
			}
			seen.add(key);
			candidateRequests.push({ url, includeAuth, reason });
		};

		candidatePathConfigs.forEach(({ path, reason, requireAuth }) => {
			addCandidate(buildUrl(path), requireAuth, reason);
			addCandidate(buildKnowledgeUrl(path), requireAuth, `${reason} via knowledge host`);
			addCandidate(`http://dev.api.uyir.ai:8081${path}`, requireAuth, `${reason} via legacy host`);
		});

		if (hasToken) {
			candidatePathConfigs.forEach(({ path, reason }) => {
				addCandidate(buildUrl(path), true, `${reason} (auth)`);
				addCandidate(buildKnowledgeUrl(path), true, `${reason} via knowledge host (auth)`);
				addCandidate(`http://dev.api.uyir.ai:8081${path}`, true, `${reason} via legacy host (auth)`);
			});
		}

		let response: Response | null = null;

		for (const candidate of candidateRequests) {
			try {
				const headers: Record<string, string> = {
					Accept: 'application/json',
				};
				if (candidate.includeAuth && token) {
					headers.Authorization = `Bearer ${token}`;
				}
				console.log('📚 Fetching knowledge base files from:', candidate.url);
				console.log('🎫 Auth header attached:', !!headers.Authorization);
				const candidateResponse = await fetch(candidate.url, {
					method: 'GET',
					headers,
				});

				if (candidateResponse.ok) {
					console.log(`✅ Knowledge list fetch succeeded via ${candidate.reason}`);
					response = candidateResponse;
					break;
				}

				console.warn(`⚠️ Knowledge list fetch via ${candidate.reason} failed with status ${candidateResponse.status}`);
				if (candidateResponse.status === 401 || candidateResponse.status === 403) {
					console.warn('⛔ Knowledge list request unauthorized/forbidden; skipping remaining candidates for this phase');
					break;
				}
			} catch (candidateError) {
				console.error(`❌ Knowledge list fetch error via ${candidate.reason}:`, candidateError);
			}
		}

		if (!response || !response.ok) {
			return [];
		}

		try {
			const responseText = await response.text();
			let payload: any = [];
			try {
				payload = responseText ? JSON.parse(responseText) : [];
			} catch (parseError) {
				console.warn('⚠️ Failed to parse knowledge list response JSON, defaulting to empty list', parseError);
			}

			const filesArray = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.items)
					? payload.items
					: Array.isArray(payload?.data)
						? payload.data
						: Array.isArray(payload?.results)
							? payload.results
							: [];

			return filesArray.map((file: any) => {
				const normalized = normalizeKnowledgeEntry(file);
				if (!normalized.id) {
					console.warn('⚠️ Knowledge entry missing identifier', file);
				}
				return normalized as KnowledgeBaseFile;
			});
		} catch (error) {
			console.error('❌ Error parsing knowledge list response:', error);
			return [];
		}
	}, [token]);

	const fetchSubscribers = React.useCallback(async (profId: string) => {
		const normalizedId = toTrimmedString(profId);
		if (!normalizedId) {
			return;
		}

		try {
			setIsFetchingSubscribers(true);
			const endpoint = buildUrl(`/professionals/${encodeURIComponent(normalizedId)}/subscribers`);
			console.log('👥 Fetching subscribers from:', endpoint);

			const headers: Record<string, string> = {
				Accept: 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			};

			const response = await fetch(endpoint, {
				method: 'GET',
				headers,
			});

			const rawBody = await response.text();
			if (!response.ok) {
				console.warn('⚠️ Subscribers fetch failed:', response.status, rawBody);
				throw new Error(`Failed to load subscribers: ${response.status}`);
			}

			let payload: any = null;
			if (rawBody) {
				try {
					payload = JSON.parse(rawBody);
				} catch (parseError) {
					console.warn('⚠️ Subscribers response not JSON. Ignoring parse error.', parseError);
				}
			}

			const resolveArray = (value: any): any[] => {
				if (Array.isArray(value)) return value;
				if (Array.isArray(value?.items)) return value.items;
				if (Array.isArray(value?.data)) return value.data;
				if (Array.isArray(value?.results)) return value.results;
				if (Array.isArray(value?.subscribers)) return value.subscribers;
				return [];
			};

			const list = resolveArray(payload);
			const derivedCount = typeof payload?.count === 'number'
				? payload.count
				: typeof payload?.total === 'number'
					? payload.total
					: list.length;

			setSubscriberCount(derivedCount);
			console.log('👥 Subscribers count resolved:', derivedCount);

			const currentUserId = user?.user_id ? String(user.user_id) : null;
			if (currentUserId) {
				let matchedEntry: any = null;
				for (const entry of list) {
					const candidate =
						entry?.user_id ??
						entry?.subscriber_id ??
						entry?.subscriberId ??
						entry?.userId ??
						entry?.id;
					if (candidate && String(candidate) === currentUserId) {
						matchedEntry = entry;
						break;
					}
				}
				setHasSubscription(!!matchedEntry);
				if (matchedEntry) {
					const planCandidates = [
						matchedEntry?.plan_id,
						matchedEntry?.plan,
						matchedEntry?.plan_type,
						matchedEntry?.planType,
						matchedEntry?.subscription_plan,
						matchedEntry?.subscriptionPlan,
						matchedEntry?.subscription?.plan_id,
						matchedEntry?.subscription?.plan,
						matchedEntry?.subscription?.plan_type,
						matchedEntry?.subscription?.planType,
						matchedEntry?.planDetails?.plan_id,
						matchedEntry?.planDetails?.plan,
						matchedEntry?.planDetails?.plan_type,
					];
					let normalizedPlan: SubscriptionPlanId | null = null;
					for (const candidate of planCandidates) {
						normalizedPlan = resolvePlanId(candidate);
						if (normalizedPlan) {
							break;
						}
					}
					setSubscribedPlan(normalizedPlan);
				} else {
					setSubscribedPlan(null);
				}
			} else {
				setHasSubscription(false);
				setSubscribedPlan(null);
			}
		} catch (error) {
			console.error('❌ Error fetching subscribers:', error);
		} finally {
			setIsFetchingSubscribers(false);
		}
	}, [token, user?.user_id]);

	const fetchProfessional = React.useCallback(async () => {
		// 🔧 FIX: Debounce to prevent excessive API calls
		const now = Date.now();
		if (now - lastFetchTime.current < FETCH_COOLDOWN_MS) {
			console.log('⏸️ Skipping fetch - too soon since last fetch');
			return;
		}
		lastFetchTime.current = now;

		setLoading(true);

		// If no professional_id is provided, fetch the current user's professional profile
		const useAuthEndpoint = !professional_id;

		const backendUrl = useAuthEndpoint
			? `http://dev.api.uyir.ai:8081/professional/`
			: `http://dev.api.uyir.ai:8081/professionals/${professional_id}`;

		console.log('🔗 Fetching professional data from:', backendUrl);
		console.log('🔐 Using authenticated endpoint:', useAuthEndpoint);
		console.log('🎫 Token available:', !!token);

		try {
			const headers: Record<string, string> = {};
			if (useAuthEndpoint && token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(backendUrl, { headers });

			console.log('📥 Professional data response status:', response.status);

			if (response.ok) {
				const data = await response.json();
				console.log('✅ Professional data received:', JSON.stringify(data, null, 2));

				// If using authenticated endpoint, extract professional from dashboard response
				const professionalData = useAuthEndpoint && data.professional ? data.professional : data;

				console.log('📝 About field value:', professionalData.about);
				console.log('📝 Bio field value:', professionalData.bio);
				console.log('👤 Display name:', professionalData.display_name);
				console.log('🆔 Professional ID:', professionalData.professional_id);

				setProfessional(professionalData as Professional);
				if (typeof professionalData?.subscriber_count === 'number') {
					setSubscriberCount(professionalData.subscriber_count);
				}

				const profIdValue = toTrimmedString(professionalData?.professional_id ?? professional_id ?? null);
				if (profIdValue) {
					fetchSubscribers(profIdValue);
				}

				const scanResult = deriveKnowledgeScanFromProfile(professionalData);
				console.log('🔎 Extracted knowledge ids from profile:', scanResult.ids);
				setProfileKnowledgeIds(prev => {
					if (prev.length === scanResult.ids.length && prev.every((id, index) => id === scanResult.ids[index])) {
						return prev;
					}
					return scanResult.ids;
				});
				setProfileKnowledgeVisibility(prev => {
					const prevEntries = Object.entries(prev);
					const nextEntries = Object.entries(scanResult.visibilityById);
					if (
						prevEntries.length === nextEntries.length &&
						prevEntries.every(([key, value]) => scanResult.visibilityById[key] === value)
					) {
						return prev;
					}
					return scanResult.visibilityById;
				});

				// ✅ Extract and store professional image URLs (profile + cover)
				const resolveImageCandidate = (paths: string[][]): string | null => {
					for (const path of paths) {
						const candidate = toTrimmedString(getValueAtPath(professionalData, path));
						if (candidate) {
							console.log('🖼️ Found image candidate at path:', path.join('.'), candidate);
							return candidate;
						}
					}
					return null;
				};

				const profileImageCandidate = resolveImageCandidate([
					['profile_image_url'],
					['profile_image'],
					['profile_image', 'url'],
					['profile_image', 'path'],
					['profileImageUrl'],
					['profileImage'],
					['profileImage', 'url'],
					['profileImage', 'path'],
					['profile', 'profile_image_url'],
					['profile', 'image_url'],
					['profile', 'profileImageUrl'],
					['profile', 'profilePhotoUrl'],
					['profile', 'photo_url'],
					['profile', 'photoPath'],
					['profile_photo_url'],
					['profilePhotoUrl'],
					['photo_url'],
					['photoUrl'],
					['photo_path'],
					['avatar_url'],
					['avatar', 'url'],
					['avatar', 'image_url'],
					['avatar', 'photo_url'],
					['media', 'profile', 'url'],
					['images', 'profile', 'url'],
				]);

				const coverImageCandidate = resolveImageCandidate([
					['cover_image_url'],
					['coverImageUrl'],
					['cover_image'],
					['cover_image', 'url'],
					['cover_image', 'path'],
					['coverImage'],
					['coverImage', 'url'],
					['coverImage', 'path'],
					['cover', 'url'],
					['cover', 'image_url'],
					['banner_url'],
					['banner', 'url'],
					['profile', 'cover_image_url'],
					['profile', 'coverImageUrl'],
				]);

				const profileImageUrl = normalizeSpacesUrl(profileImageCandidate);
				const coverImg = normalizeSpacesUrl(coverImageCandidate);
				if (profileImageUrl) {
					setDisableProfessionalImageTransforms(false);
					setProfessionalImageUrl(prev => {
						if (prev === profileImageUrl) {
							return prev;
						}
						console.log('🖼️ Set professional profile image URL:', profileImageUrl);
						return profileImageUrl;
					});
				}
				if (coverImg) {
					setDisableProfessionalImageTransforms(false);
					setCoverImageUrl(prev => {
						if (prev === coverImg) {
							return prev;
						}
						console.log('🖼️ Set cover image URL:', coverImg);
						return coverImg;
					});
				}
			} else {
				const errorText = await response.text();
				console.error('❌ Failed to fetch professional:', response.status, errorText);
				setProfileKnowledgeIds([]);
				setProfileKnowledgeVisibility({});
				Alert.alert('Error', `Could not load professional profile: ${response.status}`);
			}
		} catch (err) {
			console.error('❌ Error fetching professional:', err);
			setProfileKnowledgeIds([]);
			setProfileKnowledgeVisibility({});
			Alert.alert('Network Error', 'Could not connect to server. Please check your connection.');
		} finally {
			setLoading(false);
		}
	}, [professional_id, token, fetchSubscribers]);

	// Fetch public knowledge base files for professional
	// (removed duplicate declaration)

	// Fetch knowledge base files (public and subscribers only, exclude private)
	const fetchKnowledgeFiles = React.useCallback(async (profId: string, knownKbIdsOverride?: string[]) => {
		if (!profId) {
			return;
		}

		try {
			setLoadingKnowledge(true);
			const knownKbIds = (knownKbIdsOverride ?? profileKnowledgeIds)
				.map(id => toTrimmedString(id))
				.filter((id): id is string => typeof id === 'string' && id.length > 0);
			const knownKbIdsCount = knownKbIds.length;

			let aggregated: KnowledgeBaseFile[] = [];

			if (knownKbIdsCount) {
				console.log('📘 Attempting per-file knowledge fetch via kb_id list:', knownKbIds);
				aggregated = await fetchKnowledgeFilesByIds(profId, knownKbIds);
				console.log('📘 Retrieved per-file entries:', aggregated.length);
			} else {
				console.log('ℹ️ No kb_id hints available from profile; using list endpoints');
			}

			if (!aggregated.length || aggregated.length < knownKbIdsCount) {
				const fallbackResults = await fetchKnowledgeFilesViaList(profId);
				console.log('📚 Fallback knowledge list results:', fallbackResults.length);
				if (fallbackResults.length) {
					const merged = new Map<string, KnowledgeBaseFile>();
					[...aggregated, ...fallbackResults].forEach(file => {
						if (!file || !file.id) {
							return;
						}
						const existing = merged.get(file.id);
						merged.set(file.id, existing ? { ...existing, ...file } : file);
					});
					aggregated = Array.from(merged.values());
				}
			}

			const applyVisibilityHint = (file: KnowledgeBaseFile): KnowledgeBaseFile => {
				if (!file || !file.id) {
					return file;
				}
				const hint = profileKnowledgeVisibility[file.id];
				if (!hint) {
					return file;
				}
				if (!file.visibility || file.visibility === 'public') {
					if (file.visibility !== hint) {
						return { ...file, visibility: hint };
					}
				}
				return file;
			};

			const withHints = aggregated.map(applyVisibilityHint);
			const deduped = new Map<string, KnowledgeBaseFile>();

			withHints.forEach(file => {
				if (!file || !file.id) {
					return;
				}
				const existing = deduped.get(file.id);
				deduped.set(file.id, existing ? { ...existing, ...file } : file);
			});

			const visibleFiles = Array.from(deduped.values()).filter(file => file.visibility !== 'private');
			const toTimestamp = (value?: string) => {
				if (!value) {
					return 0;
				}
				const ts = new Date(value).getTime();
				return Number.isFinite(ts) ? ts : 0;
			};
			visibleFiles.sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at));

			setKnowledgeFiles(visibleFiles);
			console.log('📂 Visible files (public + subscribers):', visibleFiles.length);
		} catch (error) {
			console.error('❌ Error fetching knowledge files:', error);
			setKnowledgeFiles([]);
		} finally {
			setLoadingKnowledge(false);
		}
	}, [profileKnowledgeIds, profileKnowledgeVisibility, fetchKnowledgeFilesByIds, fetchKnowledgeFilesViaList]);

	const fetchKnowledgeContext = async (query: string) => {
		const targetProfessionalId = professional_id || professional?.professional_id;
		if (!targetProfessionalId || !query || query.trim().length < 3) {
			return [] as Array<{ title: string; content: string }>;
		}

		try {
			const searchParams = new URLSearchParams({
				professional_id: targetProfessionalId,
				query: query.trim(),
			});
			const searchUrl = buildKnowledgeUrl(`/professional/kb/search?${searchParams.toString()}`);
			const headers: Record<string, string> = {
				Accept: 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			};
			console.log('🔎 Searching knowledge for chat context:', searchUrl);

			const response = await fetch(searchUrl, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				console.warn('⚠️ Knowledge search failed with status:', response.status);
				return [] as Array<{ title: string; content: string }>;
			}

			const responseText = await response.text();
			let payload: any = [];
			try {
				payload = responseText ? JSON.parse(responseText) : [];
			} catch (parseError) {
				console.warn('⚠️ Failed to parse knowledge search response, ignoring context', parseError);
				return [] as Array<{ title: string; content: string }>;
			}

			const resolveArray = (value: any): any[] => {
				if (Array.isArray(value)) return value;
				if (Array.isArray(value?.results)) return value.results;
				if (Array.isArray(value?.data)) return value.data;
				if (Array.isArray(value?.items)) return value.items;
				return [];
			};

			const rawResults = resolveArray(payload);
			if (!rawResults.length) {
				console.log('ℹ️ No knowledge matches found for chat context');
				return [] as Array<{ title: string; content: string }>;
			}

			const normalize = rawResults
				.map((item: any) => {
					const title =
						item?.title ||
						item?.metadata?.title ||
						item?.document_title ||
						item?.file_title ||
						'Knowledge Entry';
					const rawContent =
						item?.content ||
						item?.summary ||
						item?.text ||
						item?.body ||
						item?.chunk ||
						item?.excerpt ||
						item?.context ||
						item?.description ||
						'';
					const content = typeof rawContent === 'string' ? rawContent.trim() : '';
					return {
						title,
						content,
					};
				})
				.filter(entry => entry.content);

			console.log('🧠 Retrieved knowledge context entries:', normalize.length);
			return normalize;
		} catch (error) {
			console.error('❌ Error fetching knowledge context for chat:', error);
			return [] as Array<{ title: string; content: string }>;
		}
	};

	// Get file icon based on file type
	// (removed duplicate declaration)

	React.useEffect(() => {
		// 🔧 FIX: Only fetch once on mount or when deps change
		fetchProfessional();
	}, [fetchProfessional]);

	React.useEffect(() => {
		if (typeof subscriberCount !== 'number') {
			return;
		}
		setProfessional(prev => {
			if (!prev || prev.subscriber_count === subscriberCount) {
				return prev;
			}
			return { ...prev, subscriber_count: subscriberCount };
		});
	}, [subscriberCount]);

	React.useEffect(() => {
		if (hasSubscription) {
			if (!subscriptionSuccess) {
				setSubscriptionSuccess('You are subscribed to this professional.');
			}
			setSubscriptionError(null);
		}
	}, [hasSubscription, subscriptionSuccess]);

	const professionalIdFromProfile = professional?.professional_id;

	// Fetch knowledge files when professional is available
	React.useEffect(() => {
		const targetProfessionalId = professional_id || professionalIdFromProfile;
		if (targetProfessionalId) {
			fetchKnowledgeFiles(targetProfessionalId, profileKnowledgeIds);
		}
	}, [professional_id, professionalIdFromProfile, profileKnowledgeIds, profileKnowledgeVisibility, fetchKnowledgeFiles]);

	// Book Session tab states
	const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
	const [selectedDateString, setSelectedDateString] = useState<string>('');

	// Fetch available slots when date is selected
	const fetchAvailableSlots = async (dateStr: string) => {
		if (!professional_id) return;
		setFetchingSlots(true);
		const backendUrl = `http://dev.api.uyir.ai:8081/professionals/${professional_id}/sessions/available`;

		try {
			const response = await fetch(backendUrl, {
				headers: {
					'Authorization': token ? `Bearer ${token}` : '',
				},
			});
			if (response.ok) {
				const data = await response.json();
				console.log('📅 Available slots data:', JSON.stringify(data, null, 2));
				// Filter slots: not booked AND matching selected date
				const allSlots = Array.isArray(data) ? data : (data.slots || []);
				console.log(`📊 Total slots received: ${allSlots.length}`);

				const dateOnlyStr = dateStr.split('T')[0]; // Get YYYY-MM-DD part
				console.log(`🗓️ Filtering for date: ${dateOnlyStr}`);

				const filteredSlots = allSlots.filter((s: AvailabilitySlot) => {
					const slotDate = s.start_time.split('T')[0];
					const isNotBooked = !s.is_booked;
					const matchesDate = slotDate === dateOnlyStr;

					// Log each slot for debugging
					console.log(`🔍 Slot: ${s.start_time}, Booked: ${s.is_booked}, Date Match: ${matchesDate}, is_available: ${s.is_available}, status: ${s.status}`);

					// Show all slots that are not booked and match the selected date
					const shouldShow = isNotBooked && matchesDate;
					if (matchesDate && !shouldShow) {
						console.log(`❌ Filtered out slot: ${s.start_time} - already booked`);
					}

					return shouldShow;
				});
				console.log(`✅ Found ${filteredSlots.length} available slots for ${dateStr} (filtered from ${allSlots.length} total)`);
				console.log('📋 Filtered slots:', JSON.stringify(filteredSlots, null, 2));
				setAvailableSlots(filteredSlots);
			} else {
				console.error('Failed to fetch slots:', response.status);
				setAvailableSlots([]);
			}
		} catch (err) {
			console.error('Error fetching availability:', err);
			setAvailableSlots([]);
		} finally {
			setFetchingSlots(false);
		}
	};

	// Book a session
	const handleBookSession = async () => {
		if (!selectedSlot || !token) {
			Alert.alert('Error', 'Please select a slot and ensure you are logged in');
			return;
		}

		if (!professional_id) {
			Alert.alert('Error', 'Professional ID is missing');
			return;
		}

		setBookingSlot(true);
		const backendUrl = `http://dev.api.uyir.ai:8081/professionals/${professional_id}/sessions`;

		try {
			const requestBody = {
				professional_id: professional_id,
				slot_id: selectedSlot.slot_id,
				booking_notes: null,
			};

			console.log('📤 Booking request:', JSON.stringify(requestBody, null, 2));

			const response = await fetch(backendUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			console.log('📥 Booking response status:', response.status);
			const data = await response.json();
			console.log('📥 Booking response data:', JSON.stringify(data, null, 2));

			if (response.ok) {
				Alert.alert('Success!', 'Session booked successfully!', [
					{
						text: 'View My Sessions',
						onPress: () => navigation.navigate('UpComingUserSessions' as any),
					},
					{
						text: 'OK',
						style: 'cancel',
					}
				]);
				// Clear selection
				setSelectedSlot(null);
				// Refresh slots
				if (selectedDateString) {
					fetchAvailableSlots(selectedDateString);
				}
			} else {
				Alert.alert('Booking Failed', data.detail || 'Failed to book session');
			}
		} catch (err) {
			console.error('Error booking session:', err);
			Alert.alert('Network Error', 'Could not connect to backend');
		} finally {
			setBookingSlot(false);
		}
	};

	// Get file icon based on file type
	const getFileIcon = (fileType: string) => {
		const type = fileType.toLowerCase();
		if (type.includes('image') || type.includes('photo')) return 'image-outline';
		if (type.includes('video')) return 'videocam-outline';
		if (type.includes('audio')) return 'mic-outline';
		return 'document-outline';
	};

	// Format time from ISO string
	const formatTime = (isoString: string) => {
		const date = new Date(isoString);
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	};

	const updateChatMessage = (messageId: string, transformer: (message: ChatMessage) => ChatMessage) => {
		setChatMessages(prev => prev.map(message => (message.id === messageId ? transformer(message) : message)));
	};

	const registerVideoResponseText = React.useCallback(
		(messageId: string, fullText: string | null | undefined, options?: { immediate?: boolean }) => {
			const text = typeof fullText === 'string' ? fullText : '';
			if (!text) {
				return;
			}
			const activeTimer = animationTimersRef.current[messageId];
			if (activeTimer) {
				clearInterval(activeTimer);
				delete animationTimersRef.current[messageId];
			}
			if (options?.immediate) {
				animationStartedRef.current[messageId] = true;
				setVideoMessageAnimations(prev => ({
					...prev,
					[messageId]: {
						full: text,
						displayed: text,
						status: 'done' as const,
					},
				}));
				return;
			}

			const existingEntry = videoMessageAnimationsRef.current[messageId];
			if (existingEntry && existingEntry.full === text) {
				if (existingEntry.status === 'done') {
					animationStartedRef.current[messageId] = true;
					return;
				}
				if (existingEntry.status === 'animating') {
					return;
				}
			}

			animationStartedRef.current[messageId] = false;
			setVideoMessageAnimations(prev => {
				const existing = prev[messageId];
				if (existing && existing.full === text && existing.status === 'done') {
					return prev;
				}
				return {
					...prev,
					[messageId]: {
						full: text,
						displayed: existing?.status === 'done' && existing.full === text ? text : '',
						status: existing?.status === 'done' && existing.full === text ? ('done' as const) : ('idle' as const),
					},
				};
			});
		},
		[],
	);

	const startVideoResponseAnimation = React.useCallback(
		(messageId: string) => {
			const entry = videoMessageAnimationsRef.current[messageId];
			if (!entry || !entry.full) {
				return;
			}
			if (entry.status === 'animating' || entry.status === 'done') {
				animationStartedRef.current[messageId] = true;
				return;
			}

			const fullText = entry.full;
			let index = 0;

			animationStartedRef.current[messageId] = true;
			setVideoMessageAnimations(prev => ({
				...prev,
				[messageId]: {
					full: fullText,
					displayed: '',
					status: 'animating' as const,
				},
			}));

			const step = () => {
				index += 1;
				setVideoMessageAnimations(prev => {
					const current = prev[messageId];
					if (!current) {
						return prev;
					}
					if (index >= fullText.length) {
						const next = {
							full: fullText,
							displayed: fullText,
							status: 'done' as const,
						};
						const updated = { ...prev, [messageId]: next };
						const timer = animationTimersRef.current[messageId];
						if (timer) {
							clearInterval(timer);
							delete animationTimersRef.current[messageId];
						}
						return updated;
					}
					return {
						...prev,
						[messageId]: {
							full: fullText,
							displayed: fullText.slice(0, index),
							status: 'animating' as const,
						},
					};
				});
			};

			step();
			const timer = setInterval(step, 35);
			animationTimersRef.current[messageId] = timer;
		},
		[],
	);

	// Chat message typing animation functions
	const startChatMessageAnimation = React.useCallback(
		(messageId: string, fullText: string) => {
			if (!fullText) {
				return;
			}

			// Clear any existing timer for this message
			const existingTimer = animationTimersRef.current[`chat-${messageId}`];
			if (existingTimer) {
				clearInterval(existingTimer);
				delete animationTimersRef.current[`chat-${messageId}`];
			}

			let index = 0;
			setChatMessageAnimations(prev => ({
				...prev,
				[messageId]: {
					full: fullText,
					displayed: '',
					status: 'animating' as const,
				},
			}));

			const step = () => {
				index += 1;
				setChatMessageAnimations(prev => {
					const current = prev[messageId];
					if (!current) {
						return prev;
					}
					if (index >= fullText.length) {
						const next = {
							full: fullText,
							displayed: fullText,
							status: 'done' as const,
						};
						const timer = animationTimersRef.current[`chat-${messageId}`];
						if (timer) {
							clearInterval(timer);
							delete animationTimersRef.current[`chat-${messageId}`];
						}
						return { ...prev, [messageId]: next };
					}
					return {
						...prev,
						[messageId]: {
							full: fullText,
							displayed: fullText.slice(0, index),
							status: 'animating' as const,
						},
					};
				});
			};

			step();
			const timer = setInterval(step, 25); // Slightly faster for chat
			animationTimersRef.current[`chat-${messageId}`] = timer;
		},
		[],
	);

	React.useEffect(() => {
		startChatMessageAnimationRef.current = startChatMessageAnimation;
	}, [startChatMessageAnimation]);

	const ensureAnimationStartedForCurrentMessage = React.useCallback(() => {
		const activeMessageId = currentVideoMessageIdRef.current;
		if (!activeMessageId) {
			return;
		}
		if (animationStartedRef.current[activeMessageId]) {
			return;
		}
		const entry = videoMessageAnimationsRef.current[activeMessageId];
		if (!entry || !entry.full) {
			return;
		}
		startVideoResponseAnimation(activeMessageId);
	}, [startVideoResponseAnimation]);

	const applyMuteStateToWebView = React.useCallback((muted: boolean) => {
		if (!webViewRef.current || typeof webViewRef.current.injectJavaScript !== 'function') {
			return;
		}
		const script = `(() => {
			const video = document.querySelector('video');
			if (video) {
				video.muted = ${muted ? 'true' : 'false'};
				video.volume = ${muted ? '0' : '1'};
			}
		})(); true;`;
		webViewRef.current.injectJavaScript(script);
	}, []);

	const toggleVideoMute = React.useCallback(() => {
		setIsVideoMuted(prev => !prev);
	}, []);

	const handleReloadVideo = React.useCallback(() => {
		const activeMessageId = currentVideoMessageIdRef.current;
		if (hasNativePlaybackUrl && nativePlaybackUrl) {
			setVideoReloadToken(prev => prev + 1);
			setVideoPlaybackError(null);
			if (activeMessageId) {
				animationStartedRef.current[activeMessageId] = false;
			}
			return;
		}
		if (webViewPlaybackUrl) {
			if (webViewRef.current && typeof webViewRef.current.reload === 'function') {
				webViewRef.current.reload();
			}
			setWebViewReloadToken(prev => prev + 1);
			setVideoPlaybackError(null);
			if (activeMessageId) {
				animationStartedRef.current[activeMessageId] = false;
			}
		}
	}, [hasNativePlaybackUrl, nativePlaybackUrl, webViewPlaybackUrl]);

	const markVideoReadyForPlayback = React.useCallback(() => {
		console.log('🎬 markVideoReadyForPlayback called - hiding loading overlay');
		setIsGeneratingVideo(false);
		setVideoGenerationProgress(prev => (prev === null || prev < 100 ? 100 : prev));
		setVideoStatus('completed');
		setVideoStatusRaw('completed');
	}, []);

	// For native video - only called on actual playback progress, not on load
	const handleVideoReady = React.useCallback((_event?: unknown) => {
		console.log('📹 Native video onLoad/onReadyForDisplay fired');
		// Don't hide overlay here - wait for onProgress which indicates actual playback
	}, []);

	const handleHostedVideoReady = React.useCallback((_event?: unknown) => {
		console.log('🌐 WebView onLoadEnd fired');
		// For WebView, we can't easily detect video playback, so use a short delay
		// to allow the video to start before hiding the overlay
		setTimeout(() => {
			console.log('🌐 WebView timeout - hiding loading overlay');
			markVideoReadyForPlayback();
			ensureAnimationStartedForCurrentMessage();
			applyMuteStateToWebView(isVideoMuted);
		}, 1500); // 1.5 second delay to let video start
	}, [markVideoReadyForPlayback, ensureAnimationStartedForCurrentMessage, applyMuteStateToWebView, isVideoMuted]);

	const handleVideoProgress = React.useCallback((_event?: unknown) => {
		// Video is actually playing - hide loading overlay now
		if (isGeneratingVideo) {
			console.log('▶️ Native video onProgress fired - video is playing');
			markVideoReadyForPlayback();
		}
		ensureAnimationStartedForCurrentMessage();
	}, [isGeneratingVideo, markVideoReadyForPlayback, ensureAnimationStartedForCurrentMessage]);

	React.useEffect(() => {
		chatMessagesRef.current = chatMessages;
	}, [chatMessages]);

	React.useEffect(() => {
		videoMessageAnimationsRef.current = videoMessageAnimations;
	}, [videoMessageAnimations]);

	React.useEffect(() => {
		chatMessageAnimationsRef.current = chatMessageAnimations;
	}, [chatMessageAnimations]);

	React.useEffect(() => {
		currentVideoMessageIdRef.current = currentVideoMessageId;
	}, [currentVideoMessageId]);

	React.useEffect(() => {
		if (!webViewPlaybackUrl) {
			webViewRef.current = null;
		}
	}, [webViewPlaybackUrl]);

	React.useEffect(() => {
		setIsVideoMuted(false);
	}, [currentVideoMessageId]);

	React.useEffect(() => {
		applyMuteStateToWebView(isVideoMuted);
	}, [isVideoMuted, applyMuteStateToWebView]);

	// Debug: Log when isGeneratingVideo changes
	React.useEffect(() => {
		console.log('🔄 isGeneratingVideo changed to:', isGeneratingVideo);
	}, [isGeneratingVideo]);

	// Debug: Log video playback sources changes
	React.useEffect(() => {
		console.log('🔄 videoPlaybackSources changed:', JSON.stringify(videoPlaybackSources));
		console.log('🔄 hasNativePlaybackUrl:', hasNativePlaybackUrl, 'webViewPlaybackUrl:', webViewPlaybackUrl);
	}, [videoPlaybackSources, hasNativePlaybackUrl, webViewPlaybackUrl]);

	React.useEffect(() => {
		if (!currentVideoMessageId) {
			return;
		}
		if (hasNativePlaybackUrl) {
			return;
		}
		if (isGeneratingVideo) {
			return;
		}
		if (videoStatus !== 'completed') {
			return;
		}
		ensureAnimationStartedForCurrentMessage();
	}, [currentVideoMessageId, hasNativePlaybackUrl, isGeneratingVideo, videoStatus, videoMessageAnimations, ensureAnimationStartedForCurrentMessage]);

	React.useEffect(() => {
		return () => {
			Object.values(animationTimersRef.current).forEach(timer => {
				if (timer) {
					clearInterval(timer);
				}
			});
			animationTimersRef.current = {};
		};
	}, []);

	// Handle date selection from calendar
	const handleCalendarDateSelect = (day: any) => {
		const dateStr = day.dateString; // YYYY-MM-DD format
		setSelectedDateString(dateStr);
		fetchAvailableSlots(dateStr);
	};

	// 🎥 Generate video response
	const generateVideoForMessage = async (userMessage: string, messageId: string) => {
		const targetProfessionalId = professional_id || professional?.professional_id;
		if (!targetProfessionalId) {
			console.error('❌ Unable to resolve professional id for video chat');
			setVideoStatus('failed');
			setVideoStatusRaw('failed');
			setVideoGenerationProgress(null);
			const failure = 'Sorry, video isn\'t available right now.';
			updateChatMessage(messageId, msg => {
				const next: ChatMessage = {
					...msg,
					videoResponseText: failure,
				};
				if (msg.context === 'live') {
					next.text = failure;
				}
				return next;
			});
			registerVideoResponseText(messageId, failure, { immediate: true });
			return;
		}

		try {
			resetVideoPlaybackState();
			setIsGeneratingVideo(true);
			setVideoStatus('pending');
			setVideoStatusRaw('pending');
			setVideoGenerationProgress(0);

			const endpoint = buildUrl(`/professionals/${encodeURIComponent(targetProfessionalId)}/video_chat/create`);
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			console.log('🎬 Requesting Tavus video via backend:', endpoint);

			const response = await fetch(endpoint, {
				method: 'POST',
				headers,
				body: JSON.stringify({ message: userMessage }),
			});
			const rawBody = await response.text();

			if (!response.ok) {
				console.error('❌ Video chat endpoint failed:', response.status, rawBody);
				throw new Error(`Video chat endpoint failed with status ${response.status}`);
			}

			let payload: any = {};
			if (rawBody) {
				try {
					payload = JSON.parse(rawBody);
				} catch (parseError) {
					console.warn('⚠️ Could not parse video chat response JSON, using raw payload');
					payload = {};
				}
			}

			const tavusPayload = payload?.tavus_response ?? payload ?? {};
			const rawStatus = typeof tavusPayload?.status === 'string' ? tavusPayload.status.toLowerCase() : '';
			const normalizedStatus: 'pending' | 'processing' | 'completed' | 'failed' =
				rawStatus === 'completed' || rawStatus === 'ready'
					? 'completed'
					: rawStatus === 'failed'
						? 'failed'
						: rawStatus === 'pending'
							? 'pending'
							: 'processing';

			setVideoStatus(normalizedStatus);
			setVideoStatusRaw(rawStatus || null);

			const initialResponseText = extractVideoResponseText(tavusPayload);
			if (initialResponseText) {
				updateChatMessage(messageId, msg => {
					const next: ChatMessage = {
						...msg,
						videoResponseText: initialResponseText,
					};
					if (msg.context === 'live') {
						next.text = initialResponseText;
					}
					return next;
				});
				registerVideoResponseText(messageId, initialResponseText);
			}

			const initialProgress = extractVideoGenerationProgress(tavusPayload);
			if (initialProgress !== null) {
				setVideoGenerationProgress(initialProgress);
			} else if (normalizedStatus === 'completed') {
				setVideoGenerationProgress(100);
			} else if (normalizedStatus === 'pending' || normalizedStatus === 'processing') {
				setVideoGenerationProgress(prev => (prev === null ? 0 : prev));
			}

			const playbackHints = resolveVideoPlaybackUrls(tavusPayload);
			const videoId = toTrimmedString(tavusPayload?.video_id);
			const nextSources = updateVideoPlaybackSources(playbackHints, { replace: true });
			const immediateUrl = nextSources.stream ?? nextSources.download ?? nextSources.hosted ?? null;

			if (videoId) {
				console.log('✅ Tavus video request queued:', videoId, 'status:', normalizedStatus, 'url:', immediateUrl);
				startVideoPolling(videoId, messageId, nextSources, targetProfessionalId);
			} else if (immediateUrl) {
				console.log('✅ Tavus video ready immediately at:', immediateUrl);
				setVideoStatus('completed');
				setVideoStatusRaw('completed');
				setVideoGenerationProgress(100);
				setCurrentVideoMessageId(messageId);
				animationStartedRef.current[messageId] = false;
				updateChatMessage(messageId, msg => {
					const next: ChatMessage = {
						...msg,
						videoUrl: immediateUrl,
						videoId: msg.videoId ?? videoId,
						videoResponseText: initialResponseText ?? msg.videoResponseText ?? null,
					};
					if (msg.context === 'live' && initialResponseText) {
						next.text = initialResponseText;
					}
					return next;
				});
				if (initialResponseText) {
					registerVideoResponseText(messageId, initialResponseText);
				}
			} else {
				throw new Error('Video chat response missing identifiers');
			}
		} catch (error) {
			console.error('❌ Failed to generate video via backend:', error);
			setIsGeneratingVideo(false);
			setVideoStatus('failed');
			setVideoStatusRaw('failed');
			setVideoGenerationProgress(null);
			setVideoPlaybackError('Sorry, I could not generate a video response. Please try again.');
			const failure = 'Sorry, I could not generate a video response. Please try again.';
			updateChatMessage(messageId, msg => {
				const next: ChatMessage = {
					...msg,
					videoResponseText: failure,
					videoUrl: undefined,
				};
				if (msg.context === 'live') {
					next.text = failure;
				}
				return next;
			});
			registerVideoResponseText(messageId, failure, { immediate: true });
			setCurrentVideoMessageId(null);
		}
	};

	const fetchVideoStatusFromBackend = async (professionalId: string, videoId: string) => {
		const statusEndpoint = buildUrl(
			`/professionals/${encodeURIComponent(professionalId)}/video_chat/status/${encodeURIComponent(videoId)}`,
		);
		const headers: Record<string, string> = {
			Accept: 'application/json',
		};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const response = await fetch(statusEndpoint, { headers, method: 'GET' });
		const rawBody = await response.text();

		if (!response.ok) {
			console.error('❌ Video status endpoint failed:', response.status, rawBody);
			throw new Error(`Video status endpoint failed with status ${response.status}`);
		}

		let payload: any = {};
		if (rawBody) {
			try {
				payload = JSON.parse(rawBody);
			} catch (parseError) {
				console.warn('⚠️ Could not parse video status response JSON, using raw payload');
				payload = {};
			}
		}

		return payload?.tavus_response ?? payload ?? {};
	};

	// Poll video status until completed
	const startVideoPolling = (
		videoId: string,
		messageId: string,
		initialSources: VideoPlaybackSources | null,
		professionalId: string,
	) => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}

		let lastKnownSources = initialSources ?? { stream: null, download: null, hosted: null };
		const initialPrimaryUrl = lastKnownSources.stream ?? lastKnownSources.download ?? lastKnownSources.hosted ?? null;
		pollingErrorCountRef.current = 0;
		setCurrentVideoMessageId(messageId);
		animationStartedRef.current[messageId] = false;

		pollingIntervalRef.current = setInterval(async () => {
			try {
				const tavusPayload = await fetchVideoStatusFromBackend(professionalId, videoId);
				const rawStatus = typeof tavusPayload?.status === 'string' ? tavusPayload.status.toLowerCase() : '';
				const normalizedStatus: 'pending' | 'processing' | 'completed' | 'failed' =
					rawStatus === 'completed' || rawStatus === 'ready'
						? 'completed'
						: rawStatus === 'failed'
							? 'failed'
							: rawStatus === 'pending'
								? 'pending'
								: 'processing';

				setVideoStatus(normalizedStatus);
				setVideoStatusRaw(rawStatus || null);
				pollingErrorCountRef.current = 0;

				console.log('📊 Video status (backend):', rawStatus || normalizedStatus);

				const resolvedSources = resolveVideoPlaybackUrls(tavusPayload);
				const mergedSources = updateVideoPlaybackSources(resolvedSources);
				lastKnownSources = mergedSources;
				const resolvedVideoUrl = mergedSources.stream ?? mergedSources.download ?? mergedSources.hosted ?? initialPrimaryUrl;
				const progress = extractVideoGenerationProgress(tavusPayload);
				if (progress !== null) {
					setVideoGenerationProgress(progress);
				} else if (normalizedStatus === 'completed') {
					setVideoGenerationProgress(prev => (prev === null || prev < 100 ? 100 : prev));
				}

				const responseText = extractVideoResponseText(tavusPayload);
				if (responseText) {
					updateChatMessage(messageId, msg => {
						const next: ChatMessage = {
							...msg,
							videoResponseText: responseText,
						};
						if (msg.context === 'live') {
							next.text = responseText;
						}
						return next;
					});
					registerVideoResponseText(messageId, responseText);
				}

				if (normalizedStatus === 'completed' && resolvedVideoUrl) {
					setVideoGenerationProgress(prev => (prev === null || prev < 100 ? 100 : prev));

					// Update the AI message with video URL
					updateChatMessage(messageId, msg => {
						const next: ChatMessage = {
							...msg,
							videoUrl: resolvedVideoUrl,
							videoId: toTrimmedString(tavusPayload?.video_id) ?? msg.videoId,
							videoResponseText: responseText ?? msg.videoResponseText ?? null,
						};
						if (msg.context === 'live' && responseText) {
							next.text = responseText;
						}
						return next;
					});
					if (responseText) {
						registerVideoResponseText(messageId, responseText);
					}

					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					console.log('✅ Video ready:', resolvedVideoUrl);
				} else if (normalizedStatus === 'completed') {
					const fallbackUrl = lastKnownSources.stream || lastKnownSources.download || lastKnownSources.hosted || initialPrimaryUrl;

					if (fallbackUrl) {
						setVideoGenerationProgress(prev => (prev === null || prev < 100 ? 100 : prev));
						setVideoPlaybackError(null);

						updateChatMessage(messageId, msg => {
							const next: ChatMessage = {
								...msg,
								videoUrl: fallbackUrl,
								videoId: toTrimmedString(tavusPayload?.video_id) ?? msg.videoId,
								videoResponseText: responseText ?? msg.videoResponseText ?? null,
							};
							if (msg.context === 'live' && responseText) {
								next.text = responseText;
							}
							return next;
						});
						if (responseText) {
							registerVideoResponseText(messageId, responseText);
						}

						if (pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
						}
						console.log('✅ Video ready (fallback source retained):', fallbackUrl);
					} else {
						setIsGeneratingVideo(false);
						setVideoStatusRaw(rawStatus || 'completed');
						setVideoPlaybackError('Video generated, but no playback URL was returned. Please try again later.');
						setVideoGenerationProgress(prev => (prev === null || prev < 100 ? 100 : prev));

						updateChatMessage(messageId, msg => {
							const preservedScript = responseText ?? msg.videoResponseText ?? msg.text;
							const next: ChatMessage = {
								...msg,
								videoUrl: undefined,
								videoResponseText: preservedScript,
							};
							if (msg.context === 'live') {
								next.text = preservedScript ?? msg.text;
							}
							return next;
						});
						if (responseText) {
							registerVideoResponseText(messageId, responseText, { immediate: true });
						}
						setCurrentVideoMessageId(null);

						if (pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
						}
						console.warn('⚠️ Video marked completed but missing URL');
					}
				} else if (normalizedStatus === 'failed') {
					setIsGeneratingVideo(false);
					setVideoStatusRaw(rawStatus || 'failed');
					const cleared = updateVideoPlaybackSources({ stream: null, download: null, hosted: null }, { replace: true });
					lastKnownSources = cleared;
					setVideoPlaybackError('Video generation failed. Please try again.');
					setVideoGenerationProgress(null);

					// Update the AI message to show error
					const failure = 'Video generation failed. Please try again.';
					updateChatMessage(messageId, msg => {
						const next: ChatMessage = {
							...msg,
							videoResponseText: failure,
							videoUrl: undefined,
						};
						if (msg.context === 'live') {
							next.text = failure;
						}
						return next;
					});
					registerVideoResponseText(messageId, failure, { immediate: true });
					setCurrentVideoMessageId(null);

					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					console.error('❌ Video generation failed');
				}
			} catch (error) {
				pollingErrorCountRef.current += 1;
				console.error('❌ Failed to check video status via backend:', error);
				if (pollingErrorCountRef.current >= 3 || `${error}`.includes('status 400')) {
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					setIsGeneratingVideo(false);
					setVideoStatus('failed');
					setVideoStatusRaw('failed');
					if (!initialPrimaryUrl && !(lastKnownSources.stream || lastKnownSources.download || lastKnownSources.hosted)) {
						const failure = 'Video status check failed. Please try again later.';
						updateChatMessage(messageId, msg => {
							const next: ChatMessage = {
								...msg,
								videoResponseText: failure,
								videoUrl: undefined,
							};
							if (msg.context === 'live') {
								next.text = failure;
							}
							return next;
						});
						registerVideoResponseText(messageId, failure, { immediate: true });
						setVideoPlaybackError('Unable to retrieve video status. Please try again later.');
					}
					setCurrentVideoMessageId(null);
					setVideoGenerationProgress(null);
				}
			}
		}, 5000); // Poll every 5 seconds
	};

	// Handle sending chat message in Twin Window
	const handleSendChatMessage = async () => {
		const trimmedMessage = chatInput.trim();
		if (!trimmedMessage) {
			return;
		}

		if (!professional_id) {
			Alert.alert('Missing professional', 'Unable to find this professional at the moment.');
			return;
		}

		const timestamp = Date.now();
		const userMessageId = `user-${timestamp}`;
		const aiMessageId = `ai-${timestamp}`;
		const now = new Date();

		setChatMessages(prev => ([
			...prev,
			{
				id: userMessageId,
				text: trimmedMessage,
				isUser: true,
				timestamp: now,
				videoResponseText: null,
				context: 'chat',
			},
			{
				id: aiMessageId,
				text: 'Thinking...',
				isUser: false,
				timestamp: now,
				videoResponseText: null,
				context: 'chat',
			},
		]));

		setChatInput('');

		// Auto-scroll to bottom once messages render
		requestAnimationFrame(() => {
			setTimeout(() => {
				chatScrollRef.current?.scrollToEnd({ animated: true });
			}, 80);
		});

		const replaceAiMessage = (nextText: string) => {
			// Store the full text in the message but start with empty display
			setChatMessages(prev =>
				prev.map(message =>
					message.id === aiMessageId
						? { ...message, text: nextText }
						: message
				)
			);
			// Start the typing animation for this message
			startChatMessageAnimation(aiMessageId, nextText);
		};

		try {
			const apiBaseUrl = 'http://dev.api.uyir.ai';
			console.log('💬 Sending chat message to professional:', professional_id, trimmedMessage);
			const knowledgeContext = await fetchKnowledgeContext(trimmedMessage);
			let outboundMessage = trimmedMessage;
			if (knowledgeContext.length) {
				const summarizedContext = knowledgeContext
					.slice(0, 3)
					.map((entry, index) => {
						const cleanSnippet = entry.content.replace(/\s+/g, ' ').trim();
						const truncatedSnippet = cleanSnippet.length > 400 ? `${cleanSnippet.slice(0, 400)}...` : cleanSnippet;
						return `${index + 1}. ${entry.title}: ${truncatedSnippet}`;
					})
					.join('\n');
				outboundMessage = `Use the following professional knowledge when answering.\n${summarizedContext}\n\nQuestion: ${trimmedMessage}`;
				console.log('🧩 Injected knowledge context into chat request');
			}

			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				'Accept': 'application/json, text/plain;q=0.9, */*;q=0.8',
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(
				`${apiBaseUrl}/professionals/${professional_id}/chat/message`,
				{
					method: 'POST',
					headers,
					body: JSON.stringify({
						message: outboundMessage,
					}),
				}
			);

			const rawBody = await response.text();
			const contentType = response.headers.get('content-type') || '';

			if (response.ok) {
				let resolvedText: string = rawBody;

				if (contentType.includes('application/json')) {
					try {
						const jsonBody = rawBody ? JSON.parse(rawBody) : {};
						resolvedText = typeof jsonBody === 'string'
							? jsonBody
							: jsonBody?.response || jsonBody?.message || jsonBody?.data || rawBody;
					} catch (parseError) {
						console.warn('⚠️ Failed to parse chat JSON response, falling back to raw text', parseError);
					}
				}

				resolvedText = (resolvedText || '').toString().trim() || 'Response received';
				console.log('✅ Chat response received:', resolvedText);

				replaceAiMessage(resolvedText);

				if (professional?.replica_id) {
					console.log('🎥 Also generating video response...');
					generateVideoForMessage(trimmedMessage, aiMessageId);
				}
			} else {
				console.error('❌ Chat API failed:', response.status, rawBody);
				replaceAiMessage('Sorry, I could not respond right now. Please try again.');
			}
		} catch (error) {
			console.error('❌ Chat error:', error);
			replaceAiMessage('Network error. Please check your connection and try again.');
		}
	};

	// Voice recording functions
	const requestAudioPermission = async (): Promise<boolean> => {
		if (Platform.OS === 'android') {
			try {
				const grants = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
				]);
				return grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
			} catch (err) {
				console.warn('Audio permission error:', err);
				return false;
			}
		}
		return true; // iOS handles permissions automatically
	};

	// Handle mic press for chat mode (text response)
	const handleChatMicPress = async () => {
		if (isRecording) {
			await stopVoiceRecording();
		} else {
			await startVoiceRecording();
		}
	};

	// Video chat voice recording - uses different endpoint
	const [isVideoRecording, setIsVideoRecording] = useState(false);
	const videoRecordingPathRef = useRef<string | null>(null);

	const startVideoVoiceRecording = async () => {
		const hasPermission = await requestAudioPermission();
		if (!hasPermission) {
			Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
			return;
		}

		try {
			const audioRecorder = getAudioRecorder();
			const timestamp = Date.now();
			const fileName = `video_voice_${timestamp}.mp3`;
			const cacheDir = RNFS.fs.dirs.CacheDir;
			const filePath = `${cacheDir}/${fileName}`;

			videoRecordingPathRef.current = filePath;

			console.log('🎙️ Starting VIDEO voice recording at:', filePath);

			await audioRecorder.startRecorder(filePath, audioRecordingConfig);
			setIsVideoRecording(true);

			audioRecorder.addRecordBackListener((e: { currentPosition: number }) => {
				console.log('🎙️ Video recording...', e.currentPosition);
			});
		} catch (error) {
			console.error('❌ Failed to start video voice recording:', error);
			Alert.alert('Recording Error', 'Failed to start voice recording. Please try again.');
		}
	};

	const stopVideoVoiceRecording = async () => {
		try {
			const audioRecorder = getAudioRecorder();
			const result = await audioRecorder.stopRecorder();
			audioRecorder.removeRecordBackListener();
			setIsVideoRecording(false);

			console.log('🎙️ Video recording stopped:', result);

			if (videoRecordingPathRef.current) {
				await sendVideoVoiceMessage(videoRecordingPathRef.current);
			}
		} catch (error) {
			console.error('❌ Failed to stop video voice recording:', error);
			setIsVideoRecording(false);
			Alert.alert('Recording Error', 'Failed to stop voice recording.');
		}
	};

	const sendVideoVoiceMessage = async (audioFilePath: string) => {
		if (!professional_id) {
			Alert.alert('Error', 'Professional ID not found.');
			return;
		}

		setIsProcessingVoice(true);

		const timestamp = Date.now();
		const userMessageId = `live-user-voice-${timestamp}`;
		const aiMessageId = `live-ai-voice-${timestamp}`;
		const now = new Date();

		// Add user's voice message indicator to chat (will be updated with transcript)
		setChatMessages(prev => ([
			...prev,
			{
				id: userMessageId,
				text: '🎙️ Processing voice...',
				isUser: true,
				timestamp: now,
				videoResponseText: null,
				context: 'live' as const,
			},
			{
				id: aiMessageId,
				text: '',
				isUser: false,
				timestamp: now,
				videoResponseText: null,
				context: 'live' as const,
			},
		]));

		// Scroll to bottom
		requestAnimationFrame(() => {
			setTimeout(() => {
				chatScrollRef.current?.scrollToEnd({ animated: true });
			}, 80);
		});

		try {
			const apiBaseUrl = 'http://dev.api.uyir.ai';
			const endpoint = `${apiBaseUrl}/professionals/${professional_id}/video_chat/voice`;

			console.log('🎙️ Sending VIDEO voice message to:', endpoint);

			const formData = new FormData();
			formData.append('audio_file', {
				uri: Platform.OS === 'android' ? `file://${audioFilePath}` : audioFilePath,
				type: 'audio/mpeg',
				name: 'voice_message.mp3',
			} as any);

			const headers: Record<string, string> = {
				'Accept': 'application/json',
			};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				headers,
				body: formData,
			});

			const rawBody = await response.text();
			console.log('🎙️ Video Voice API response:', response.status, rawBody);

			if (response.ok) {
				try {
					const jsonBody = JSON.parse(rawBody);
					// Response format: { transcript, script_used, tavus_response: { status, video_id, hosted_url, ... } }
					const transcript = jsonBody?.transcript || '';
					const scriptUsed = jsonBody?.script_used || '';
					const tavusResponse = jsonBody?.tavus_response;

					console.log('✅ Video voice response - transcript:', transcript);
					console.log('✅ Video voice response - script:', scriptUsed);
					console.log('✅ Video voice response - tavus:', tavusResponse);

					// Update both user message with transcript and AI message with script text
					const userDisplayText = transcript || '🎙️ Voice message';
					const aiDisplayText = scriptUsed || transcript || 'Processing your voice message...';

					setChatMessages(prev =>
						prev.map(message => {
							if (message.id === userMessageId) {
								return { ...message, text: userDisplayText };
							}
							if (message.id === aiMessageId) {
								return { ...message, text: aiDisplayText, videoResponseText: scriptUsed };
							}
							return message;
						})
					);

					// If we have a tavus response, start polling for video
					if (tavusResponse?.video_id) {
						const videoId = tavusResponse.video_id;
						const hostedUrl = tavusResponse.hosted_url;

						console.log('🎥 Starting video generation polling for voice message, video_id:', videoId);

						// Store video info and start polling
						const initialSources: VideoPlaybackSources = {
							stream: null,
							download: null,
							hosted: hostedUrl || null,
						};

						if (hostedUrl) {
							updateVideoPlaybackSources({ hosted: hostedUrl });
						}
						setIsGeneratingVideo(true);
						setVideoGenerationProgress(0);

						// Start polling for video status
						startVideoPolling(videoId, aiMessageId, initialSources, professional_id);
					}
				} catch (parseError) {
					console.warn('⚠️ Failed to parse video voice response:', parseError);
					setChatMessages(prev =>
						prev.map(message =>
							message.id === aiMessageId
								? { ...message, text: 'Voice message received' }
								: message
						)
					);
				}
			} else {
				console.error('❌ Video Voice API failed:', response.status, rawBody);

				// Handle different error types with user-friendly messages
				let errorMessage = 'Sorry, I could not process your voice message. Please try again.';
				if (response.status === 500 || response.status === 502) {
					try {
						const errorData = JSON.parse(rawBody);
						if (errorData?.detail?.includes('ElevenLabs transcript polling failed') ||
							errorData?.detail?.includes('Transcript not ready')) {
							errorMessage = 'Speech service is busy, please try again';
						}
					} catch {
						// If parsing fails, use generic timeout message for 500/502
						errorMessage = 'Speech service timeout, please try again';
					}
				}

				setChatMessages(prev =>
					prev.map(message => {
						if (message.id === userMessageId) {
							return { ...message, text: '🎙️ Could not process voice message' };
						}
						if (message.id === aiMessageId) {
							return { ...message, text: errorMessage };
						}
						return message;
					})
				);
			}
		} catch (error) {
			console.error('❌ Video voice message error:', error);
			setChatMessages(prev =>
				prev.map(message => {
					if (message.id === userMessageId) {
						return { ...message, text: '🎙️ Failed to process voice message' };
					}
					if (message.id === aiMessageId) {
						return { ...message, text: 'Network error. Please check your connection and try again.' };
					}
					return message;
				})
			);
		} finally {
			setIsProcessingVoice(false);

			// Clean up the audio file
			try {
				await RNFS.fs.unlink(audioFilePath);
				console.log('🧹 Cleaned up video voice audio file');
			} catch (cleanupError) {
				console.warn('⚠️ Failed to clean up audio file:', cleanupError);
			}
		}
	};

	// Handle mic press for video mode (video response)
	const handleVideoMicPress = async () => {
		if (isVideoRecording) {
			await stopVideoVoiceRecording();
		} else {
			await startVideoVoiceRecording();
		}
	};

	// Handle sending message in live mode
	const handleSendLiveMessage = async () => {
		const trimmed = liveInput.trim();
		if (!trimmed) {
			return;
		}

		const timestamp = Date.now();
		const userMessageId = `live-user-${timestamp}`;
		const aiMessageId = `live-ai-${timestamp}`;
		const now = new Date();

		setChatMessages(prev => ([
			...prev,
			{
				id: userMessageId,
				text: trimmed,
				isUser: true,
				timestamp: now,
				videoResponseText: null,
				context: 'live',
			},
			{
				id: aiMessageId,
				text: '',
				isUser: false,
				timestamp: now,
				videoResponseText: null,
				context: 'live',
			},
		]));

		setLiveInput('');

		requestAnimationFrame(() => {
			setTimeout(() => {
				chatScrollRef.current?.scrollToEnd({ animated: true });
			}, 80);
		});

		await generateVideoForMessage(trimmed, aiMessageId);
	};

	const [input, setInput] = useState('');
	const [showSheet, setShowSheet] = useState(false);
	const [selectedTab, setSelectedTab] = useState(0);
	const [entries, setEntries] = useState<string[]>([]);
	const [showTwinPreview, setShowTwinPreview] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
	const handlePlanSelect = React.useCallback((plan: SubscriptionPlanId) => {
		setSelectedPlan(plan);
		setSubscriptionError(null);
		setSubscriptionSuccess(null);
	}, []);

	const handleSubscribePress = React.useCallback(async () => {
		if (!selectedPlan) {
			Alert.alert('Select Plan', 'Please choose a subscription plan to continue.');
			return;
		}

		const planAmount = SUBSCRIPTION_PLAN_AMOUNTS[selectedPlan];
		if (typeof planAmount !== 'number') {
			setSubscriptionError('Selected plan is not available right now.');
			return;
		}
		const planLabel = SUBSCRIPTION_PLAN_LABELS[selectedPlan];

		const targetProfessionalId = professional_id || professional?.professional_id;
		const normalizedId = toTrimmedString(targetProfessionalId ?? null);
		if (!normalizedId) {
			Alert.alert('Unavailable', 'Professional information is not available right now.');
			return;
		}

		if (!token) {
			Alert.alert('Login Required', 'Please sign in to subscribe.');
			return;
		}

		try {
			setIsSubscribing(true);
			setSubscriptionError(null);
			setSubscriptionSuccess(null);

			const encodedId = encodeURIComponent(normalizedId);
			const endpoint = buildUrl(`/professionals/${encodedId}/subscribe`);
			console.log('🛎️ Subscribing to professional:', endpoint, 'plan:', selectedPlan);

			const headers: Record<string, string> = {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			};

			const body = JSON.stringify({
				amount: planAmount,
				plan: selectedPlan,
				professional_id: normalizedId,
			});

			const response = await fetch(endpoint, {
				method: 'POST',
				headers,
				body,
			});

			const rawBody = await response.text();
			let payload: any = null;
			if (rawBody) {
				try {
					payload = JSON.parse(rawBody);
				} catch (error) {
					console.warn('⚠️ Unable to parse subscription response JSON', error);
				}
			}

			if (response.ok) {
				const wasSubscribed = hasSubscription;
				setHasSubscription(true);
				setSubscribedPlan(selectedPlan);
				setSelectedPlan(null);
				if (!wasSubscribed) {
					setSubscriberCount(prev => {
						if (typeof prev === 'number') {
							return prev + 1;
						}
						const fallback = professional?.subscriber_count ?? 0;
						return fallback + 1;
					});
				}
				const successMessage = payload?.detail || payload?.message || `You are subscribed to the ${planLabel} plan.`;
				setSubscriptionSuccess(successMessage);
				await fetchSubscribers(normalizedId);
			} else {
				if (response.status === 409) {
					setHasSubscription(true);
					const alreadyMessage = payload?.detail || payload?.message || 'You are already subscribed to this professional.';
					setSubscriptionSuccess(alreadyMessage);
					await fetchSubscribers(normalizedId);
				} else if (response.status === 401) {
					const message = payload?.detail || payload?.message || 'Authentication required.';
					setSubscriptionError(message);
					Alert.alert('Session Expired', 'Please sign in again to subscribe.');
				} else {
					const message = payload?.detail || payload?.message || `Failed to subscribe (status ${response.status}).`;
					setSubscriptionError(message);
				}
			}
		} catch (error) {
			console.error('❌ Subscription error:', error);
			setSubscriptionError('Could not complete the subscription. Please try again.');
		} finally {
			setIsSubscribing(false);
		}
	}, [selectedPlan, professional_id, professional?.professional_id, token, fetchSubscribers, hasSubscription, professional?.subscriber_count]);
	const scrollRef = React.useRef<ScrollView>(null);
	const tabsScrollRef = React.useRef<ScrollView>(null);
	const isActive = input.trim().length > 0;
	const handleSend = () => {
		if (!isActive) return;
		setEntries([...entries, input]);
		setInput('');
		setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};
	React.useEffect(() => {
		// Scroll tabs further right for extra spacing
		if (tabsScrollRef.current) {
			tabsScrollRef.current.scrollTo({ x: 2000, animated: true });
		}

		// Cleanup: Clear polling interval when component unmounts
		return () => {
			if (pollingIntervalRef.current) {
				console.log('🧹 Cleanup: Clearing video polling on unmount');
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		};
	}, []);
	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* Header with background image */}
			<View style={styles.headerBgContainer}>
				{professionalHeaderUri ? (
					<Image
						source={{ uri: professionalHeaderUri }}
						style={styles.headerBg}
						onError={(e) => {
							console.log('PublicMicrositePTView: professional header image failed', e?.nativeEvent);
							if (!disableProfessionalImageTransforms) {
								setDisableProfessionalImageTransforms(true);
							} else if (coverImageUrl) {
								setCoverImageUrl(null);
							} else if (professionalImageUrl) {
								setProfessionalImageUrl(null);
							}
						}}
					/>
				) : userHeaderUri ? (
					<Image
						source={{ uri: userHeaderUri }}
						style={styles.headerBg}
						onError={(e) => {
							console.log('PublicMicrositePTView: user header image failed', e?.nativeEvent);
							if (!disableUserImageTransforms) {
								setDisableUserImageTransforms(true);
							} else {
								setAvatarImageUrl(null);
								setAvatarUrl(null);
							}
						}}
					/>
				) : (
					loadingAvatar ? (
						<View style={[styles.headerBg, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' }]}>
							<ActivityIndicator size="large" color="#6C5CE7" />
						</View>
					) : (
						<View style={[styles.headerBg, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
							<Ionicons name="image-outline" size={60} color="#999" />
						</View>
					)
				)}
				{/* Single back button (removed duplicate) */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={24} color="#fff" />
				</TouchableOpacity>
			</View>

			{/* Avatar and profile info */}
			<View style={styles.profileHeaderContainer}>
				<View style={styles.avatarStackedWrapper}>
					{professionalAvatarUri ? (
						<Image
							source={{ uri: professionalAvatarUri }}
							style={styles.avatar}
							onError={(e) => {
								console.log('PublicMicrositePTView: professional avatar failed to load', e?.nativeEvent);
								if (!disableProfessionalImageTransforms) {
									setDisableProfessionalImageTransforms(true);
								} else if (professionalImageUrl) {
									setProfessionalImageUrl(null);
								} else if (coverImageUrl) {
									setCoverImageUrl(null);
								}
							}}
						/>
					) : avatarImageUrl ? (
						<Image
							source={{ uri: avatarImageUrl }}
							style={styles.avatar}
							onError={(e) => {
								console.log('PublicMicrositePTView: user avatar failed to load', e?.nativeEvent);
								if (!disableUserImageTransforms) {
									setDisableUserImageTransforms(true);
								} else {
									setAvatarImageUrl(null);
									setAvatarUrl(null);
								}
							}}
						/>
					) : loadingAvatar ? (
						<View style={[styles.avatar, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
							<ActivityIndicator size="small" color="#6C5CE7" />
						</View>
					) : (
						<View style={[styles.avatar, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
							<Ionicons name="person" size={50} color="#999" />
						</View>
					)}
				</View>
				<View style={styles.profileInfoContainer}>
					<View style={styles.profileNameRow}>
						<Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>{professional?.display_name || 'Professional'}</Text>
						<TouchableOpacity style={styles.shareBtn}>
							<Ionicons name="share-social-outline" size={20} color="#6C5CE7" />
						</TouchableOpacity>
					</View>
					<Text style={[styles.profileDesc, styles.profileDescText, { color: theme.textSecondary }]}>
						{professional?.bio || 'Welcome to my personal space !'}
					</Text>
					<View style={styles.subscriberRow}>
						<Text style={[styles.profileSubs, styles.profileSubsText]}>
							<Text style={[styles.boldText, { color: theme.text }]}>{displaySubscriberCount}</Text>
							<Text style={{ color: theme.textSecondary }}> Subscribers</Text>
						</Text>
						{isFetchingSubscribers && (
							<ActivityIndicator size="small" color="#8170FF" style={styles.subscriberLoader} />
						)}
					</View>
				</View>
			</View>

			{/* Tabs - horizontally scrollable and selectable */}
			<ScrollView
				ref={tabsScrollRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.tabsRow}
				contentContainerStyle={styles.tabScrollContent}
			>
				{['Twin Window', 'About', 'Subscribe', 'Book Session'].map((tab, idx) => (
					<TouchableOpacity
						key={tab}
						style={[styles.tab, selectedTab === idx && styles.tabActive]}
						onPress={() => setSelectedTab(idx)}
					>
						<Text style={[styles.tabText, selectedTab === idx && styles.tabTextActive]}>{tab}</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Main content area */}
			<View style={styles.flexStartContainer}>
				{/* Tab 0: Twin Window - Tavus AI Conversation */}
				{selectedTab === 0 ? (

					twinMode === 'live' ? (
						<View style={styles.liveAvatarContainer}>
							<View style={styles.videoFrame}>
								{hasNativePlaybackUrl && nativePlaybackUrl ? (
									<Video
										key={`native-player-${videoReloadToken}`}
										style={styles.nativeVideoPlayer}
										source={{ uri: nativePlaybackUrl }}
										resizeMode="contain"
										muted={isVideoMuted}
										volume={isVideoMuted ? 0 : 1}
										paused={false}
										controls={false}
										playInBackground={false}
										ignoreSilentSwitch="ignore"
										onLoad={handleVideoReady}
										onReadyForDisplay={handleVideoReady}
										onProgress={handleVideoProgress}
										onError={(error) => {
											console.error('❌ Video playback error:', error);
											if (hostedPlaybackUrl) {
												updateVideoPlaybackSources({
													stream: null,
													download: null,
													hosted: hostedPlaybackUrl,
												}, { replace: true });
											}
											setVideoPlaybackError('Unable to play the video stream. Switching to backup link...');
										}}
									/>
								) : webViewPlaybackUrl ? (
									<WebView
										key={`hosted-player-${webViewReloadToken}`}
										ref={instance => {
											webViewRef.current = instance;
										}}
										style={styles.videoWebView}
										source={{ uri: webViewPlaybackUrl }}
										allowsInlineMediaPlayback={true}
										mediaPlaybackRequiresUserAction={false}
										startInLoadingState
										onLoadEnd={handleHostedVideoReady}
										onError={(syntheticEvent) => {
											console.error('❌ Hosted video WebView error:', syntheticEvent.nativeEvent);
											setVideoPlaybackError('Unable to load the hosted video. Please try again later.');
										}}
										renderLoading={() => (
											<View style={styles.videoWebViewLoading}>
												<ActivityIndicator size="large" color="#8170FF" />
												<Text style={styles.videoLoadingText}>Loading video...</Text>
											</View>
										)}
									/>
								) : isGeneratingVideo ? (
									<View style={styles.videoGeneratingContainer}>
										<ActivityIndicator size="large" color="#8170FF" />
										<Text style={styles.videoLoadingText}>{videoStatusMessage}</Text>
									</View>
								) : (
									<View style={styles.videoPlaceholder}>
										<Ionicons name="videocam-outline" size={48} color="#8170FF" />
										<Text style={styles.videoPlaceholderText}>
											{videoPlaybackError || 'Type a message to generate video'}
										</Text>
									</View>
								)}

								{hasPlayableVideo ? (
									<View style={styles.videoOverlayControls}>
										<TouchableOpacity style={styles.videoIconLeft} onPress={toggleVideoMute}>
											<Ionicons name={isVideoMuted ? 'volume-mute' : 'volume-high'} size={18} color="#FFFFFF" />
										</TouchableOpacity>
										<TouchableOpacity style={styles.videoIconRight} onPress={handleReloadVideo}>
											<Ionicons name="refresh" size={18} color="#FFFFFF" />
										</TouchableOpacity>
									</View>
								) : null}

								{isGeneratingVideo ? (
									<View style={styles.videoLoadingOverlay}>
										<ActivityIndicator size="large" color="#8170FF" />
										<Text style={styles.videoLoadingText}>{videoStatusMessage}</Text>
									</View>
								) : null}
							</View>
							<View style={styles.liveChatCard}>
								<ScrollView
									style={styles.chatMessagesContainer}
									contentContainerStyle={styles.chatMessagesContent}
									ref={chatScrollRef}
									showsVerticalScrollIndicator={false}
								>
									{liveModeMessages.length === 0 ? (
										<View style={styles.chatEmptyState}>
											<Text style={styles.chatEmptyTitle}>Share a prompt to generate a video response.</Text>
										</View>
									) : (
										liveModeMessages.map(message => {
											const animationEntry = videoMessageAnimations[message.id];
											const animatedText = animationEntry
												? animationEntry.displayed.length > 0 || animationEntry.status === 'done'
													? animationEntry.displayed || animationEntry.full
													: ''
												: (message.videoResponseText ?? message.text);
											const displayText = message.isUser ? message.text : animatedText;
											// Skip AI messages with no content or generic status messages
											if (!message.isUser) {
												if (!displayText) {
													return null;
												}
												// Only filter exact matches of very specific status messages
												const genericPatterns = [
													/^your request has processed successfully!?$/i,
													/^request processed successfully!?$/i,
													/^processing complete!?$/i,
													/^success!?$/i,
													/^response received!?$/i,
												];
												if (genericPatterns.some(p => p.test(displayText.trim()))) {
													return null;
												}
											}
											return (
												<View
													key={message.id}
													style={[
														styles.messageRow,
														message.isUser ? styles.messageRowUser : styles.messageRowAI,
													]}
												>
													<View
														style={[
															styles.messageBubble,
															message.isUser ? styles.messageBubbleUser : styles.messageBubbleAI,
														]}
													>
														<Text
															style={[
																styles.messageText,
																message.isUser ? styles.messageTextUser : styles.messageTextAI,
															]}
														>
															{displayText}
														</Text>
													</View>
												</View>
											);
										})
									)}
								</ScrollView>
								<View style={styles.liveInputRow}>
									<TouchableOpacity
										style={[styles.voiceButton, isVideoRecording && styles.voiceButtonRecording]}
										onPress={handleVideoMicPress}
										disabled={isProcessingVoice || isGeneratingVideo}
									>
										<Ionicons
											name={isVideoRecording ? "stop" : "mic"}
											size={20}
											color={isVideoRecording ? "#fff" : "#8170FF"}
										/>
									</TouchableOpacity>
									<TextInput
										style={styles.liveInput}
										placeholder="Type your message for video generation"
										placeholderTextColor="#999"
										value={liveInput}
										onChangeText={setLiveInput}
										multiline
										editable={!isGeneratingVideo}
									/>
									<TouchableOpacity
										style={[styles.liveSendButton, isGeneratingVideo && { opacity: 0.5 }]}
										disabled={isGeneratingVideo}
										onPress={handleSendLiveMessage}
									>
										<Ionicons name="arrow-up" size={20} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					) : twinMode === 'purchase' ? (
						<View style={styles.purchaseContainer}>
							<View style={styles.purchasePlansWrapper}>
								<TouchableOpacity
									style={[
										styles.planOption,
										selectedTwinPlan === '15min' && styles.planOptionSelected,
									]}
									onPress={() => setSelectedTwinPlan('15min')}
								>
									<Text style={styles.planOptionText}>₹250 for 15 minutes</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.planOption,
										selectedTwinPlan === '30min' && styles.planOptionSelected,
									]}
									onPress={() => setSelectedTwinPlan('30min')}
								>
									<Text style={styles.planOptionText}>₹400 for 30 minutes</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.planOption,
										selectedTwinPlan === '60min' && styles.planOptionSelected,
									]}
									onPress={() => setSelectedTwinPlan('60min')}
								>
									<Text style={styles.planOptionText}>₹600 for 60 minutes</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								style={[
									styles.payButton,
									!selectedTwinPlan && styles.payButtonDisabled,
								]}
								disabled={!selectedTwinPlan}
								onPress={() => {
									if (selectedTwinPlan) {
										setTwinMode('live');
									}
								}}
							>
								<Text style={styles.payButtonText}>Pay</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => setTwinMode('chat')}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.chatCardTwin}>
							{/* Chat messages area */}
							<ScrollView
								style={styles.chatMessagesContainer}
								contentContainerStyle={styles.chatMessagesContent}
								ref={chatScrollRef}
								showsVerticalScrollIndicator={false}
							>
								{chatModeMessages.length === 0 ? (
									<View style={styles.chatEmptyState}>
										<Text style={styles.chatEmptyTitle}>How can I assist you?</Text>
										<View style={styles.thumbsRow}>
											<TouchableOpacity style={styles.thumbButton}>
												<Ionicons name="thumbs-up" size={18} color="#8170FF" />
											</TouchableOpacity>
											<TouchableOpacity style={styles.thumbButton}>
												<Ionicons name="thumbs-down" size={18} color="#8170FF" />
											</TouchableOpacity>
										</View>
									</View>
								) : (
									chatModeMessages.map((message) => {
										// For AI messages, use animated text if available
										const animationEntry = chatMessageAnimations[message.id];
										const displayText = message.isUser
											? message.text
											: (animationEntry
												? (animationEntry.displayed || (animationEntry.status === 'done' ? animationEntry.full : ''))
												: message.text);

										// Skip AI messages with no content yet
										if (!message.isUser && !displayText) {
											return null;
										}

										return (
											<View
												key={message.id}
												style={[
													styles.messageRow,
													message.isUser ? styles.messageRowUser : styles.messageRowAI,
												]}
											>
												<View
													style={[
														styles.messageBubble,
														message.isUser ? styles.messageBubbleUser : styles.messageBubbleAI,
													]}
												>
													<Text
														style={[
															styles.messageText,
															message.isUser ? styles.messageTextUser : styles.messageTextAI,
														]}
													>
														{displayText}
													</Text>
												</View>
											</View>
										);
									})
								)}
							</ScrollView>

							{/* Input area */}
							<View style={styles.chatInputCard}>
								<View style={styles.inputRowTwin}>
									<TouchableOpacity
										style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
										onPress={handleChatMicPress}
										disabled={isProcessingVoice}
									>
										<Ionicons
											name={isRecording ? "stop" : "mic"}
											size={20}
											color={isRecording ? "#fff" : "#8170FF"}
										/>
									</TouchableOpacity>
									<TextInput
										style={styles.chatTextInput}
										placeholder="Let your thoughts flow"
										placeholderTextColor="#C0C0C0"
										value={chatInput}
										onChangeText={setChatInput}
										multiline
										onSubmitEditing={handleSendChatMessage}
									/>
									<TouchableOpacity
										style={styles.sendButtonTwin}
										onPress={handleSendChatMessage}
										disabled={!chatInput.trim()}
									>
										<Ionicons name="arrow-up" size={20} color="#fff" />
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={styles.unlockButtonBelow}
									onPress={() => setTwinMode('purchase')}
								>
									<Text style={styles.unlockButtonText}>Unlock live avatar</Text>
									<Ionicons name="lock-closed" size={14} color="#8170FF" style={{ marginLeft: 4 }} />
								</TouchableOpacity>
							</View>
						</View>
					)
				) : selectedTab === 1 ? (
					<ScrollView style={styles.contentScrollContainerAbout} contentContainerStyle={styles.contentPaddingAbout}>
						<Text style={[styles.sectionTitle, { color: theme.text }]}>About me</Text>
						<View style={styles.postCard}>
							<Text style={[styles.postText, { color: '#222' }]}>
								{loading ? 'Loading...' : (professional?.about || 'No about information available.')}
							</Text>
						</View>
						<Text style={[styles.videoSectionTitle, { color: theme.text }]}>View my knowledge base</Text>
						{/* Knowledge base files */}
						{loadingKnowledge ? (
							<View style={{ paddingVertical: 30, alignItems: 'center' }}>
								<ActivityIndicator size="large" color="#8170FF" />
								<Text style={{ marginTop: 10, fontSize: 13, color: '#666' }}>Loading knowledge base...</Text>
							</View>
						) : knowledgeFiles.length > 0 ? (
							<View style={styles.videoContainer}>
								{knowledgeFiles.map((file: KnowledgeBaseFile) => {
									const isSubscribersOnly = file.visibility === 'subscribers';

									return (
										<View key={file.id} style={[styles.postCard, { marginBottom: 12, position: 'relative', overflow: 'hidden' }]}>
											<View style={{ flexDirection: 'row', alignItems: 'center' }}>
												<View style={{
													width: 48,
													height: 48,
													borderRadius: 10,
													backgroundColor: '#F0EBFF',
													alignItems: 'center',
													justifyContent: 'center',
													marginRight: 12
												}}>
													<Ionicons name={getFileIcon(file.file_type)} size={24} color="#8170FF" />
												</View>
												<View style={{ flex: 1 }}>
													<Text style={{ fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 4 }}>
														{file.title}
													</Text>
													<Text style={{ fontSize: 12, color: '#666' }}>
														{file.file_type} • {new Date(file.created_at).toLocaleDateString()}
													</Text>
												</View>
												<View style={{
													paddingHorizontal: 10,
													paddingVertical: 4,
													borderRadius: 12,
													backgroundColor: isSubscribersOnly ? '#FFF3E0' : '#E8F5E9'
												}}>
													<Text style={{ fontSize: 11, fontWeight: '600', color: isSubscribersOnly ? '#FF9800' : '#4CAF50' }}>
														{isSubscribersOnly ? 'Subscribers' : 'Public'}
													</Text>
												</View>
											</View>

											{/* Locked overlay for subscribers only */}
											{isSubscribersOnly && (
												<View style={{
													position: 'absolute',
													top: 0,
													left: 0,
													right: 0,
													bottom: 0,
													backgroundColor: 'rgba(0, 0, 0, 0.6)',
													borderRadius: 16,
													alignItems: 'center',
													justifyContent: 'center',
												}}>
													<Ionicons name="lock-closed" size={40} color="#FFFFFF" />
													<TouchableOpacity
														style={{
															marginTop: 12,
															backgroundColor: '#FFFFFF',
															paddingHorizontal: 20,
															paddingVertical: 8,
															borderRadius: 20,
															flexDirection: 'row',
															alignItems: 'center',
														}}
														onPress={() => setSelectedTab(2)} // Navigate to plans tab
													>
														<Text style={{ fontSize: 13, fontWeight: '600', color: '#8170FF', marginRight: 4 }}>
															👑 Upgrade
														</Text>
													</TouchableOpacity>
												</View>
											)}
										</View>
									);
								})}
							</View>
						) : (
							<View style={{ paddingVertical: 40, alignItems: 'center' }}>
								<Ionicons name="folder-open-outline" size={60} color="#BDBDBD" />
								<Text style={{ marginTop: 16, fontSize: 15, fontWeight: '600', color: '#222' }}>
									No Public Knowledge Base
								</Text>
								<Text style={{ marginTop: 8, fontSize: 13, color: '#666', textAlign: 'center', paddingHorizontal: 40 }}>
									This professional hasn't shared any knowledge base files yet.
								</Text>
							</View>
						)}
					</ScrollView>
				) : selectedTab === 2 ? (
					<ScrollView style={styles.planContainer} contentContainerStyle={styles.planScrollContent}>
						<Text style={[styles.planTitle, { color: theme.text }]}>
							{hasSubscription ? 'Your Subscription' : 'Choose A Plan'}
						</Text>
						{hasSubscription ? (
							<View style={styles.subscriptionStatusCard}>
								<View style={styles.subscriptionStatusHeader}>
									<Ionicons name="ribbon" size={22} color="#5B4BFF" style={{ marginRight: 8 }} />
									<Text style={styles.subscriptionStatusTitle}>You are an active subscriber</Text>
								</View>
								{subscribedPlan ? (
									<Text style={styles.subscriptionStatusPlan}>
										Plan: {SUBSCRIPTION_PLAN_LABELS[subscribedPlan]} • ${SUBSCRIPTION_PLAN_AMOUNTS[subscribedPlan]}
									</Text>
								) : null}
								<Text style={styles.subscriptionStatusBody}>
									{subscriptionSuccess || 'Enjoy unlimited access to subscriber-only experiences.'}
								</Text>
								<TouchableOpacity
									activeOpacity={0.8}
									style={styles.subscriptionExploreButton}
									onPress={() => setSelectedTab(0)}
								>
									<Ionicons name="arrow-forward-circle" size={18} color="#5B4BFF" style={{ marginRight: 6 }} />
									<Text style={styles.subscriptionExploreText}>Jump back to the Twin Window</Text>
								</TouchableOpacity>
							</View>
						) : (
							<>
								{/* Weekly Plan */}
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => handlePlanSelect('weekly')}
									style={[styles.planCard, selectedPlan === 'weekly' ? styles.planCardSelected : styles.planCardDefault]}>
									<View>
										<Text style={[styles.subscriptionPlanTitle, { color: '#222' }]}>Weekly</Text>
										<Text style={[styles.subscriptionPlanPrice, { color: '#222' }]}>$ 10.8 per week</Text>
									</View>
									<View style={styles.radioButton}>
										<View style={[styles.radioButtonInner, selectedPlan === 'weekly' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
									</View>
								</TouchableOpacity>
								{/* Monthly Plan */}
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => handlePlanSelect('monthly')}
									style={[styles.planCard, selectedPlan === 'monthly' ? styles.planCardSelected : styles.planCardDefault]}>
									<View style={styles.planContent}>
										<Text style={[styles.subscriptionPlanTitle, { color: '#222' }]}>Monthly</Text>
										<Text style={[styles.subscriptionPlanPrice, { color: '#222' }]}>$ 25 per month</Text>
										<Text style={[styles.subscriptionPlanFeatures, { color: '#222' }]}>Features :</Text>
										<Text style={[styles.subscriptionPlanFeatureItem, { color: '#222' }]}>-Access all the memory capsules.</Text>
										<Text style={[styles.subscriptionPlanFeatureItem, { color: '#222' }]}>-Get 50% off on bookes sessions.</Text>
										<Text style={[styles.subscriptionPlanFeatureItem, { color: '#222' }]}>-Interaction with the twin avatar</Text>
									</View>
									<View style={styles.radioButton}>
										<View style={[styles.radioButtonInner, selectedPlan === 'monthly' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
									</View>
								</TouchableOpacity>
								{/* Annual Plan */}
								<TouchableOpacity
									activeOpacity={0.8}
									onPress={() => handlePlanSelect('annual')}
									style={[styles.planCard, selectedPlan === 'annual' ? styles.planCardSelected : styles.planCardDefault, styles.planCardMarginBottom]}>
									<View>
										<Text style={[styles.subscriptionPlanTitle, { color: '#222' }]}>Annual</Text>
										<Text style={[styles.subscriptionPlanPrice, { color: '#222' }]}>$ 200 per year</Text>
									</View>
									<View style={styles.radioButton}>
										<View style={[styles.radioButtonInner, selectedPlan === 'annual' ? styles.radioButtonSelected : styles.radioButtonUnselected]} />
									</View>
								</TouchableOpacity>
								{/* Subscribe Button */}
								<TouchableOpacity
									style={[styles.subscriptionButton, subscriptionButtonDisabled ? styles.disabledButton : styles.purpleBackground]}
									disabled={subscriptionButtonDisabled}
									onPress={handleSubscribePress}
								>
									{isSubscribing ? (
										<ActivityIndicator size="small" color="#fff" />
									) : (
										<Text style={styles.subscriptionButtonText}>
											Subscribe
										</Text>
									)}
								</TouchableOpacity>
								{subscriptionSuccess && (
									<Text style={styles.subscriptionStatusMessage}>{subscriptionSuccess}</Text>
								)}
								{subscriptionError && (
									<Text style={styles.subscriptionErrorText}>{subscriptionError}</Text>
								)}
							</>
						)}
					</ScrollView>
				) : selectedTab === 3 ? (
					<ScrollView
						style={styles.bookSessionContainer}
						contentContainerStyle={styles.bookSessionScrollContent}
					>
						<View style={styles.dateTitleContainer}>
							<Text style={[styles.sessionTitle, { color: theme.text }]}>Select a Date/Dates/Week</Text>
							<TouchableOpacity onPress={() => navigation.navigate('UpComingUserSessions')}>
								<Ionicons name="time-outline" size={28} color="#222" style={styles.clockIcon} />
							</TouchableOpacity>
						</View>
						<View style={styles.dateCard}>
							<Text style={[styles.dateDescription, { color: '#222' }]}>Choose an available slot from the calendar below. All times are in your local timezone.</Text>
							{/* Real calendar picker using react-native-calendars */}
							<Calendar
								onDayPress={handleCalendarDateSelect}
								markedDates={selectedDateString ? {
									[selectedDateString]: { selected: true, selectedColor: '#8170FF' }
								} : {}}
								theme={{
									selectedDayBackgroundColor: '#8170FF',
									todayTextColor: '#8170FF',
									arrowColor: '#8170FF',
									dotColor: '#8170FF',
									textDayFontFamily: 'System',
									textMonthFontFamily: 'System',
									textDayHeaderFontFamily: 'System',
									textDayFontSize: 15,
									textMonthFontSize: 16,
									textDayHeaderFontSize: 13,
								}}
								style={{
									marginBottom: 12,
									borderRadius: 12,
									borderWidth: 1,
									borderColor: '#D1C9F7',
								}}
								minDate={new Date().toISOString().split('T')[0]} // Only allow future dates
							/>
						</View>
						{/* Available Slots - Only show after date selection */}
						{selectedDateString && (
							<>
								<Text style={[styles.availableSlotsTitle, { color: theme.text }]}>Available Slots</Text>
								{fetchingSlots ? (
									<View style={{ padding: 20, alignItems: 'center' }}>
										<ActivityIndicator size="large" color="#8170FF" />
										<Text style={{ marginTop: 10, color: '#222' }}>Loading slots...</Text>
									</View>
								) : availableSlots.length > 0 ? (
									<View style={styles.slotsContainer}>
										{availableSlots.map(slot => (
											<TouchableOpacity
												key={slot.slot_id}
												onPress={() => setSelectedSlot(slot)}
												style={[styles.slotButton, selectedSlot?.slot_id === slot.slot_id ? styles.slotButtonSelected : styles.slotButtonDefault]}
											>
												<Text style={[styles.slotText, selectedSlot?.slot_id === slot.slot_id ? styles.slotTextSelected : styles.slotTextDefault]}>
													{formatTime(slot.start_time)}
												</Text>
												<Text style={[styles.slotPriceText, selectedSlot?.slot_id === slot.slot_id ? styles.slotTextSelected : styles.slotTextDefault]}>
													${slot.price_per_hour}/hr
												</Text>
											</TouchableOpacity>
										))}
									</View>
								) : (
									<View style={{ padding: 20, alignItems: 'center' }}>
										<Text style={{ color: '#222' }}>
											No available slots for this date
										</Text>
									</View>
								)}
							</>
						)}
						{/* Your Selection */}
						{selectedSlot && (
							<>
								<Text style={[styles.selectionTitle, { color: '#222' }]}>Your Selection</Text>
								<View style={styles.selectionCard}>
									<View style={styles.selectionRow}>
										<Text style={[styles.selectionLabel, { color: '#222' }]}>Time</Text>
										<Text style={[styles.selectionValue, { color: '#222' }]}>
											{formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
										</Text>
									</View>
									<View style={styles.selectionRow}>
										<Text style={[styles.selectionLabel, { color: '#222' }]}>Duration</Text>
										<Text style={[styles.selectionValue, { color: '#222' }]}>
											{Math.round((new Date(selectedSlot.end_time).getTime() - new Date(selectedSlot.start_time).getTime()) / 60000)} minutes
										</Text>
									</View>
									<View style={styles.selectionRow}>
										<Text style={[styles.selectionLabel, { color: '#222' }]}>Total Cost</Text>
										<Text style={[styles.selectionValue, { color: '#222' }]}>${selectedSlot.price_per_hour}</Text>
									</View>
								</View>
								{/* Book Now Button */}
								<TouchableOpacity
									style={[styles.subscriptionButton, styles.purpleBackground, styles.noMarginBottom]}
									onPress={handleBookSession}
									disabled={bookingSlot}
								>
									{bookingSlot ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.subscriptionButtonText}>Book Now</Text>
									)}
								</TouchableOpacity>
							</>
						)}
						{!selectedSlot && selectedDateString && availableSlots.length > 0 && (
							<TouchableOpacity
								style={[styles.subscriptionButton, { backgroundColor: '#ccc' }, styles.noMarginBottom]}
								disabled={true}
							>
								<Text style={styles.subscriptionButtonText}>Select a slot to continue</Text>
							</TouchableOpacity>
						)}
					</ScrollView>
				) : null}
				{showTwinPreview && (
					<>
						<View style={styles.videoOverlayContainer}>
							{professionalTwinUri ? (
								<Image
									source={{ uri: professionalTwinUri }}
									style={styles.videoOverlayImage}
									onError={(e) => {
										console.log('PublicMicrositePTView: professional twin preview avatar failed', e?.nativeEvent);
										if (!disableProfessionalImageTransforms) {
											setDisableProfessionalImageTransforms(true);
										} else if (professionalImageUrl) {
											setProfessionalImageUrl(null);
										} else if (coverImageUrl) {
											setCoverImageUrl(null);
										}
									}}
								/>
							) : userTwinUri ? (
								<Image
									source={{ uri: userTwinUri }}
									style={styles.videoOverlayImage}
									onError={(e) => {
										console.log('PublicMicrositePTView: user twin preview avatar failed', e?.nativeEvent);
										if (!disableUserImageTransforms) {
											setDisableUserImageTransforms(true);
										} else {
											setAvatarImageUrl(null);
											setAvatarUrl(null);
										}
									}}
								/>
							) : loadingAvatar ? (
								<View style={[styles.videoOverlayImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
									<ActivityIndicator size="large" color="#6C5CE7" />
								</View>
							) : (
								<View style={[styles.videoOverlayImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
									<Ionicons name="person" size={60} color="#999" />
								</View>
							)}
							<View style={styles.videoControlLeft}>
								<Ionicons name="volume-high-outline" size={24} color="#7C4DFF" />
							</View>
							<View style={styles.videoControlRight}>
								<Ionicons name="refresh-outline" size={24} color="#7C4DFF" />
							</View>
						</View>
						<View style={styles.chatContentContainer}>
							<ScrollView
								style={styles.chatScrollContainer}
								contentContainerStyle={styles.chatScrollContentContainer}
								showsVerticalScrollIndicator={true}
								ref={scrollRef}
							>
								{entries.length === 0 && (
									<View style={styles.chatEmptyContainer}>
										<Text style={[styles.chatPrompt, styles.chatEmptyPrompt, { color: '#222' }]}>What's been on your mind today?</Text>
										<View style={[styles.iconRow, styles.chatEmptyIconRow]}>
											<Ionicons name="thumbs-up-outline" size={18} color="#8170FF" style={styles.chatThumbIcon} />
											<Ionicons name="thumbs-down-outline" size={18} color="#8170FF" />
										</View>
									</View>
								)}
								{entries.map((entry, idx) => (
									<View key={idx} style={styles.messageCard}>
										<Text style={styles.chatMessageText}>{entry}</Text>
									</View>
								))}
							</ScrollView>
							{/* Typing Card */}
							<View style={styles.typingCardRow}>
								<TextInput
									style={[styles.typingInput, { color: '#222' }]}
									placeholder="Let your thoughts flow"
									placeholderTextColor="#868686"
									value={input}
									onChangeText={setInput}
									multiline
								/>
								<View style={styles.inputControlsRow}>
									<TouchableOpacity
										style={[styles.micButton, isRecording && styles.micButtonRecording]}
										onPress={handleChatMicPress}
										disabled={isProcessingVoice}
									>
										<Ionicons
											name={isRecording ? "stop" : "mic"}
											size={22}
											color={isRecording ? "#fff" : "#8170FF"}
										/>
									</TouchableOpacity>
									<TouchableOpacity style={styles.unlockBtnOutline} onPress={() => setShowSheet(true)}>
										<Text style={styles.unlockTextOutline}>Unlock live avatar</Text>
										<Ionicons name="lock-closed-outline" size={18} color="#8170FF" style={styles.chatIconSpacing} />
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.sendBtnFilled, isActive && styles.purpleBackground]}
										onPress={handleSend}
										activeOpacity={isActive ? 0.7 : 1}
										disabled={!isActive}
									>
										<Ionicons name="arrow-up" size={22} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</>
				)}
			</View>

			{/* Bottom sheet modal */}
			{showSheet && (
				<View style={styles.sheetOverlay}>
					<View style={styles.sheetContainer}>
						<View style={styles.sheetHandle} />
						<View style={styles.sheetOptions}>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 250 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(250)}
							>
								<Text style={styles.sheetOptionText}>₹250 <Text style={styles.sheetOptionSub}>for 15 minutes</Text></Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 400 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(400)}
							>
								<Text style={styles.sheetOptionText}>₹400 <Text style={styles.sheetOptionSub}>for 30 minutes</Text></Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.sheetOption, selectedPayment === 600 && styles.selectedBorder]}
								onPress={() => setSelectedPayment(600)}
							>
								<Text style={styles.sheetOptionText}>₹600 <Text style={styles.sheetOptionSub}>for 60 minutes</Text></Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							style={[styles.sheetPayBtn, !selectedPayment && styles.disabledButton]}
							onPress={() => { if (selectedPayment) { setShowSheet(false); setShowTwinPreview(true); } }}
							disabled={!selectedPayment}
						>
							<Text style={styles.sheetPayText}>Pay</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setShowSheet(false)}><Text style={styles.sheetCancelText}>Cancel</Text></TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	headerBgContainer: {
		width: '100%',
		height: 190,
		position: 'relative',
		marginTop: 0, // Reduced top space above cover image
	},
	headerBg: {
		width: '100%',
		height: '100%',
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	backBtn: {
		position: 'absolute',
		top: 30,
		left: 12,
		borderRadius: 8,
		padding: 10,
		backgroundColor: 'transparent',
	},
	profileStackedContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: -45,
		marginBottom: 0,
		paddingHorizontal: 16.2,
	},
	avatarStackedWrapper: {
		width: 90,
		height: 90,
		borderRadius: 45,
		overflow: 'hidden',
		borderWidth: 3,
		borderColor: '#fff',
		marginRight: 12.6,
		backgroundColor: '#eee',
	},
	avatar: {
		width: '100%',
		height: '100%',
		borderRadius: 45,
	},
	profileInfoStackedCentered: {
		flex: 1,
		justifyContent: 'center',
	},
	profileInfoRowCentered: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	profileName: {
		fontSize: 16.2,
		fontWeight: '700',
		marginRight: 4,
	},
	shareBtn: {
		padding: 4,
	},
	profileDesc: {
		fontSize: 12.6,
		marginTop: 0,
		marginBottom: 1.8,
	},
	profileSubs: {
		fontSize: 11.7,
		fontWeight: '600',
		marginBottom: 0,
	},
	subscriberRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	subscriberLoader: {
		marginLeft: 6,
	},
	tabsRow: {
		paddingHorizontal: 13.5,
		marginBottom: 0,
		marginTop: -130, // Less overlap pull-up
	},
	tab: {
		paddingVertical: 5.4,
		paddingHorizontal: 12.6,
		borderRadius: 16.2,
		backgroundColor: '#F2F2F2',
		marginRight: 7.2,
	},
	tabActive: {
		backgroundColor: '#8170FF',
	},
	tabText: {
		fontSize: 12.6,
		color: '#868686',
		fontWeight: '600',
	},
	tabTextActive: {
		color: '#fff',
	},
	inputControlsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		marginTop: 7.2,
	},
	micButton: {
		width: 28.8,
		height: 28.8,
		backgroundColor: '#F2F2F2',
		borderRadius: 14.4,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14.4,
	},
	micButtonRecording: {
		backgroundColor: '#FF4444',
	},
	unlockBtnOutline: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: '#8170FF',
		borderRadius: 21.6,
		paddingHorizontal: 12.6,
		paddingVertical: 4.5,
		backgroundColor: '#fff',
		marginHorizontal: 5.4,
	},
	unlockTextOutline: {
		color: '#8170FF',
		fontWeight: '600',
		fontSize: 11.7,
		marginRight: 0,
	},
	sendBtnFilled: {
		width: 28.8,
		height: 28.8,
		backgroundColor: '#8170FF',
		borderRadius: 14.4,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 14.4,
	},
	chatCard: {
		backgroundColor: '#F6F6F6',
		borderRadius: 21.6,
		marginHorizontal: 16.2,
		marginBottom: 0,
		marginTop: -80, // Align closer under tabs
		padding: 0.9,
		flex: 0.9,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 10,
	},
	chatCardTwin: {
		backgroundColor: '#F6F6F6',
		borderRadius: 21.6,
		marginHorizontal: 16.2,
		marginBottom: 0,
		marginTop: -115,
		padding: 18,
		flex: 0.9,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 10,
	},
	chatMessagesContainer: {
		flex: 1,
		marginBottom: 12,
	},
	chatMessagesContent: {
		paddingVertical: 8,
		flexGrow: 1,
	},
	chatEmptyState: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingVertical: 0,
		paddingHorizontal: 5,
	},
	chatEmptyTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#222',
		marginBottom: 10,
	},
	messageRow: {
		flexDirection: 'row',
		marginBottom: 12,
		paddingHorizontal: 4,
	},
	messageRowUser: {
		justifyContent: 'flex-end',
	},
	messageRowAI: {
		justifyContent: 'flex-start',
	},
	messageBubble: {
		maxWidth: '75%',
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 16,
	},
	messageBubbleUser: {
		backgroundColor: '#8170FF',
		borderBottomRightRadius: 4,
	},
	messageBubbleAI: {
		backgroundColor: '#fff',
		borderBottomLeftRadius: 4,
	},
	messageText: {
		fontSize: 14,
		lineHeight: 20,
	},
	messageTextUser: {
		color: '#fff',
	},
	messageTextAI: {
		color: '#222',
	},
	thumbsRow: {
		flexDirection: 'row',
		gap: 12,
	},
	thumbButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#F0EBFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	chatInputCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 12,
	},
	inputRowTwin: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 8,
		gap: 8,
	},
	chatTextInput: {
		flex: 1,
		fontSize: 14,
		color: '#222',
		paddingHorizontal: 12,
		paddingVertical: 8,
		maxHeight: 100,
	},
	voiceButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#F0EBFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	voiceButtonRecording: {
		backgroundColor: '#FF4444',
	},
	unlockButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
	},
	unlockButtonBelow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		borderWidth: 1.5,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		marginTop: 4,
	},
	unlockButtonText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#8170FF',
	},
	sendButtonTwin: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#8170FF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	thoughtsInput: {
		fontSize: 13,
		color: '#999',
		paddingHorizontal: 8,
	},
	purchaseContainer: {
		flex: 1,
		marginHorizontal: 16.2,
		marginTop: -80,
		justifyContent: 'center',
		paddingBottom: 40,
	},
	purchasePlansWrapper: {
		gap: 10,
		marginBottom: 20,
	},
	planOption: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 18,
		borderWidth: 2,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		alignItems: 'center',
	},
	planOptionSelected: {
		backgroundColor: '#F0EBFF',
	},
	planOptionText: {
		fontSize: 13,
		fontWeight: '600',
		color: '#8170FF',
	},
	payButton: {
		backgroundColor: '#8170FF',
		paddingVertical: 10,
		borderRadius: 20,
		alignItems: 'center',
		marginBottom: 0,
	},
	payButtonDisabled: {
		backgroundColor: '#C0B3FF',
	},
	payButtonText: {
		fontSize: 15,
		fontWeight: '700',
		color: '#fff',
	},
	cancelButton: {
		alignItems: 'center',
		paddingVertical: 12,
	},
	cancelButtonText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#8170FF',
	},
	liveAvatarContainer: {
		flex: 1,
		marginHorizontal: 16.2,
		marginTop: -140,
		marginBottom: 20,
	},
	videoFrame: {
		height: 200,
		backgroundColor: '#000',
		borderRadius: 14,
		overflow: 'hidden',
		marginBottom: 12,
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoWebView: {
		flex: 1,
		backgroundColor: '#000',
		width: '100%',
		height: '100%',
	},
	videoWebViewLoading: {
		flex: 1,
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
	},
	nativeVideoPlayer: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: '#000',
	},
	videoLoadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.8)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 20,
		borderRadius: 16,
	},
	videoGeneratingContainer: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: '#0D0D0D',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 14,
	},
	videoPlaceholder: {
		flex: 1,
		backgroundColor: '#1a1a1a',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	videoPlaceholderText: {
		color: '#fff',
		fontSize: 14,
		marginTop: 12,
		textAlign: 'center',
	},
	videoLoadingText: {
		color: '#fff',
		marginTop: 12,
		fontSize: 14,
		fontWeight: '500',
	},
	videoOverlayControls: {
		position: 'absolute',
		top: 8,
		left: 8,
		right: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		zIndex: 10,
	},
	videoIconLeft: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		padding: 6,
		borderRadius: 18,
	},
	videoIconRight: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		padding: 6,
		borderRadius: 18,
	},
	livePromptCard: {
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 20,
		borderWidth: 0,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 5,
	},
	liveChatCard: {
		backgroundColor: '#fff',
		borderRadius: 20,
		paddingVertical: 12,
		paddingHorizontal: 16,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 4,
		flex: 1,
		justifyContent: 'space-between',
		minHeight: 220,
	},
	livePromptText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#222',
		marginBottom: 16,
		lineHeight: 22,
	},
	liveInputRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 10,
		marginTop: 16,
		backgroundColor: '#F8F8F8',
		borderRadius: 24,
		paddingHorizontal: 4,
		paddingVertical: 4,
	},
	liveInput: {
		flex: 1,
		fontSize: 14,
		color: '#222',
		paddingHorizontal: 12,
		paddingVertical: 8,
		minHeight: 40,
		maxHeight: 100,
		backgroundColor: 'transparent',
	},
	liveSendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#8170FF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	chatPrompt: {
		fontSize: 12.6,
		fontWeight: '600',
		marginBottom: 4,
		marginTop: 8,
		marginHorizontal: 18,
	},
	iconRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 0,
		marginHorizontal: 18,
	},
	typingCardRow: {
		backgroundColor: '#fff',
		borderRadius: 16.2,
		paddingVertical: 12.6,
		paddingHorizontal: 14.4,
		minHeight: 76.5,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		width: '100%',
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 2,
		marginTop: 9,
	},
	typingInput: {
		fontSize: 12.6,
		fontWeight: '400',
		marginBottom: 7.2,
		textAlign: 'left',
		width: '100%',
		minHeight: 27,
		backgroundColor: '#fff',
		borderRadius: 10.8,
		paddingHorizontal: 9,
		paddingVertical: 5.4,
		borderWidth: 0,
		borderColor: 'transparent',
	},
	sheetOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		top: 0,
		backgroundColor: 'rgba(0,0,0,0.18)',
		justifyContent: 'flex-end',
		zIndex: 99,
	},
	sheetContainer: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 21.6,
		borderTopRightRadius: 21.6,
		paddingHorizontal: 18,
		paddingTop: 18,
		paddingBottom: 25.2,
		minHeight: 315,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	sheetHandle: {
		width: 36,
		height: 3.6,
		borderRadius: 1.8,
		backgroundColor: '#EDEDED',
		alignSelf: 'center',
		marginBottom: 7.2,
	},
	sheetOptions: {
		marginBottom: 18,
	},
	sheetOption: {
		borderWidth: 1.5,
		borderColor: '#7C4DFF',
		borderRadius: 25.2,
		paddingVertical: 9,
		paddingHorizontal: 10.8,
		marginBottom: 14.4,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	sheetOptionText: {
		color: '#7C4DFF',
		fontSize: 14.4,
		fontWeight: '700',
	},
	sheetOptionSub: {
		color: '#868686',
		fontSize: 12.6,
		fontWeight: '500',
	},
	sheetPayBtn: {
		backgroundColor: '#7C4DFF',
		borderRadius: 21.6,
		paddingVertical: 9,
		alignItems: 'center',
		marginBottom: 5.4,
	},
	sheetPayText: {
		color: '#fff',
		fontSize: 14.4,
		fontWeight: '700',
	},
	sheetCancelBtn: {
		alignItems: 'center',
		marginTop: 0,
	},
	sheetCancelText: {
		color: '#868686',
		fontSize: 12.6,
		fontWeight: '500',
	},
	// New styles for fixing inline styles
	profileHeaderContainer: {
		alignItems: 'flex-start',
		marginTop: -25, // Slightly less upward pull
		marginBottom: 0,
		paddingHorizontal: 16.2,
	},
	profileInfoContainer: {
		alignItems: 'flex-start',
		marginTop: 1.8,
		width: '100%',
	},
	profileNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 0,
		justifyContent: 'flex-start',
	},
	profileDescText: {
		textAlign: 'left',
		marginTop: 1.8,
	},
	profileSubsText: {
		textAlign: 'left',
		marginTop: 1.8,
	},
	boldText: {
		fontWeight: 'bold',
	},
	avatarCenterContainer: {
		alignItems: 'center',
		paddingRight: 18,
	},
	contentMainContainer: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	scrollContainer: {
		flex: 1,
		marginTop: -130,
	},
	scrollContentContainer: {
		paddingHorizontal: 16.2,
		paddingTop: 0,
	},
	sectionTitle: {
		fontWeight: '700',
		fontSize: 13.5,
		marginBottom: 1,
		marginTop: 0,
	},
	postCard: {
		backgroundColor: '#fff',
		borderRadius: 14.4,
		padding: 10.8,
		marginBottom: 7.2,
		marginTop: 3.6,
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	postText: {
		fontSize: 12.6,
		lineHeight: 18,
	},
	videoSectionTitle: {
		fontWeight: '700',
		fontSize: 12.6,
		marginBottom: 1,
		marginTop: 1,
	},
	videoContainer: {
		marginBottom: 6.3,
	},
	videoCard: {
		borderRadius: 16.2,
		overflow: 'hidden',
		marginBottom: 10.8,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		position: 'relative',
		height: 135,
	},
	videoImage: {
		width: '100%',
		height: 135,
		resizeMode: 'cover',
	},
	videoOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(255,255,255,0.55)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoBadgeLeft: {
		position: 'absolute',
		top: 7.2,
		left: 10.8,
		backgroundColor: 'rgba(255,255,255,0.7)',
		borderRadius: 7.2,
		paddingHorizontal: 5.4,
		paddingVertical: 1.8,
	},
	videoBadgeText: {
		color: '#868686',
		fontWeight: '600',
		fontSize: 10.8,
	},
	videoBadgeRight: {
		position: 'absolute',
		top: 7.2,
		right: 10.8,
		backgroundColor: 'rgba(255,255,255,0.7)',
		borderRadius: 7.2,
		paddingHorizontal: 5.4,
		paddingVertical: 1.8,
	},
	videoPurpleBadgeText: {
		color: '#8170FF',
		fontWeight: '600',
		fontSize: 10.8,
	},
	videoTitle: {
		position: 'absolute',
		bottom: 9,
		left: 12.6,
	},
	videoTitleText: {
		color: '#b2e672',
		fontWeight: '700',
		fontSize: 12.6,
	},
	videoJoinButton: {
		position: 'absolute',
		bottom: 9,
		right: 12.6,
		backgroundColor: '#fff',
		borderRadius: 16.2,
		paddingHorizontal: 12.6,
		paddingVertical: 4.5,
		borderWidth: 1,
		borderColor: '#8170FF',
	},
	videoJoinButtonText: {
		color: '#8170FF',
		fontWeight: '700',
		fontSize: 12.6,
	},
	tabScrollContent: {
		alignItems: 'center',
		paddingRight: 18,
	},
	// Additional comprehensive styles for complex content
	flexContainer: {
		flex: 1,
	},
	flexStartContainer: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	contentScrollContainer: {
		flex: 1,
		marginTop: -75, // Reduce aggressive negative margin
	},
	contentPadding: {
		paddingHorizontal: 16.2,
		paddingTop: 0,
	},
	contentScrollContainerAbout: {
		flex: 1,
		marginTop: -115, // More aggressive pull-up
	},
	contentPaddingAbout: {
		paddingHorizontal: 16.2,
		paddingTop: 0,
	},
	planContainer: {
		flex: 1,
		marginTop: -115,
	},
	planScrollContent: {
		flexGrow: 1,
		paddingHorizontal: 16.2,
		paddingTop: 0,
		paddingBottom: 36,
	},
	planTitle: {
		fontWeight: '700',
		fontSize: 14.4,
		marginBottom: 2,
		marginTop: 0,
	},
	planOptionWeekly: {
		borderWidth: 2,
		borderRadius: 16.2,
		padding: 12.6,
		marginBottom: 7.2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionMonthly: {
		borderWidth: 2,
		borderRadius: 16.2,
		padding: 12.6,
		marginBottom: 7.2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionAnnual: {
		borderWidth: 2,
		borderRadius: 16.2,
		padding: 12.6,
		marginBottom: 12.6,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planOptionTitle: {
		fontWeight: '600',
		fontSize: 13.5,
	},
	planOptionSubtitle: {
		fontSize: 12.6,
		marginTop: 1.8,
	},
	planOptionPrice: {
		fontSize: 12.6,
		marginTop: 5.4,
	},
	planOptionFeature: {
		fontSize: 12.6,
		marginTop: 1.8,
	},
	planRadioOuter: {
		width: 21.6,
		height: 21.6,
		borderRadius: 10.8,
		borderWidth: 2,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	planRadioInner: {
		width: 12.6,
		height: 12.6,
		borderRadius: 6.3,
	},
	subscribeButton: {
		borderRadius: 16.2,
		paddingVertical: 12.6,
		alignItems: 'center',
		marginTop: 0.9,
	},
	subscribeButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 14.4,
	},
	// Book session styles
	bookSessionContainer: {
		flex: 1,
		marginTop: -115,
	},
	bookSessionScrollContent: {
		flexGrow: 1,
		paddingHorizontal: 16.2,
		paddingTop: 18,
		paddingBottom: 36,
		justifyContent: 'flex-start',
	},
	sessionTitle: {
		fontWeight: '700',
		fontSize: 13.5,
		marginBottom: 2,
		marginTop: 0,
	},
	sessionCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 16.2,
		padding: 12.6,
		marginBottom: 12.6,
		backgroundColor: '#f7f7f7',
	},
	sessionCardHeader: {
		fontSize: 11.7,
		marginBottom: 5.4,
	},
	sessionInfoCard: {
		backgroundColor: '#fff',
		borderRadius: 14.4,
		padding: 12.6,
		alignItems: 'center',
		marginBottom: 7.2,
	},
	sessionInfoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 5.4,
	},
	sessionInfoTitle: {
		fontWeight: '600',
		fontSize: 12.6,
	},
	sessionInfoIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10.8,
	},
	sessionInfoIcon: {
		fontSize: 14.4,
	},
	sessionTimeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 4.5,
	},
	sessionTimeText: {
		fontSize: 10.8,
		width: 25.2,
		textAlign: 'center',
	},
	sessionCircle: {
		width: 25.2,
		height: 25.2,
		borderRadius: 12.6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timeSlotTitle: {
		fontWeight: '700',
		fontSize: 12.6,
		marginBottom: 5.4,
		marginTop: 3.6,
	},
	timeSlotContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 2.7,
		marginBottom: 3.6,
	},
	timeSlot: {
		borderWidth: 2,
		borderRadius: 10.8,
		paddingVertical: 7.2,
		paddingHorizontal: 12.6,
		marginRight: 7.2,
		marginBottom: 7.2,
	},
	timeSlotText: {
		fontWeight: '600',
		fontSize: 12.6,
	},
	summaryTitle: {
		fontWeight: '700',
		fontSize: 12.6,
		marginBottom: 5.4,
		marginTop: 3.6,
	},
	summaryCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 16.2,
		padding: 12.6,
		marginBottom: 14.4,
		backgroundColor: '#fff',
	},
	summaryRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 2.7,
	},
	summaryLabel: {
		fontSize: 12.6,
	},
	summaryValue: {
		fontWeight: '600',
		fontSize: 12.6,
	},
	summaryRowTotal: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	bookButton: {
		backgroundColor: '#8170FF',
		borderRadius: 16.2,
		paddingVertical: 12.6,
		alignItems: 'center',
		marginBottom: 0,
	},
	bookButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 14.4,
	},
	// Floating card styles
	floatingCard: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 328.5,
		marginHorizontal: 16.2,
		height: 135,
		borderRadius: 16.2,
		overflow: 'hidden',
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	floatingCardImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	floatingCardBadgeLeft: {
		position: 'absolute',
		top: 9,
		left: 9,
	},
	floatingCardBadgeRight: {
		position: 'absolute',
		top: 9,
		right: 9,
	},
	// Chat content styles
	chatContentContainer: {
		minHeight: 279,
		flex: 0.5,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		marginHorizontal: 16.2,
		marginBottom: 36,
	},
	chatFlexContainer: {
		flex: 1,
	},
	chatHeaderContainer: {
		alignItems: 'center',
		paddingVertical: 7.2,
	},
	chatUserContainer: {
		alignSelf: 'flex-start',
		marginLeft: 13.5,
	},
	chatUserName: {
		fontWeight: '600',
		fontSize: 15.3,
		color: '#3f3e3eff',
		marginTop: 16.2,
	},
	chatMessageRow: {
		justifyContent: 'flex-start',
		marginLeft: 31.5,
	},
	chatIcon: {
		marginRight: 7.2,
	},
	chatMessageCard: {
		backgroundColor: '#fcfcfcff',
		borderRadius: 9,
		padding: 10.8,
		marginBottom: 7.2,
		width: '95%',
		minHeight: 36,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	chatMessageText: {
		fontSize: 13.5,
		color: '#222',
		textAlign: 'left',
	},
	chatIconSpacing: {
		marginLeft: 3.6,
	},
	purpleBackground: {
		backgroundColor: '#8170FF',
	},
	selectedBorder: {
		borderColor: '#8170FF',
		backgroundColor: '#F6F3FF',
	},
	disabledButton: {
		backgroundColor: '#C7BFFF',
	},
	// Subscription plan styles
	planCard: {
		borderWidth: 2,
		borderRadius: 16.2,
		padding: 16.2,
		marginBottom: 9,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planCardDefault: {
		borderColor: '#e0e0e0',
		backgroundColor: '#fff',
	},
	planCardSelected: {
		borderColor: '#8170FF',
		backgroundColor: '#F6F3FF',
	},
	planContent: {
		flex: 1,
	},
	subscriptionPlanTitle: {
		fontWeight: '600',
		fontSize: 14.4,
	},
	subscriptionPlanPrice: {
		fontSize: 13.5,
		marginTop: 1.8,
	},
	subscriptionPlanFeatures: {
		fontSize: 13.5,
		marginTop: 7.2,
	},
	subscriptionPlanFeatureItem: {
		fontSize: 13.5,
		marginTop: 1.8,
	},
	radioButton: {
		width: 25.2,
		height: 25.2,
		borderRadius: 12.6,
		borderWidth: 2,
		borderColor: '#8170FF',
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioButtonInner: {
		width: 16.2,
		height: 16.2,
		borderRadius: 8.1,
	},
	radioButtonSelected: {
		backgroundColor: '#8170FF',
	},
	radioButtonUnselected: {
		backgroundColor: '#fff',
	},
	subscriptionButton: {
		borderRadius: 16.2,
		paddingVertical: 14.4,
		alignItems: 'center',
		marginTop: 0.9,
	},
	subscriptionButtonText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 16.2,
	},
	subscriptionStatusCard: {
		borderRadius: 18,
		padding: 16.2,
		backgroundColor: '#F6F3FF',
		borderWidth: 1,
		borderColor: '#D9D2FF',
		marginBottom: 16.2,
	},
	subscriptionStatusHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	subscriptionStatusTitle: {
		fontWeight: '700',
		fontSize: 15.3,
		color: '#2E2A59',
	},
	subscriptionStatusPlan: {
		fontWeight: '600',
		fontSize: 14.4,
		color: '#423A8B',
		marginBottom: 4,
	},
	subscriptionStatusBody: {
		fontSize: 13.5,
		color: '#423A8B',
		marginBottom: 12,
	},
	subscriptionExploreButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	subscriptionExploreText: {
		fontWeight: '600',
		fontSize: 13.5,
		color: '#5B4BFF',
	},
	subscriptionStatusMessage: {
		marginTop: 8,
		fontSize: 12.6,
		textAlign: 'center',
		color: '#4CAF50',
	},
	subscriptionErrorText: {
		marginTop: 8,
		fontSize: 12.6,
		textAlign: 'center',
		color: '#FF3B30',
	},
	// Date selection styles
	dateContainer: {
		flex: 1,
		marginTop: -170,
	},
	dateContentContainer: {
		flexGrow: 1,
		paddingHorizontal: 16.2,
		paddingTop: 27,
		paddingBottom: 45,
		justifyContent: 'flex-start',
	},
	dateTitle: {
		fontWeight: '700',
		fontSize: 14.4,
		color: '#222',
	},
	dateTitleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 9,
		marginTop: -25,
	},
	clockIcon: {
		marginLeft: 3.6,
		padding: 3.6,
		fontWeight: 'bold',
	},
	dateCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 16.2,
		padding: 14.4,
		marginBottom: 16.2,
		backgroundColor: '#f7f7f7',
	},
	dateDescription: {
		fontSize: 12.6,
		marginBottom: 7.2,
	},
	calendarContainer: {
		backgroundColor: '#fff',
		borderRadius: 14.4,
		padding: 14.4,
		alignItems: 'center',
		marginBottom: 9,
	},
	calendarHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 7.2,
	},
	calendarTitle: {
		fontWeight: '600',
		fontSize: 13.5,
	},
	calendarControls: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14.4,
	},
	// Video overlay styles
	videoOverlayContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 328.5,
		marginHorizontal: 16.2,
		height: 135,
		borderRadius: 16.2,
		overflow: 'hidden',
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	videoOverlayImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	videoControlLeft: {
		position: 'absolute',
		top: 9,
		left: 9,
	},
	videoControlRight: {
		position: 'absolute',
		top: 9,
		right: 9,
	},
	chatScrollContainer: {
		flex: 1,
	},
	chatScrollContentContainer: {
		alignItems: 'center',
		paddingVertical: 7.2,
	},
	chatEmptyContainer: {
		alignSelf: 'flex-start',
		marginLeft: 13.5,
	},
	chatEmptyPrompt: {
		fontWeight: '600',
		fontSize: 15.3,
		color: '#3f3e3eff',
		marginTop: 16.2,
	},
	chatEmptyIconRow: {
		justifyContent: 'flex-start',
		marginLeft: 31.5,
	},
	chatThumbIcon: {
		marginRight: 7.2,
	},
	messageCard: {
		backgroundColor: '#fcfcfcff',
		borderRadius: 9,
		padding: 10.8,
		marginBottom: 7.2,
		width: '95%',
		minHeight: 36,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	// Plan selection styles
	planScrollContainer: {
		flex: 1,
		paddingHorizontal: 16.2,
		paddingTop: 21.6,
		marginTop: -195,
	},
	planSectionTitle: {
		fontWeight: '700',
		fontSize: 15.3,
		marginBottom: 4,
	},
	planCardMarginBottom: {
		marginBottom: 16.2,
	},
	// Calendar navigation styles
	navArrowText: {
		fontSize: 16.2,
	},
	// Calendar day styles
	calendarDaysRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 5.4,
	},
	calendarDayText: {
		fontSize: 11.7,
		width: 28.8,
		textAlign: 'center',
	},
	calendarWeekRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 5.4,
	},
	calendarDateButton: {
		width: 28.8,
		height: 28.8,
		borderRadius: 14.4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	calendarDateDisabled: {
		opacity: 0.4,
	},
	// Booking section styles
	availableSlotsTitle: {
		fontWeight: '700',
		fontSize: 13.5,
		marginBottom: 2,
		marginTop: 1,
	},
	slotsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 2.7,
		marginBottom: 3.6,
	},
	slotText: {
		fontWeight: '600',
		fontSize: 14.4,
	},
	slotPriceText: {
		fontSize: 10.8,
		marginTop: 3.6,
	},
	slotTextSelected: {
		color: '#fff',
	},
	slotTextDefault: {
		color: '#222',
	},
	selectionTitle: {
		fontWeight: '700',
		fontSize: 13.5,
		marginBottom: 9,
		marginTop: 4.5,
	},
	selectionCard: {
		borderWidth: 1,
		borderColor: '#d1d1d1',
		borderRadius: 16.2,
		padding: 14.4,
		marginBottom: 18,
		backgroundColor: '#fff',
	},
	selectionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 3.6,
	},
	selectionLabel: {
		fontSize: 13.5,
	},
	selectionValue: {
		fontWeight: '600',
		fontSize: 13.5,
	},
	// Slot button styles
	slotButton: {
		borderWidth: 2,
		borderRadius: 10.8,
		paddingVertical: 9,
		paddingHorizontal: 16.2,
		marginRight: 9,
		marginBottom: 9,
	},
	slotButtonDefault: {
		borderColor: '#d1d1d1',
		backgroundColor: '#fff',
	},
	slotButtonSelected: {
		borderColor: '#8170FF',
		backgroundColor: '#8170FF',
	},
	// Additional margin utilities
	noMarginBottom: {
		marginBottom: 0,
	},
});

