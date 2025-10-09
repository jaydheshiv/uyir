import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const BACKGROUND_IMAGE = { uri: 'https://api.builder.io/api/v1/image/assets/TEMP/fd40923cd4ebabef5fdaa8b6fc719bae826a9b92?width=786' };

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

type Walkthrough2ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Walkthrough2'>;

const Walkthrough2 = () => {
	const navigation = useNavigation<Walkthrough2ScreenNavigationProp>();

	// Helper function for active dot (active index is 1 for Walkthrough2)
	const isActive = (index: number) => index === 1;

	return (
		<ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
			{/* Gradient Overlay */}
			<View style={styles.overlay} />

			{/* Skip Button */}
			<TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('OnboardingScreen1')}>
				<Text style={styles.skipText}>Skip</Text>
			</TouchableOpacity>

			{/* Timeline Cards and SVG */}
			<View style={styles.timelineContainer}>
				<Svg width={width * 0.8} height={80} style={styles.timelineSvg}>
					<Path
						d="M40 60 L110 40 L180 60 L250 40"
						stroke="rgba(255,255,255,0.3)"
						strokeWidth={2}
						fill="none"
					/>
					<Circle cx="70" cy="55" r="2" fill="rgba(255,255,255,0.5)" />
					<Circle cx="140" cy="55" r="2" fill="rgba(255,255,255,0.5)" />
					<Circle cx="210" cy="45" r="2" fill="rgba(255,255,255,0.5)" />
				</Svg>
				<View style={styles.timelineCards}>
					{/* Camera Card */}
					<View style={styles.timelineCard}>
						<Feather name="camera" size={32} color="rgba(255,255,255,0.7)" />
					</View>
					{/* Birthday Card */}
					<View style={[styles.timelineCard, styles.birthdayCardMargin]}>
						<Feather name="gift" size={32} color="rgba(255,255,255,0.7)" />
					</View>
					{/* Profile Card (featured) */}
					<View style={styles.profileCard}>
						<View style={styles.profileImage} />
						{/* Party hat (triangle) */}
						<View style={styles.partyHat} />
					</View>
					{/* Additional Card */}
					<View style={styles.timelineCard}>
						<View style={styles.circleDot} />
					</View>
				</View>
			</View>

			{/* Main Content */}
			<View style={styles.content}>
				<Text style={styles.title}>Create your personal timeline</Text>
				<Text style={styles.subtitle}>
					Capture moments and emotions to build a personal timeline that grows with you
				</Text>
				{/* Page Indicators */}
				<View style={styles.pageIndicatorRow}>
					<View style={styles.pageIndicator}>
						<View style={[styles.pageDot, !isActive(0) && styles.pageDotInactive]} />
						<View style={[styles.pageDot, isActive(1) ? null : styles.pageDotInactive]} />
						<View style={[styles.pageDot, !isActive(2) && styles.pageDotInactive]} />
					</View>
				</View>
				{/* Continue Button */}
				<TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Walkthrough3')}>
					<Text style={styles.continueButtonText}>Continue</Text>
				</TouchableOpacity>
			</View>
		</ImageBackground>
	);
};

const styles = StyleSheet.create({
	background: { flex: 1, justifyContent: 'flex-end' },
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.3)',
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
	timelineContainer: {
		position: 'absolute',
		top: '35%',
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 5,
	},
	timelineSvg: {
		position: 'absolute',
		top: 0,
		left: 0,
	},
	timelineCards: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		width: width * 0.8,
		marginTop: 32,
	},
	timelineCard: {
		width: 64,
		height: 64,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 4,
	},
	profileCard: {
		width: 80,
		height: 96,
		backgroundColor: 'rgba(255,255,255,0.25)',
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: 8,
		marginHorizontal: 4,
		position: 'relative',
	},
	profileImage: {
		width: '100%',
		height: 48,
		backgroundColor: '#a78bfa',
		borderRadius: 16,
		marginBottom: 8,
	},
	partyHat: {
		position: 'absolute',
		top: -8,
		left: '50%',
		marginLeft: -8,
		width: 0,
		height: 0,
		borderLeftWidth: 8,
		borderRightWidth: 8,
		borderBottomWidth: 16,
		borderLeftColor: 'transparent',
		borderRightColor: 'transparent',
		borderBottomColor: '#34d399',
	},
	circleDot: {
		width: 24,
		height: 24,
		backgroundColor: 'rgba(255,255,255,0.5)',
		borderRadius: 12,
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
	},
	subtitle: {
		color: '#fff',
		fontSize: 16,
		opacity: 0.9,
		marginBottom: 24,
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
	birthdayCardMargin: {
		marginTop: -16,
	},
});

export default Walkthrough2;
