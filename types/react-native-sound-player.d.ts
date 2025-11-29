declare module 'react-native-sound-player' {
    type FinishedPlayingEvent = {
        success: boolean;
    };

    type EventTypes = 'FinishedPlaying' | 'FinishedLoading' | 'FinishedLoadingFile' | 'FinishedLoadingURL';

    type EventSubscription = {
        remove?: () => void;
    };

    interface SoundPlayerType {
        playUrl(url: string): void;
        playSoundFile(name: string, type: string): void;
        loadUrl(url: string): void;
        stop(): void;
        pause(): void;
        resume(): void;
        addEventListener(event: EventTypes, callback: (event: FinishedPlayingEvent) => void): EventSubscription;
    }

    const SoundPlayer: SoundPlayerType;
    export default SoundPlayer;
}
