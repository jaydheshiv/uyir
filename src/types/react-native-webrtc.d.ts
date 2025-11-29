declare module '@livekit/react-native-webrtc' {
    interface MediaTrackConstraints {
        deviceId?: string;
        groupId?: string;
        mandatory?: Record<string, unknown>;
        optional?: Array<Record<string, unknown>>;
        [key: string]: unknown;
    }

    export interface MediaStreamConstraints {
        audio?: boolean | MediaTrackConstraints;
        video?: boolean | MediaTrackConstraints;
    }

    export interface MediaStreamTrack {
        id: string;
        kind: string;
        enabled: boolean;
        muted?: boolean;
        stop(): void;
        addEventListener?(type: string, listener: (...args: unknown[]) => void): void;
        removeEventListener?(type: string, listener: (...args: unknown[]) => void): void;
    }

    export interface MediaStream {
        id: string;
        active?: boolean;
        getTracks(): MediaStreamTrack[];
        getAudioTracks(): MediaStreamTrack[];
        getVideoTracks(): MediaStreamTrack[];
        release(): void;
        removeTrack(track: MediaStreamTrack): void;
    }

    export const mediaDevices: {
        getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
        enumerateDevices(): Promise<Array<Record<string, unknown>>>;
    };

    export const MediaStream: {
        new(tracks?: MediaStreamTrack[]): MediaStream;
    };

    export const MediaStreamTrack: {
        new(): MediaStreamTrack;
    };
}
