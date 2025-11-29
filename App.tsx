import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto'; // ✅ Required for ImageKit SDK in React Native 16+
import AppNavigator from './src/navigation/AppNavigator';
import LiveKitInitializationService from './src/services/LiveKitInitializationService';
import { ProfileProvider } from './src/store/ProfileContext';
import { ThemeProvider } from './src/store/ThemeContext';

export default function App() {
  useEffect(() => {
    // Initialize LiveKit using our comprehensive service
    const initializeLiveKit = async () => {
      try {
        console.log('🚀 Starting comprehensive LiveKit initialization service...');

        await LiveKitInitializationService.initialize();
        console.log('✅ LiveKit initialization completed successfully!');
      } catch (error) {
        console.error('❌ Critical error in LiveKit initialization service:', error);
        console.log('📱 App will continue, but video calls may have significant limitations');
      }
    };

    // Add a small delay to ensure app is fully loaded
    const timer = setTimeout(initializeLiveKit, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <ProfileProvider>
        <AppNavigator />
      </ProfileProvider>
    </ThemeProvider>
  );
}




