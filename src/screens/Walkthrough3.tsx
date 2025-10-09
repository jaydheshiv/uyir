import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const BACKGROUND_IMAGE = { uri: 'https://api.builder.io/api/v1/image/assets/TEMP/3393aabd72af06c819d2ddafc11e7613855f2476?width=786' };

type RootStackParamList = {
	Splash: undefined;
	Walkthrough1: undefined;
	Walkthrough2: undefined;
	Walkthrough3: undefined;
	OnboardingScreen1: undefined;
	Login: undefined;
	SignUp: undefined;
	Home: undefined;
	BasicDetails: undefined;
};

type Walkthrough3ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Walkthrough3'>;

const Walkthrough3 = () => {
	const navigation = useNavigation<Walkthrough3ScreenNavigationProp>();

	// Helper function for active dot (active index is 2 for Walkthrough3)
	const isActive = (index: number) => index === 2;

	return (
		<ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
			{/* Gradient Overlay */}
			<View style={styles.overlay} />

			{/* Skip Button */}
			<TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('OnboardingScreen1')}>
				<Text style={styles.skipText}>Skip</Text>
			</TouchableOpacity>

			{/* Main Content */}
			<View style={styles.content}>
				<Text style={styles.title}>Unlock the Pro experience</Text>
				<Text style={styles.subtitle}>
					Explore avatars of friends and creators, dive into shared reflections, and connect through their emotional journeys.
				</Text>
				{/* Page Indicators */}
				<View style={styles.pageIndicatorRow}>
					<View style={styles.pageIndicator}>
						<View style={[styles.pageDot, !isActive(0) && styles.pageDotInactive]} />
						<View style={[styles.pageDot, !isActive(1) && styles.pageDotInactive]} />
						<View style={[styles.pageDot, isActive(2) ? null : styles.pageDotInactive]} />
					</View>
				</View>
				{/* Continue Button */}
				<TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('OnboardingScreen1')}>
					<Text style={styles.continueButtonText}>Continue</Text>
				</TouchableOpacity>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: 'flex-end'
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	skipButton: {
		position: 'absolute',
		top: 64,
		right: 24,
		zIndex: 20,
	},
	skipText: {
		color: '#fff',
		fontSize: 15,
		fontWeight: '500',
		opacity: 0.9,
	},
	content: {
		paddingHorizontal: 24,
		paddingBottom: 32,
		zIndex: 20,
		marginTop: 'auto',
	},
	title: {
		color: '#fff',
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 12,
		maxWidth: 282,
	},
	subtitle: {
		color: '#fff',
		fontSize: 16,
		opacity: 0.9,
		marginBottom: 24,
		maxWidth: 304,
		lineHeight: 22,
	},
	pageIndicatorRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginBottom: 16,
	},
	pageIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	pageDot: {
		width: 18,
		height: 5,
		borderRadius: 3,
		backgroundColor: '#fff',
		marginHorizontal: 2,
	},
	pageDotInactive: {
		backgroundColor: 'rgba(255,255,255,0.5)',
	},
	continueButton: {
		backgroundColor: '#8170FF',
		borderRadius: 24,
		paddingVertical: 14,
		alignItems: 'center',
		marginBottom: 16,
		shadowColor: '#8170FF',
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
	},
	continueButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default Walkthrough3;
