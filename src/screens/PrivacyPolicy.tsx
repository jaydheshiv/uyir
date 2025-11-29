
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';

const PRIVACY_TEXT = `At UYIR, your privacy is our utmost priority, and we are committed to being transparent about how we handle your information. This policy details the various categories of data we collect when you use our app – including the personal information you provide for account setup and profile creation, such as your name, email, and date of birth. We also automatically gather usage data about your device and how you interact with our features, like your activities with 'Memory Cards' and 'Avatars,' to understand user behavior. With your explicit consent, we may collect location information to enhance specific app functionalities. We utilize all this information primarily to provide, personalize, and continually enhance your experience, ensuring the app functions smoothly, securely, and is tailored to your preferences. This includes managing your account, enabling social interactions, offering customer support, and improving our services. Rest assured, your data is protected with robust security measures designed to prevent unauthorized access. We only share your information when strictly necessary with trusted third-party service providers (such as for hosting, analytics, or communication), for legal compliance.`;

const PrivacyPolicy: React.FC = () => {
	const navigation = useNavigation();
	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>Privacy Policy</Text>

				{/* Content */}
				<Text style={styles.privacyText}>{PRIVACY_TEXT}</Text>
			</ScrollView>
			<View style={styles.bottomNavContainer}>
				<CustomBottomNav />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 21.6,
		backgroundColor: '#fff',
		flexGrow: 1,
	},
	backBtn: {
		marginBottom: 2.7,
		marginTop: 27,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 25.2,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 21.6,
		marginTop: 14.4,
		fontFamily: 'Outfit-Bold',
	},
	privacyText: {
		fontSize: 13.1,
		lineHeight: 23.4,
		color: '#0A0A0A',
		marginBottom: 28.8,
	},
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	bottomNavContainer: {
		marginBottom: 31.5,
	},
});

export default PrivacyPolicy;

