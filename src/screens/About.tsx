
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomBottomNav from '../components/CustomBottomNav';
import { useNavigation } from '@react-navigation/native';

const ABOUT_TEXT = `Uyir appears to be a mobile application centered around personal expression and social connection. Users can create and manage their own profiles and personalized "Avatars," which seem to be a core element of their digital identity within the app. A significant feature involves the creation and sharing of "Memory Cards," suggesting a focus on user-generated content like photos, videos, or text. The app facilitates user interactions through "Connections" and a "Memory Sharing Flow," indicating social networking capabilities. Furthermore, "Uyir" includes standard app functionalities such as user authentication (login, account creation, email verification), comprehensive "Basic user settings page flow" for managing profiles and preferences (including language and dark theme), and dedicated sections for "Feedback Page" and "Support Page," alongside a "Privacy Policy" and "About" section. The presence of an "Upgrade" button and "Basic tier user avatar interaction flow" hints at potential tiered access or premium features within the application.`;

const About: React.FC = () => {
	const navigation = useNavigation();
	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.container}>
				{/* Header */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color="#222" />
				</TouchableOpacity>
				<Text style={styles.title}>About</Text>

				{/* Content */}
				<Text style={styles.aboutText}>{ABOUT_TEXT}</Text>
			</ScrollView>
			<View style={styles.bottomNavWrapper}>
				<CustomBottomNav />
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
	},
	container: {
		padding: 24,
		backgroundColor: '#fff',
		flexGrow: 1,
	},
	backBtn: {
		marginBottom: 3,
		marginTop: 30,
		alignSelf: 'flex-start',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#222',
		marginBottom: 24,
		marginTop: 16,
		fontFamily: 'Outfit-Bold',
	},
	aboutText: {
		fontSize: 14.5,
		lineHeight: 26,
		color: '#0A0A0A',
		marginBottom: 32,
	},
	bottomNavWrapper: {
		marginBottom: 25,
	},
});

export default About;
