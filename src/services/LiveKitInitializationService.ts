import { AndroidAudioTypePresets, AudioSession } from '@livekit/react-native';
import { NativeModules, Platform } from 'react-native';

class LiveKitInitializationService {
    private static initialized = false;
    private static initPromise: Promise<void> | null = null;

    static async initialize(): Promise<void> {
        if (this.initialized) {
            console.log('✅ LiveKit already initialized');
            return;
        }

        if (this.initPromise) {
            console.log('⏳ LiveKit initialization in progress, waiting...');
            return this.initPromise;
        }

        this.initPromise = this.performInitialization();
        return this.initPromise;
    }

    private static async performInitialization(): Promise<void> {
        try {
            console.log('🚀 COMPREHENSIVE LIVEKIT INITIALIZATION STARTING...');

            if (Platform.OS === 'android') {
                // Step 1: Try custom native module
                await this.tryCustomNativeSetup();

                // Step 2: Try direct native module access
                await this.tryDirectNativeSetup();

                // Step 3: Force audio configuration
                await this.configureAudioSession();

                // Step 4: Validate setup
                await this.validateSetup();
            }

            this.initialized = true;
            console.log('✅ LIVEKIT INITIALIZATION COMPLETED SUCCESSFULLY!');
        } catch (error) {
            console.error('❌ LIVEKIT INITIALIZATION FAILED:', error);
            // Don't throw - allow app to continue
        } finally {
            this.initPromise = null;
        }
    }

    private static async tryCustomNativeSetup(): Promise<void> {
        try {
            const { LiveKitSetupModule } = NativeModules;
            if (LiveKitSetupModule) {
                console.log('🔧 Trying custom native setup...');
                const result = await LiveKitSetupModule.initializeLiveKit();
                console.log('🎯 Custom setup result:', result);
            } else {
                console.log('⚠️ Custom module not available');
            }
        } catch (error) {
            console.log('⚠️ Custom native setup failed:', error);
        }
    }

    private static async tryDirectNativeSetup(): Promise<void> {
        try {
            // First try the correct class name from the error logs
            const LiveKitModule = NativeModules.LivekitReactNativeModule;
            if (LiveKitModule && LiveKitModule.setup) {
                console.log('🔧 Trying direct native setup...');
                await LiveKitModule.setup();
                console.log('🎯 Direct setup completed');
                return;
            }

            // Try alternative module names
            const altModule = NativeModules.LiveKitReactNative;
            if (altModule && altModule.setup) {
                console.log('🔧 Trying alternative direct setup...');
                await altModule.setup();
                console.log('🎯 Alternative direct setup completed');
                return;
            }

            console.log('⚠️ Direct module not available');
        } catch (error) {
            console.log('⚠️ Direct native setup failed:', error);
        }
    }

    private static async configureAudioSession(): Promise<void> {
        try {
            console.log('🔊 Configuring audio session...');
            await AudioSession.configureAudio({
                android: {
                    preferredOutputList: ['speaker', 'earpiece'],
                    audioTypeOptions: AndroidAudioTypePresets.communication,
                },
            });
            console.log('🎯 Audio session configured');
        } catch (error) {
            console.error('❌ Audio configuration failed:', error);
            throw error;
        }
    }

    private static async validateSetup(): Promise<void> {
        try {
            console.log('🔍 Validating LiveKit setup...');
            // Try to access AudioSession to see if it works
            const config = await AudioSession.configureAudio({
                android: {
                    preferredOutputList: ['speaker'],
                    audioTypeOptions: AndroidAudioTypePresets.communication,
                },
            });
            console.log('✅ Validation successful');
        } catch (error) {
            console.warn('⚠️ Validation failed:', error);
        }
    }

    static isInitialized(): boolean {
        return this.initialized;
    }

    static reset(): void {
        this.initialized = false;
        this.initPromise = null;
        console.log('🔄 LiveKit initialization reset');
    }
}

export default LiveKitInitializationService;