import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'OnboardingScreen1'>;

const OnboardingScreen1: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            {/* Logo at the top */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/uyir-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            {/* Main Content */}
            <View style={styles.content}>
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <SecondaryButton
                        title="Log in"
                        onPress={() => navigation.navigate('LoginFlow')}
                        style={styles.loginButtonSpacing}
                    />
                    <PrimaryButton
                        title="Sign Up"
                        onPress={() => navigation.navigate('SignupFlow')}
                        style={styles.signupButtonSpacing}
                    />
                </View>

                {/* Continue as Guest */}
                <TouchableOpacity style={styles.guestButton} onPress={() => { }}>
                    <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignSelf: 'center',
        width: '100%',
        maxWidth: 393,
    },
    logoContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 224,
        height: 76,
    },
    content: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 345,
        marginBottom: 0,
    },
    guestButton: {
        marginTop: 32,
        marginBottom: 32,
        backgroundColor: 'transparent',
    },
    guestButtonText: {
        color: '#8170FF',
        fontSize: 16,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    loginButtonSpacing: {
        marginBottom: 16,
    },
    signupButtonSpacing: {
        marginBottom: 0,
    },
});

export default OnboardingScreen1;
