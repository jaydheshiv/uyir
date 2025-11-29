// Jest setup file for React Native testing

import '@testing-library/jest-native/extend-expect';
import 'jest-fetch-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('./src/tests/__mocks__/AsyncStorage').default
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () =>
    require('./src/tests/__mocks__/react-native-vector-icons').default
);

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Alert.alert = jest.fn();
    return RN;
});

// Suppress console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock fetch globally
globalThis.fetch = jest.fn();

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
    return {
        ...jest.requireActual('@react-navigation/native'),
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            reset: jest.fn(),
            setOptions: jest.fn(),
        }),
        useRoute: () => ({
            params: {},
            key: 'test',
            name: 'Test',
        }),
        useFocusEffect: jest.fn(),
    };
});

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        Swipeable: View,
        DrawerLayout: View,
        State: {},
        ScrollView: View,
        Slider: View,
        Switch: View,
        TextInput: View,
        ToolbarAndroid: View,
        ViewPagerAndroid: View,
        DrawerLayoutAndroid: View,
        WebView: View,
        NativeViewGestureHandler: View,
        TapGestureHandler: View,
        FlingGestureHandler: View,
        ForceTouchGestureHandler: View,
        LongPressGestureHandler: View,
        PanGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        RawButton: View,
        BaseButton: View,
        RectButton: View,
        BorderlessButton: View,
        FlatList: View,
        gestureHandlerRootHOC: jest.fn(c => c),
        Directions: {},
    };
});

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: ({ children }) => children,
        SafeAreaView: ({ children }) => children,
        useSafeAreaInsets: () => inset,
        useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    };
});

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
    Calendar: 'Calendar',
    CalendarList: 'CalendarList',
    Agenda: 'Agenda',
}));

// Mock image picker
jest.mock('react-native-image-picker', () => ({
    launchCamera: jest.fn(),
    launchImageLibrary: jest.fn(),
}));

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Mock Livekit
jest.mock('@livekit/react-native', () => ({
    LiveKitRoom: 'LiveKitRoom',
    useRoom: jest.fn(),
    useParticipants: jest.fn(),
    useTracks: jest.fn(),
}));

// Set test environment timeout
jest.setTimeout(10000);
