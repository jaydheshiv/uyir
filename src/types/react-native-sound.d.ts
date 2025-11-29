declare module 'react-native-sound' {
    type SoundCallback = (error?: Error | null) => void;

    export default class Sound {
        constructor(filename: string, basePath?: string | null, onLoad?: SoundCallback);
        static setCategory(
            category: 'Ambient' | 'SoloAmbient' | 'Playback' | 'Record' | 'PlayAndRecord' | string,
            mixWithOthers?: boolean,
        ): void;
        play(onEnd?: () => void): void;
        stop(onStop?: () => void): void;
        release(): void;
        setNumberOfLoops(value: number): void;
        setVolume(value: number): void;
    }
}
